import cron from "node-cron";
import dotenv from "dotenv";
import { generateProduct } from "./generateProduct.js";
import { uploadToGithub, testGitHubConnection } from "./githubUpload.js";
import { publishToGumroad } from "./publishToGumroad.js";

dotenv.config();

let isRunning = false;

async function runAutomation() {
  if (isRunning) {
    console.log("⚠️ Automation already running, skipping...");
    return;
  }
  
  isRunning = true;
  console.log(`\n🕐 [${new Date().toISOString()}] Running automation...`);
  
  try {
    // Test GitHub connection first
    await testGitHubConnection();
    
    // Generate a random product type
    const types = ["ebook", "html_tool", "prompt_pack", "checklist"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    console.log(`📦 Generating product type: ${randomType}`);
    
    // Generate the product
    const product = await generateProduct(randomType);
    
    if (!product || !product.success) {
      console.error("❌ Product generation failed");
      return;
    }
    
    console.log(`✅ Product generated: ${product.title}`);
    console.log(`   📄 File: ${product.filePath}`);
    console.log(`   💰 Suggested price: $${product.price}`);
    
    // Upload to GitHub
    const githubUrl = await uploadToGithub(product);
    if (githubUrl) {
      console.log(`📁 GitHub URL: ${githubUrl}`);
    }
    
    // Publish to Gumroad (optional - comment out if not ready)
    try {
      const gumroadResult = await publishToGumroad(
        product.filePath,
        product.title,
        product.description || "AI-generated digital product",
        product.price || 4.99
      );
      if (gumroadResult) {
        console.log(`💰 Published to Gumroad!`);
      }
    } catch (gumroadError) {
      console.log(`⚠️ Gumroad publish skipped: ${gumroadError.message}`);
    }
    
    console.log(`✅ Automation complete at ${new Date().toISOString()}\n`);
    
  } catch (error) {
    console.error("❌ Automation error:", error.message);
  } finally {
    isRunning = false;
  }
}

// Schedule: Run every 12 hours (at minute 0)
cron.schedule("0 */12 * * *", runAutomation, {
  timezone: "UTC"
});

// Also run once immediately on start
console.log("🕐 NEO Automation Scheduler Started");
console.log(`📦 Repository: HeavenlyDefended/HighlyFavoured`);
console.log(`⏰ Schedule: Every 12 hours (at minute 0)`);
console.log(`🔧 First run starting now...\n`);

// Run immediately
runAutomation();

// Keep process alive
process.stdin.resume();
