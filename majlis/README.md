# Majlis — Learn Arabic Together

A shared Arabic tutor: a guided path, letter trainer, AI conversation and
lessons, quizzes with sound/sparkle feedback, a spaced-repetition deck, and a
two-person accountability view. Built to run on GitHub + Netlify.

## What's in here

```
index.html              app entry
vite.config.js          build config
netlify.toml            build + SPA redirect + functions location  (fixes the 404)
src/
  main.jsx              React entry
  App.jsx               the whole app
  api.js                talks to the Netlify functions (with localStorage fallback)
  index.css            small reset
netlify/functions/
  claude.js             proxies the Anthropic API (key stays server-side)
  progress.js           shared profiles + progress via Netlify Blobs
```

## Why the old deploy 404'd

The previous repo had only a component file — no `index.html`, no build step,
nothing in a publish folder — so Netlify had nothing to serve. This project adds
a real Vite build, a `dist` publish folder, and a catch-all redirect so every
route resolves to the app.

## Deploy (about 5 minutes)

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project →** pick the repo.
   The build settings come from `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. Add one environment variable (Site configuration → Environment variables):
   - **`ANTHROPIC_API_KEY`** = your Anthropic API key (from console.anthropic.com).
   This powers Converse, the Lessons tab, and the AI-written path lessons. The
   letters, alphabet path units, quizzes on letters, and the deck all work
   without it.
4. Deploy. Netlify Blobs (the shared store for profiles/progress) turns on
   automatically — nothing to configure.

## Run locally

Plain Vite preview (AI + shared store disabled, progress falls back to this
browser's localStorage):

```
npm install
npm run dev
```

Full local stack including the functions and Blobs (recommended):

```
npm install -g netlify-cli
netlify dev
```

## How sharing works

- On first open, each person creates a **profile** (name + color). The device
  remembers who you are; tap your avatar (top right) to switch or add someone.
- Each profile's progress — path lessons, learned letters, deck, settings, and
  quiz accuracy — saves to the shared store, so both of you read from the same
  place no matter the device.
- The **Together** tab shows both of you side by side: a climb visual of who's
  further along the path, lessons completed, quiz accuracy, last active, and a
  **Nudge** button that leaves a friendly ⚡ banner for the other person next
  time they open the app.

## Notes

- The Claude model is set in `src/api.js` (`claude-sonnet-4-6`). Change it there
  if your account uses a different model id.
- This is a lightweight, private two-person setup (profiles by name, no
  passwords). If you later want real accounts or a proper database, the same
  app can point at Supabase instead of Netlify Blobs — the only file that talks
  to the backend is `src/api.js`.
