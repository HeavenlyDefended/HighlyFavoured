import dotenv from "dotenv";

dotenv.config();

export async function testGitHubConnection() {
  console.log("Testing GitHub connection...");

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token) {
    console.log("❌ Missing GITHUB_TOKEN");
    return;
  }

  if (!owner) {
    console.log("❌ Missing GITHUB_OWNER");
    return;
  }

  if (!repo) {
    console.log("❌ Missing GITHUB_REPO");
    return;
  }

  console.log("✅ GitHub settings loaded");
  console.log("Owner:", owner);
  console.log("Repo:", repo);

  return true;
}
