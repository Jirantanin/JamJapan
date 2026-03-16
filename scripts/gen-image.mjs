#!/usr/bin/env node
/**
 * Gemini Image Generator
 * Usage: node scripts/gen-image.mjs "prompt here" [output-filename]
 * Example: node scripts/gen-image.mjs "Japanese street in Shinjuku at night" cover-shinjuku.jpg
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Load .env manually (no dotenv dependency needed)
const envFile = fs.readFileSync(".env", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ ไม่เจอ GEMINI_API_KEY ใน .env");
  process.exit(1);
}

const prompt = process.argv[2];
if (!prompt) {
  console.error("❌ ใส่ prompt ด้วยครับ");
  console.error('   Usage: node scripts/gen-image.mjs "Japanese street scene"');
  process.exit(1);
}

const outputDir = "public/images/generated";
fs.mkdirSync(outputDir, { recursive: true });

const filename = process.argv[3] || `img-${Date.now()}.png`;
const outputPath = path.join(outputDir, filename);

console.log(`🎨 กำลัง generate รูป...`);
console.log(`   Prompt: ${prompt}`);

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-image",
});

const response = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
});

const parts = response.response.candidates?.[0]?.content?.parts ?? [];
const imagePart = parts.find((p) => p.inlineData);

if (!imagePart) {
  console.error("❌ ไม่ได้รับรูปจาก Gemini");
  console.error(JSON.stringify(parts, null, 2));
  process.exit(1);
}

const buffer = Buffer.from(imagePart.inlineData.data, "base64");
fs.writeFileSync(outputPath, buffer);

console.log(`✅ บันทึกรูปที่: ${outputPath}`);
console.log(`   ใช้ใน Nuxt ได้เลย: /images/generated/${filename}`);
