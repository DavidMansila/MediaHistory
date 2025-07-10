import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// === Configuration ===

const CLIENT_ID = "9af730f2e3ab5dec80647f27839a68509464ad12ebff92ce3053820794e027a8";
const ACCESS_TOKEN = "68e5a52aaa73b49cf302205a5401d8a1524d1583b77a6d8d17d9675ce5a765d0";

const SUPABASE_URL = "https://yijtnqykrueuxitwaixa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpanRucXlrcnVldXhpdHdhaXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODk2OTQsImV4cCI6MjA2NjI2NTY5NH0.OH8l3lYNkP5b0Bh5MlJuoOXmjlFnJTee9djXOKXxMzQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const HEADERS = {
  'Content-Type': 'application/json',
  'trakt-api-version': '2',
  'trakt-api-key': CLIENT_ID,
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
};

// === Fetch functions ===

async function fetchTraktHistory(limit = 50, page = 1) {
  const url = `https://api.trakt.tv/sync/history?limit=${limit}&page=${page}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`History fetch failed: ${res.statusText}`);
  return res.json();
}

async function fetchTraktPlayback() {
  const url = `https://api.trakt.tv/sync/playback`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Playback fetch failed: ${res.statusText}`);
  return res.json();
}

// === DB insert helper ===

async function insertIfNotExists(table, idField, newItems) {
  for (const item of newItems) {
    const id = item[idField];

    const { data: existing, error: selectError } = await supabase
      .from(table)
      .select('id')
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
      if (table === 'playback_progress') {
        // Update the row if it exists for playback_progress
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

    const transformed = history.map(entry => {
      const { movie, episode, show, watched_at, id } = entry;
      return {
        id,
        watched_at,
        type: movie ? 'movie' : 'episode',
        trakt_id: movie?.ids?.trakt || episode?.ids?.trakt || null,
        title: movie?.title || show?.title || null,
        season: episode?.season || null,
        episode: episode?.number || null,
        year: movie?.year || null,
        raw_json: entry,
      };
    });

    await insertIfNotExists('watch_history', 'id', transformed);
    if (history.length < 50) break;
    page++;
  }

  const playback = await fetchTraktPlayback();
  const transformedPlayback = playback.map(entry => {
    const { movie, episode, show, paused_at, progress } = entry;
    return {
      progress,
      paused_at,
      type: movie ? 'movie' : 'episode',
      trakt_id: movie?.ids?.trakt || episode?.ids?.trakt || null,
      title: movie?.title || show?.title || null,
      season: episode?.season || null,
      episode: episode?.number || null,
      raw_json: entry,
    };
  });

  await insertIfNotExists('playback_progress', 'trakt_id', transformedPlayback);
}

// === Express endpoint ===

app.get('/sync-trakt', async (req, res) => {
  try {
    await runSync();
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('❌ Sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/sync-trakt`);
});