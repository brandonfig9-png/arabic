// Shared profiles + progress, stored in Netlify Blobs.
// GET  -> { profiles: [{ id, name, color, progress }] }
// POST -> { op: "upsertProfile" | "saveProgress" | "nudge", ... }

import { getStore } from "@netlify/blobs";

const STORE = "majlis";

export default async (req) => {
  const store = getStore(STORE);

  if (req.method === "GET") {
    const profiles = (await store.get("profiles", { type: "json" })) || [];
    const out = [];
    for (const p of profiles) {
      const progress = (await store.get("progress:" + p.id, { type: "json" })) || null;
      out.push({ ...p, progress });
    }
    return Response.json({ profiles: out });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "bad json" }, { status: 400 });
    }

    if (body.op === "upsertProfile" && body.profile) {
      const profiles = (await store.get("profiles", { type: "json" })) || [];
      const i = profiles.findIndex((x) => x.id === body.profile.id);
      if (i >= 0) profiles[i] = body.profile;
      else profiles.push(body.profile);
      await store.setJSON("profiles", profiles);
      return Response.json({ ok: true });
    }

    if (body.op === "saveProgress" && body.profileId) {
      await store.setJSON("progress:" + body.profileId, {
        ...body.progress,
        updatedAt: Date.now(),
      });
      return Response.json({ ok: true });
    }

    if (body.op === "nudge" && body.toId) {
      const key = "progress:" + body.toId;
      const cur = (await store.get(key, { type: "json" })) || {};
      cur.nudge = { from: body.fromName || "Someone", at: Date.now() };
      await store.setJSON(key, cur);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "unknown op" }, { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
};
