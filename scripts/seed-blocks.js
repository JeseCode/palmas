const blocks = require("../src/api/block/content-types/block/data/blocks-seed");
const axios = require("axios");
require("dotenv").config();

const API_URL = process.env.API_URL || "http://localhost:1337"; // Prioriza producción, fallback a local
const TOKEN = process.env.STRAPI_ADMIN_TOKEN;

if (!TOKEN) {
  console.error("❌ Error: STRAPI_ADMIN_TOKEN environment variable is not set");
  process.exit(1);
}

console.log(`🔗 Connecting to: ${API_URL}`);

async function seedBlocks() {
  try {
    console.log("🚀 Starting to seed blocks...");

    const api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    console.log("🔍 Testing API connection...");
    try {
      await api.get("/api/blocks");
      console.log("✅ API connection successful");
    } catch (error) {
      if (error.response) {
        console.error("❌ API Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        console.error("❌ API Error:", error.message);
      }
      process.exit(1);
    }

    console.log("📦 Inserting blocks...");
    let successCount = 0;

    for (const block of blocks) {
      try {
        await api.post("/api/blocks", {
          data: {
            block: block.block,
            coefficient: block.coefficient,
            publishedAt: new Date(),
          },
        });
        successCount++;
        console.log(
          `✅ Inserted block ${block.block} (${successCount}/${blocks.length})`
        );
      } catch (error) {
        console.error(
          `❌ Error inserting block ${block.block}:`,
          error.response?.data?.error?.message || error.message
        );
      }
    }

    console.log(
      `🎉 Successfully seeded ${successCount} out of ${blocks.length} blocks`
    );
  } catch (error) {
    console.error("❌ Error seeding blocks:", error.response?.data || error.message);
    process.exit(1);
  }
}

seedBlocks();
