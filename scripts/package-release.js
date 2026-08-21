#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILES = ["cameras.json", "cameras.csv"];
const METADATA_FILE = "release-metadata.json";

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function repositoryName() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

  try {
    const remote = git("config", "--get", "remote.origin.url");
    const match = remote.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function fileDetails(filePath) {
  const contents = fs.readFileSync(filePath);
  return {
    name: path.basename(filePath),
    bytes: contents.length,
    sha256: crypto.createHash("sha256").update(contents).digest("hex"),
  };
}

function main() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const version = process.env.RELEASE_VERSION || packageJson.version;
  const tag = process.env.RELEASE_TAG || `v${version}`;
  const commitSha = process.env.GITHUB_SHA || git("rev-parse", "HEAD");
  const commitDate = git("show", "-s", "--format=%cI", commitSha);
  const repository = repositoryName();
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const outputPath = path.resolve(ROOT, process.env.RELEASE_ARCHIVE || "cameras.zip");
  const dataPaths = DATA_FILES.map((file) => path.join(ROOT, "data", file));

  for (const dataPath of dataPaths) {
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Missing release input: ${path.relative(ROOT, dataPath)}. Run npm run build first.`);
    }
  }

  const cameras = JSON.parse(fs.readFileSync(dataPaths[0], "utf8"));
  if (!Array.isArray(cameras)) {
    throw new Error("data/cameras.json must contain an array");
  }

  const metadata = {
    schema_version: 1,
    version,
    tag,
    commit_sha: commitSha,
    commit_date: commitDate,
    generated_at: process.env.RELEASE_GENERATED_AT || new Date().toISOString(),
    repository,
    release_url: repository ? `${serverUrl}/${repository}/releases/tag/${encodeURIComponent(tag)}` : null,
    camera_count: cameras.length,
    files: dataPaths.map(fileDetails),
  };

  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), "cctv-camera-release-"));
  try {
    for (const dataPath of dataPaths) {
      fs.copyFileSync(dataPath, path.join(stagingDir, path.basename(dataPath)));
    }
    fs.writeFileSync(
      path.join(stagingDir, METADATA_FILE),
      `${JSON.stringify(metadata, null, 2)}\n`
    );

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.rmSync(outputPath, { force: true });
    execFileSync("zip", ["-9", "-q", outputPath, ...DATA_FILES, METADATA_FILE], {
      cwd: stagingDir,
    });
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }

  console.log(`Created ${path.relative(ROOT, outputPath)} with ${cameras.length} cameras.`);
}

try {
  main();
} catch (error) {
  console.error(`Failed to package release: ${error.message}`);
  process.exit(1);
}