/* Talks to the Netlify Functions backend.
   - /progress  : shared profiles + progress (Netlify Blobs)
   - /claude    : Anthropic proxy (keeps your API key server-side)
   If the functions aren't reachable (e.g. plain `vite dev` without
   `netlify dev`), progress falls back to this browser's localStorage so
   the app still runs while you build. */

const FN = "/.netlify/functions";

async function fn(path, opts) {
  const r = await fetch(FN + path, opts);
  if (!r.ok) throw new Error("function error " + r.status);
  return r;
}

const LS = {
  profiles() {
    try {
      return JSON.parse(localStorage.getItem("majlis_profiles") || "[]");
    } catch {
      return [];
    }
  },
  setProfiles(p) {
    try {
      localStorage.setItem("majlis_profiles", JSON.stringify(p));
    } catch {}
  },
  prog(id) {
    try {
      return JSON.parse(localStorage.getItem("majlis_prog_" + id) || "null");
    } catch {
      return null;
    }
  },
  setProg(id, v) {
    try {
      localStorage.setItem("majlis_prog_" + id, JSON.stringify(v));
    } catch {}
  },
};

export async function loadAll() {
  try {
    const r = await fn("/progress", { method: "GET" });
    const j = await r.json();
    return j.profiles || [];
  } catch {
    return LS.profiles().map((p) => ({ ...p, progress: LS.prog(p.id) }));
  }
}

export async function upsertProfile(profile) {
  try {
    await fn("/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "upsertProfile", profile }),
    });
  } catch {
    const ps = LS.profiles();
    const i = ps.findIndex((x) => x.id === profile.id);
    if (i >= 0) ps[i] = profile;
    else ps.push(profile);
    LS.setProfiles(ps);
  }
}

export async function saveProgress(profileId, progress) {
  try {
    await fn("/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "saveProgress", profileId, progress }),
    });
  } catch {
    LS.setProg(profileId, { ...progress, updatedAt: Date.now() });
  }
}

export async function sendNudge(toId, fromName) {
  try {
    await fn("/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "nudge", toId, fromName }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function callClaude(apiMessages, system) {
  const r = await fetch(FN + "/claude", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: apiMessages,
    }),
  });
  if (!r.ok) throw new Error("Claude request failed (" + r.status + ")");
  const data = await r.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
