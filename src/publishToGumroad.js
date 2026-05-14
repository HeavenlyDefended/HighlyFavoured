import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const GUMROAD_API = 'https://api.gumroad.com/v2';
const ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;

export async function publishToGumroad(filePath, title, description, price = 4.99) {
  if (!ACCESS_TOKEN) {
    console.error('❌ GUMROAD_ACCESS_TOKEN not set in .env');
    return null;
  }

  const form = new FormData();
  form.append('access_token', ACCESS_TOKEN);
  form.append('title', title);
  form.append('description', description);
  form.append('price', price);
  form.append('file', fs.createReadStream(filePath));
  form.append('custom_permalink', title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40));
  form.append('tags[]', ['digital product', 'ai generated', 'travel', 'crypto']);

  try {
    console.log(`📤 Publishing to Gumroad: ${title}`);
    const response = await axios.post(`${GUMROAD_API}/products`, form, {
      headers: { ...form.getHeaders() }
    });
    
    if (response.data.success) {
      console.log(`✅ Published! URL: ${response.data.product.short_url}`);
      console.log(`💰 Price: $${price}`);
      return response.data.product;
    } else {
      console.error('❌ Gumroad error:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Publish failed:', error.response?.data || error.message);
    return null;
  }
}

// CLI interface
const args = process.argv.slice(2);
const filePath = args[0];
const title = args[1];
const description = args[2] || 'AI-generated digital product';
const price = parseFloat(args[3]) || 4.99;

if (filePath && title) {
  publishToGumroad(filePath, title, description, price);
} else {
  console.log(`
Usage:
  node src/publishToGumroad.js <filepath> <title> [description] [price]

Example:
  node src/publishToGumroad.js output/ebooks/my-ebook.md "Travel Guide" "African travel tips" 4.99
`);
}
