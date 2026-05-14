#!/usr/bin/env node

import dotenv from "dotenv";
import { exec } from "child_process";
import { testGitHubConnection } from "./githubUpload.js";

dotenv.config();

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ███╗   ██╗███████╗ ██████╗                                 ║
║   ████╗  ██║██╔════╝██╔═══██╗                                ║
║   ██╔██╗ ██║█████╗  ██║   ██║                                ║
║   ██║╚██╗██║██╔══╝  ██║   ██║                                ║
║   ██║ ╚████║███████╗╚██████╔╝                                ║
║   ╚═╝  ╚═══╝╚══════╝ ╚═════╝                                 ║
║                                                              ║
║   🤖 Autonomous AI Content Business                         ║
║   📦 GitHub: HeavenlyDefended/HighlyFavoured                ║
║   💳 Wallet: ${process.env.NEO_WALLET?.slice(0, 10)}...                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// Test GitHub connection on startup
console.log("🔌 Checking connections...\n");
await testGitHubConnection();

const args = process.argv.slice(2);

if (args.includes("--neo")) {
  // Run original NEO core
  console.log("\n🔄 Starting NEO core agent...\n");
  exec("node dist/index.js --run", { stdio: "inherit" });
  
} else if (args.includes("--scheduler")) {
  // Run only the automation scheduler
  console.log("\n🕐 Starting automation scheduler...\n");
  await import("./scheduler.js");
  
} else if (args.includes("--batch")) {
  // Run a single batch immediately
  console.log("\n📦 Running batch generation...\n");
  const { generateProduct } = await import("./generateProduct.js");
  const types = ["ebook", "html_tool", "prompt_pack", "checklist"];
  
  for (const type of types) {
    await generateProduct(type);
  }
  console.log("\n✅ Batch generation complete!");
  console.log("📁 Check your GitHub: https://github.com/HeavenlyDefended/HighlyFavoured/tree/main/neo-products");
  
} else if (args.includes("--test-github")) {
  // Just test GitHub connection
  console.log("\n🔌 Testing GitHub connection...\n");
  await testGitHubConnection();
  
} else {
  // Default: Show menu
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Available Commands                                          ║
╚══════════════════════════════════════════════════════════════╝

  npm start -- --neo         Start NEO core agent (blockchain wallet)
  npm start -- --scheduler   Start automated product scheduler
  npm start -- --batch       Run one batch generation immediately
  npm start -- --test-github Test GitHub connection only

Examples:
  npm run neo
  npm run scheduler
  npm run batch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Your GitHub Repository:
   https://github.com/HeavenlyDefended/HighlyFavoured

📁 Products will be uploaded to: neo-products/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Current Status:
   ✅ OpenAI API: ${process.env.OPENAI_API_KEY ? "Connected" : "Missing"}
   ✅ Gumroad: ${process.env.GUMROAD_ACCESS_TOKEN ? "Connected" : "Not configured"}
   ✅ GitHub: ${process.env.GITHUB_TOKEN ? "Connected" : "Missing"}
   📦 Repo: ${process.env.GITHUB_REPO || "HeavenlyDefended/HighlyFavoured"}
`);
}
