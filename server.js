const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const agent = new https.Agent({ rejectUnauthorized: false });

// File utenti
const USERS_FILE = "./users.json";

// Legge o crea users.json se non esiste
let users = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    const data = fs.readFileSync(USERS_FILE);
    users = JSON.parse(data.length ? data : "[]");
  } catch {
    users = [];
  }
} else {
  fs.writeFileSync(USERS_FILE, "[]");
}

// =====================
// Endpoint /get-key
// =====================
app.get("/get-key", (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Piano: free di default, oppure premium se richiesto
  const plan = req.query.plan === "premium" ? "premium" : "free";

  let user = users.find(u => u.email === email);
  if (!user) {
    const apiKey = uuidv4();
    user = { email, apiKey, plan };
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } else {
    // Aggiorna piano se richiesto
    user.plan = plan;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }

  res.json({ apiKey: user.apiKey, plan: user.plan });
});

// =====================
// Middleware chiave API
// =====================
app.use("/preview", (req, res, next) => {
  const key = req.query.api_key;
  const user = users.find(u => u.apiKey === key);
  if (!user) return res.status(401).json({ error: "Invalid or missing API key" });

  // Logging base richieste
  console.log(`[${new Date().toISOString()}] User: ${user.email}, Plan: ${user.plan}, URL: ${req.query.url || "-"}`);

  req.user = user; // passiamo info utente al prossimo middleware
  next();
});

// =====================
// Rate limiter differenziato
// =====================
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: (req) => {
    if (!req.user) return 0;
    return req.user.plan === "premium" ? 100 : 10; // Premium = 100 req/min, Free = 10 req/min
  },
  message: { error: "Too many requests, slow down" },
  keyGenerator: (req) => req.query.api_key || "default"
});
app.use("/preview", limiter);

// =====================
// Endpoint /preview
// =====================
app.get("/preview", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: "url required" });

  try {
    const response = await axios.get(target, {
      httpsAgent: agent,
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr("content") || $("title").text() || null;
    const description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || null;
    const image = $('meta[property="og:image"]').attr("content") || null;
    const domain = new URL(target).hostname;
    const favicon = `${new URL(target).origin}/favicon.ico`;

    res.json({ title, description, image, favicon, domain });

  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// Start server
// =====================
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
// Health check endpoint
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});
// Aggiungi un endpoint di base per la root
app.get("/", (req, res) => {
  res.send("API is running successfully");
});