import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
const PORT = 3001;
app.use(cors());

// === Configuration ===

const CLIENT_ID = "9af730f2e3ab5dec80647f27839a68509464ad12ebff92ce3053820794e027a8";
const CLIENT_SECRET = "0d83df5b06f295b0ac245d415c0ee98c6fc6f437c2c7d32b36cc2c2407a24119"; // <<=== Put your real secret here
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

const TOKEN_PATH = "./trakt_tokens.json";

const SUPABASE_URL = "https://yijtnqykrueuxitwaixa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpanRucXlrcnVldXhpdHdhaXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODk2OTQsImV4cCI6MjA2NjI2NTY5NH0.OH8l3lYNkP5b0Bh5MlJuoOXmjlFnJTee9djXOKXxMzQ"; // Replace if needed
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === Token Management ===

function loadTokenData() {
  return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
}

function saveTokenData(data) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(data, null, 2));
}

async function getValidAccessToken() {
  const tokenData = loadTokenData();
  const now = Math.floor(Date.now() / 1000);

  const isExpired = now >= tokenData.created_at + tokenData.expires_in - 60; // refresh 1 minute early

  if (!isExpired) {
    return tokenData.access_token;
  }

  console.log("🔄 Access token expired. Refreshing...");

  const response = await fetch("https://api.trakt.tv/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: tokenData.refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Trakt token");
  }

  const newData = await response.json();
  saveTokenData(newData);
  console.log("✅ Token refreshed");
  return newData.access_token;
}

// === Fetch functions ===

async function fetchTraktHistory(limit = 50, page = 1) {
  const token = await getValidAccessToken();

  const res = await fetch(`https://api.trakt.tv/sync/history?limit=${limit}&page=${page}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`History fetch failed: ${res.statusText}`);
  return res.json();
}

async function fetchTraktPlayback() {
  const token = await getValidAccessToken();

  const res = await fetch(`https://api.trakt.tv/sync/playback`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Playback fetch failed: ${res.statusText}`);
  return res.json();
}

// === DB insert helper ===

async function insertIfNotExists(table, idField, newItems) {
  for (const item of newItems) {
    const id = item[idField];

    const { data: existing, error: selectError } = await supabase
      .from(table)
      .select("id")
      .eq(idField, id)
      .maybeSingle();

    if (selectError) {
      console.error(`❌ Error checking ${table}:`, selectError.message);
      continue;
    }

    if (!existing) {
      console.log(`📥 Inserting into ${table}:`);
      console.dir(item, { depth: 3, colors: true });

      const { error: insertError } = await supabase.from(table).insert([item]);

      if (insertError) {
        console.error(`❌ Insert error (${table}):`, insertError.message);
      } else {
        console.log(`✅ Successfully inserted into ${table}`);
      }
    } else {
      if (table === "playback_progress") {
        console.log(`✏️ Updating existing entry for ${id} in ${table}`);
        const { error: updateError } = await supabase
          .from(table)
          .update(item)
          .eq(idField, id);
        if (updateError) {
          console.error(`❌ Update error (${table}):`, updateError.message);
        } else {
          console.log(`✅ Successfully updated entry in ${table}`);
        }
      } else {
        console.log(`⏭️ Skipping existing entry for ${id} in ${table}`);
      }
    }
  }
}

// === Core sync logic ===

async function runSync() {
  let page = 1;
  while (true) {
    const history = await fetchTraktHistory(50, page);
    if (!history.length) break;

    const transformed = history.map((entry) => {
      const { movie, episode, show, watched_at, id } = entry;
      return {
        id,
        watched_at,
        type: movie ? "movie" : "episode",
        trakt_id: movie?.ids?.trakt || episode?.ids?.trakt || null,
        title: movie?.title || show?.title || null,
        season: episode?.season || null,
        episode: episode?.number || null,
        year: movie?.year || null,
        raw_json: entry,
      };
    });

    await insertIfNotExists("watch_history", "id", transformed);
    if (history.length < 50) break;
    page++;
  }

  const playback = await fetchTraktPlayback();
  const transformedPlayback = playback.map((entry) => {
    const { movie, episode, show, paused_at, progress } = entry;
    return {
      progress,
      paused_at,
      type: movie ? "movie" : "episode",
      trakt_id: movie?.ids?.trakt || episode?.ids?.trakt || null,
      title: movie?.title || show?.title || null,
      season: episode?.season || null,
      episode: episode?.number || null,
      raw_json: entry,
    };
  });

  await insertIfNotExists("playback_progress", "trakt_id", transformedPlayback);
}

// === Routes ===

app.get("/api/playback-progress", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("playback_progress")
      .select("*")
      .order("paused_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/sync-trakt", async (req, res) => {
  try {
    await runSync();
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/sync-trakt`);
});