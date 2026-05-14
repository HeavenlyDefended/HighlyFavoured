import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OUTPUT_DIR = path.join(process.cwd(), "output");

// Ensure output directory exists
await fs.ensureDir(OUTPUT_DIR);

// Product type configurations
const PRODUCT_TYPES = {
  ebook: {
    folder: "ebooks",
    extension: ".md",
    prompt: (topic) => `Create a short but valuable 5-page ebook about "${topic}". 
Format as markdown with:
# Title
## Introduction
## Chapter 1: [Key Concept]
## Chapter 2: [Key Concept]  
## Chapter 3: [Key Concept]
## Conclusion
## Bonus: Actionable checklist
Make it practical, insightful, and ready to publish.`,
    price: 4.99
  },
  html_tool: {
    folder: "web-tools",
    extension: ".html",
    prompt: (topic) => `Create a complete, self-contained HTML/CSS/JS tool for "${topic}".
Requirements:
- Dark theme with modern UI
- Responsive design (works on mobile/desktop)
- Uses free APIs where appropriate
- Includes error handling
- Has loading states
- Professional styling with CSS gradients/shadows
Return ONLY the HTML code, no explanations.`,
    price: 9.99
  },
  prompt_pack: {
    folder: "prompts",
    extension: ".json",
    prompt: (topic) => `Create a JSON array of 10-15 high-quality AI prompts about "${topic}".
Each prompt should be:
- Specific and actionable
- Ready to copy-paste into ChatGPT/Claude
- Designed to generate valuable output

Format:
[
  {
    "title": "Prompt title",
    "prompt": "The actual prompt text...",
    "use_case": "What this helps with"
  }
]

Return ONLY valid JSON.`,
    price: 3.99
  },
  checklist: {
    folder: "checklists",
    extension: ".md",
    prompt: (topic) => `Create an actionable checklist for "${topic}".
Format as markdown with:
# ${topic} Checklist
## Quick Start (3 items)
## Essential Steps (5-7 items)
## Pro Tips (3-5 items)
## Common Mistakes to Avoid
## Resources

Make it practical and immediately useful.`,
    price: 2.99
  }
};

export async function generateProduct(type = "ebook", topic = null) {
  const productType = PRODUCT_TYPES[type];
  if (!productType) {
    throw new Error(`Unknown product type: ${type}. Available: ${Object.keys(PRODUCT_TYPES).join(", ")}`);
  }

  // Generate a topic if not provided
  const finalTopic = topic || await generateTopic();
  
  console.log(`📚 Generating ${type} about: ${finalTopic}`);
  
  const prompt = productType.prompt(finalTopic);
  
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert content creator who creates high-quality, sellable digital products. Your work is professional, valuable, and ready to publish.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    let content = response.choices[0].message.content;
    
    // Clean up markdown code blocks for HTML files
    if (type === "html_tool") {
      content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Create filename with timestamp
    const timestamp = Date.now();
    const slug = finalTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    const filename = `${slug}-${timestamp}${productType.extension}`;
    const filepath = path.join(OUTPUT_DIR, productType.folder, filename);
    
    // Ensure subdirectory exists
    await fs.ensureDir(path.dirname(filepath));
    
    // Save the product
    await fs.writeFile(filepath, content);
    
    console.log(`✅ Product generated: ${filepath}`);
    console.log(`📄 File size: ${(content.length / 1024).toFixed(1)} KB`);
    
    return {
      success: true,
      type,
      title: finalTopic,
      description: `${type} about ${finalTopic}`,
      filePath: filepath,
      filename,
      price: productType.price,
      content: content.substring(0, 500) + "...", // Preview
    };
    
  } catch (error) {
    console.error(`❌ Generation failed:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function generateTopic() {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Generate ONE specific, trending, sellable digital product topic about African travel, crypto, AI tools, or personal development. 
Return ONLY the topic, no explanations or quotes. Examples:
- "The Ultimate Safari Planning Guide for First-Timers"
- "African Cryptocurrency Investment Basics"
- "10 AI Prompts for Travel Content Creators"
- "Zanzibar Digital Nomad Survival Kit"`,
      },
    ],
    temperature: 0.9,
  });
  
  return response.choices[0].message.content.trim();
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];
const type = args[1];
const topic = args[2];

if (command === "generate") {
  generateProduct(type, topic).then(result => {
    if (result.success) {
      console.log(`\n📦 Product ready for publishing!`);
      console.log(`   Price suggestion: $${result.price}`);
      console.log(`   File: ${result.filePath}`);
    }
  });
} else if (command === "list-types") {
  console.log("\n📚 Available product types:");
  Object.entries(PRODUCT_TYPES).forEach(([key, value]) => {
    console.log(`   - ${key}: $${value.price} (${value.folder}/)`);
  });
} else if (command === "batch") {
  // Generate one of each type
  const types = ["ebook", "html_tool", "prompt_pack", "checklist"];
  Promise.all(types.map(t => generateProduct(t))).then(results => {
    console.log(`\n✅ Generated ${results.filter(r => r.success).length}/${types.length} products`);
  });
} else {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  NEO Product Generator                                   ║
╚══════════════════════════════════════════════════════════╝

Usage:
  node src/generateProduct.js generate <type> [topic]
  node src/generateProduct.js list-types
  node src/generateProduct.js batch

Types:
  ebook        - 5-page ebook ($${PRODUCT_TYPES.ebook.price})
  html_tool    - Interactive web tool ($${PRODUCT_TYPES.html_tool.price})
  prompt_pack  - AI prompt collection ($${PRODUCT_TYPES.prompt_pack.price})
  checklist    - Actionable checklist ($${PRODUCT_TYPES.checklist.price})

Examples:
  node src/generateProduct.js generate ebook
  node src/generateProduct.js generate html_tool "Ethereum gas fee calculator"
  node src/generateProduct.js generate prompt_pack "crypto trading strategies"
  node src/generateProduct.js batch
`);
}
