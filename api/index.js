import express from "express";
import cors from "cors";
import gsmarena from "gsmarena-api";
import rateLimit from "express-rate-limit";
import APICache from "../src/utils/apiCache";

const app = express();
const cache = new APICache();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(limiter);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const retryWithDelay = async (fn, retries = 3, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes("429") && i < retries - 1) {
        await delay(delayMs * (i + 1)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
};

app.get("/api/brands", async (req, res) => {
  try {
    const cachedBrands = cache.get("brands");
    if (cachedBrands) {
      return res.json(cachedBrands);
    }

    const brands = await retryWithDelay(() => gsmarena.catalog.getBrands());
    cache.set("brands", brands);
    res.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res
      .status(error.message.includes("429") ? 429 : 500)
      .json({ error: "Failed to fetch brands", retry: true });
  }
});

app.get("/api/devices/:brandId", async (req, res) => {
  const { brandId } = req.params;

  // Validate brandId
  if (!brandId) {
    return res.status(400).json({ error: "Brand ID is required" });
  }

  try {
    // Fix template literal syntax
    const cacheKey = `devices-${brandId}`;
    const cachedDevices = cache.get(cacheKey);

    if (cachedDevices) {
      return res.json(cachedDevices);
    }

    const devices = await retryWithDelay(
      async () => {
        const result = await gsmarena.catalog.getBrand(brandId);
        if (!result || !Array.isArray(result)) {
          throw new Error("Invalid response from GSMArena");
        }
        return result;
      },
      3, // retries
      2000 // delay ms
    );

    // Cache the results
    cache.set(cacheKey, devices);
    res.json(devices);
  } catch (error) {
    console.error(`Error fetching devices for brand ${brandId}:`, error);

    if (error.message.includes("429")) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        retry: true,
        retryAfter: "60 seconds",
      });
    }

    res.status(500).json({
      error: "Failed to fetch devices",
      message: error.message,
    });
  }
});
