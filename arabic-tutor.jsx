import React, { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   Majlis — an Arabic tutor powered by Claude
   Design: "manuscript study". Deep ink-teal canvas, Arabic set
   in Amiri on parchment cards. Gold = voice. Teal = mastery.
   Rose = correction. Everything else kept quiet.
   ============================================================ */

const T = {
  canvas: "#0E1A1C",
  panel: "#15292B",
  panelHi: "#1B3335",
  edge: "#23403F",
  parchment: "#F3ECDB",
  parchmentEdge: "#E4D7BA",
  inkText: "#13211F",
  cream: "#ECE5D5",
  muted: "#8FA8A3",
  gold: "#E0A33E",
  goldSoft: "#F0C879",
  teal: "#3FB89C",
  tealDim: "#21534B",
  rose: "#E0908B",
  roseDim: "#3E2725",
};

const DIALECTS = [
  "Modern Standard Arabic (MSA)",
  "Egyptian",
  "Levantine",
  "Gulf",
  "Maghrebi",
];
const LEVELS = ["Brand new", "Beginner", "Intermediate", "Advanced"];
const GOALS = [
  "Everyday conversation",
  "Travel",
  "Reading & script",
  "Family & roots",
  "Business",
];

const VOICE_PREFS = {
  "Modern Standard Arabic (MSA)": ["ar-sa", "ar-001", "ar"],
  Egyptian: ["ar-eg", "ar-sa", "ar"],
  Levantine: ["ar-lb", "ar-sy", "ar-jo", "ar-sa", "ar"],
  Gulf: ["ar-sa", "ar-ae", "ar"],
  Maghrebi: ["ar-ma", "ar-dz", "ar-sa", "ar"],
};

const GREETINGS = {
  "Modern Standard Arabic (MSA)": {
    arabic: "مرحباً! أنا معلّمك. هل أنت مستعدّ؟",
    translit: "marḥaban! ana muʿallimuk. hal anta mustaʿidd?",
    english: "Hello! I'm your teacher. Are you ready?",
  },
  Egyptian: {
    arabic: "أهلاً! أنا مدرّسك. جاهز نبدأ؟",
    translit: "ahlan! ana mudarrisak. gahez nibtedi?",
    english: "Hi! I'm your teacher. Ready to start?",
  },
  Levantine: {
    arabic: "مرحبا! أنا معلّمك. جاهز نبلّش؟",
    translit: "marḥaba! ana mʿallmak. jahez nballesh?",
    english: "Hi! I'm your teacher. Ready to begin?",
  },
  Gulf: {
    arabic: "هلا! أنا معلّمك. جاهز نبدأ؟",
    translit: "hala! ana mʿallimk. yahez nabda?",
    english: "Hi! I'm your teacher. Ready to start?",
  },
  Maghrebi: {
    arabic: "سلام! أنا معلّمك. واجد نبداو؟",
    translit: "salam! ana mʿallmek. wajed nebdaw?",
    english: "Hi! I'm your teacher. Ready to start?",
  },
};

const LESSON_TOPICS = [
  "Greetings",
  "Numbers 1–10",
  "Ordering food",
  "Asking directions",
  "Family",
  "Shopping",
  "Telling time",
  "Small talk",
];

/* the 28 letters — isolated glyph, name, sound, a plain hint,
   and one simple example word. nonConnector = never joins to
   the letter that follows it. */
const LETTERS = [
  { ar: "ا", name: "alif", sound: "a / aa", hint: "A long \"aa\" like in \"father\". Often it just carries other vowel sounds.", word: "أسد", wordTranslit: "asad", wordEn: "lion", nonConnector: true },
  { ar: "ب", name: "baa", sound: "b", hint: "Just like the English \"b\".", word: "بيت", wordTranslit: "bayt", wordEn: "house" },
  { ar: "ت", name: "taa", sound: "t", hint: "Like the English \"t\".", word: "تمر", wordTranslit: "tamr", wordEn: "dates" },
  { ar: "ث", name: "thaa", sound: "th", hint: "Like \"th\" in \"think\".", word: "ثلج", wordTranslit: "thalj", wordEn: "snow" },
  { ar: "ج", name: "jeem", sound: "j", hint: "Like \"j\" in \"jam\". In Egyptian it's a hard \"g\".", word: "جمل", wordTranslit: "jamal", wordEn: "camel" },
  { ar: "ح", name: "Haa", sound: "H", hint: "A breathy H from deep in the throat — like fogging up a mirror.", word: "حليب", wordTranslit: "Haleeb", wordEn: "milk" },
  { ar: "خ", name: "khaa", sound: "kh", hint: "A raspy \"kh\", like the \"ch\" in Scottish \"loch\".", word: "خبز", wordTranslit: "khubz", wordEn: "bread" },
  { ar: "د", name: "daal", sound: "d", hint: "Like the English \"d\".", word: "دار", wordTranslit: "daar", wordEn: "home", nonConnector: true },
  { ar: "ذ", name: "dhaal", sound: "dh", hint: "Like \"th\" in \"this\".", word: "ذهب", wordTranslit: "dhahab", wordEn: "gold", nonConnector: true },
  { ar: "ر", name: "raa", sound: "r", hint: "A rolled or tapped \"r\", like in Spanish.", word: "رجل", wordTranslit: "rajul", wordEn: "man", nonConnector: true },
  { ar: "ز", name: "zaay", sound: "z", hint: "Like the English \"z\".", word: "زهرة", wordTranslit: "zahra", wordEn: "flower", nonConnector: true },
  { ar: "س", name: "seen", sound: "s", hint: "Like the English \"s\".", word: "سمك", wordTranslit: "samak", wordEn: "fish" },
  { ar: "ش", name: "sheen", sound: "sh", hint: "Like \"sh\" in \"ship\".", word: "شمس", wordTranslit: "shams", wordEn: "sun" },
  { ar: "ص", name: "Saad", sound: "S", hint: "A heavy, deep \"s\" — fuller mouth, tongue low.", word: "صديق", wordTranslit: "Sadeeq", wordEn: "friend" },
  { ar: "ض", name: "Daad", sound: "D", hint: "A heavy \"d\". Arabic is even nicknamed \"the language of the Daad\".", word: "ضوء", wordTranslit: "Daw'", wordEn: "light" },
  { ar: "ط", name: "Taa", sound: "T", hint: "A heavy, emphatic \"t\".", word: "طير", wordTranslit: "Tayr", wordEn: "bird" },
  { ar: "ظ", name: "DHaa", sound: "DH", hint: "A heavy \"th\" (as in \"this\"), said with a fuller mouth.", word: "ظل", wordTranslit: "DHill", wordEn: "shade" },
  { ar: "ع", name: "ayn", sound: "ʿ", hint: "A tight squeeze from deep in the throat — no English match. You'll feel it more than hear it.", word: "عين", wordTranslit: "ʿayn", wordEn: "eye" },
  { ar: "غ", name: "ghayn", sound: "gh", hint: "A gargled \"gh\", like a French \"r\".", word: "غابة", wordTranslit: "ghaaba", wordEn: "forest" },
  { ar: "ف", name: "faa", sound: "f", hint: "Like the English \"f\".", word: "فيل", wordTranslit: "feel", wordEn: "elephant" },
  { ar: "ق", name: "qaaf", sound: "q", hint: "A \"k\" made far back in the throat.", word: "قمر", wordTranslit: "qamar", wordEn: "moon" },
  { ar: "ك", name: "kaaf", sound: "k", hint: "Like the English \"k\".", word: "كلب", wordTranslit: "kalb", wordEn: "dog" },
  { ar: "ل", name: "laam", sound: "l", hint: "Like the English \"l\".", word: "ليل", wordTranslit: "layl", wordEn: "night" },
  { ar: "م", name: "meem", sound: "m", hint: "Like the English \"m\".", word: "ماء", wordTranslit: "maa'", wordEn: "water" },
  { ar: "ن", name: "noon", sound: "n", hint: "Like the English \"n\".", word: "نجمة", wordTranslit: "najma", wordEn: "star" },
  { ar: "ه", name: "haa", sound: "h", hint: "A soft \"h\", like in \"hello\".", word: "هواء", wordTranslit: "hawaa'", wordEn: "air" },
  { ar: "و", name: "waaw", sound: "w / oo", hint: "Like \"w\", or a long \"oo\" as in \"moon\".", word: "ورد", wordTranslit: "ward", wordEn: "roses", nonConnector: true },
  { ar: "ي", name: "yaa", sound: "y / ee", hint: "Like \"y\", or a long \"ee\" as in \"see\".", word: "يد", wordTranslit: "yad", wordEn: "hand" },
];

/* spaced repetition (Leitner) — interval per box in ms */
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const INTERVALS = { 1: 4 * HOUR, 2: DAY, 3: 3 * DAY, 4: 7 * DAY, 5: 21 * DAY };

/* ---------- storage (persists across sessions) ---------- */
async function storeGet(key, fallback) {
  try {
    if (!window.storage) return fallback;
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
}
async function storeSet(key, val) {
  try {
    if (!window.storage) return;
    await window.storage.set(key, JSON.stringify(val), false);
  } catch {
    /* ignore */
  }
}

/* ---------- Claude API ---------- */
async function callClaude(apiMessages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: apiMessages,
    }),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function parseJSON(text) {
  let t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e >= 0) t = t.slice(s, e + 1);
  return JSON.parse(t);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const AR_RE = /[\u0600-\u06FF]/;
function hasArabic(s) {
  return AR_RE.test(s || "");
}

/* ---------- sound effects (synthesized, no files) ---------- */
let _ac = null;
function audioCtx() {
  try {
    if (!_ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      _ac = new C();
    }
    if (_ac.state === "suspended") _ac.resume();
    return _ac;
  } catch {
    return null;
  }
}
function tone(ctx, freq, start, dur, type, peak) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(ctx.destination);
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.03);
}
function playCorrect() {
  const ctx = audioCtx();
  if (!ctx) return;
  tone(ctx, 880, 0, 0.18, "sine", 0.22); // A5
  tone(ctx, 1318.5, 0.085, 0.3, "sine", 0.2); // E6
  tone(ctx, 1760, 0.085, 0.32, "triangle", 0.07); // shimmer
}
function playWrong() {
  const ctx = audioCtx();
  if (!ctx) return;
  tone(ctx, 200, 0, 0.2, "sawtooth", 0.14);
  tone(ctx, 150, 0.07, 0.24, "sawtooth", 0.14);
}

/* ---------- speech ---------- */
function pickVoice(prefs) {
  const vs =
    (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
  for (const loc of prefs) {
    const v = vs.find((v) => v.lang && v.lang.toLowerCase() === loc);
    if (v) return v;
  }
  const arOnly = vs.filter((v) => v.lang && v.lang.toLowerCase().startsWith("ar"));
  return arOnly[0] || null;
}

/* =========================================================
   Small UI atoms
   ========================================================= */
function Speaker({ onClick, busy }) {
  return (
    <button
      className="mj-speak"
      onClick={onClick}
      aria-label="Hear pronunciation"
      title="Hear it"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill={T.gold}
          stroke={T.gold}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {busy ? (
          <path
            d="M15 8c1.5 1.2 1.5 6.8 0 8M18 6c2.6 2 2.6 10 0 12"
            stroke={T.goldSoft}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M15.5 9.5c1 .9 1 4.1 0 5"
            stroke={T.goldSoft}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}

function Chip({ active, children, onClick, tone = "neutral" }) {
  const palette =
    tone === "gold"
      ? { on: T.gold, txtOn: "#1a1205" }
      : { on: T.teal, txtOn: "#06201b" };
  return (
    <button
      className="mj-chip"
      onClick={onClick}
      style={
        active
          ? { background: palette.on, color: palette.txtOn, borderColor: "transparent" }
          : {}
      }
    >
      {children}
    </button>
  );
}

/* The signature element: an Arabic line you can hear and peel
   back layer by layer — script → sound → transliteration → meaning */
function ArabicLine({
  arabic,
  translit,
  english,
  prefs,
  onSpeak,
  showTranslit,
  showEnglish,
  onAdd,
  added,
  compact,
}) {
  const [t, setT] = useState(showTranslit);
  const [e, setE] = useState(showEnglish);
  useEffect(() => setT(showTranslit), [showTranslit]);
  useEffect(() => setE(showEnglish), [showEnglish]);

  return (
    <div className="mj-card" style={compact ? { padding: "14px 16px" } : {}}>
      <div className="mj-card-top">
        <div className="mj-ar" dir="rtl" lang="ar">
          {arabic}
        </div>
        <Speaker onClick={onSpeak} />
      </div>

      <div className="mj-reveal">
        {t ? (
          <div className="mj-translit">{translit}</div>
        ) : (
          <button className="mj-peek" onClick={() => setT(true)}>
            tap for pronunciation
          </button>
        )}
        {e ? (
          <div className="mj-en">{english}</div>
        ) : (
          <button className="mj-peek" onClick={() => setE(true)}>
            tap for meaning
          </button>
        )}
      </div>

      {onAdd && (
        <button
          className="mj-add"
          onClick={onAdd}
          disabled={added}
          style={added ? { color: T.teal, borderColor: T.tealDim } : {}}
        >
          {added ? "✓ in your deck" : "+ save to deck"}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   Converse view
   ========================================================= */
function Converse({ settings, speak, deck, addCard }) {
  const [messages, setMessages] = useState([
    { role: "assistant", ...GREETINGS[settings.dialect] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scroller = useRef(null);

  // reset greeting if dialect changes and only greeting present
  useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].role === "assistant"
        ? [{ role: "assistant", ...GREETINGS[settings.dialect] }]
        : m
    );
  }, [settings.dialect]);

  useEffect(() => {
    if (scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, loading]);

  const system = `You are a warm, patient Arabic conversation tutor. You teach ${settings.dialect}. The learner's level is "${settings.level}". Their goal is "${settings.goal}".
Rules:
- Reply at the learner's level. For "Brand new" / "Beginner": very short, simple Arabic (a few words), heavy repetition. Scale richness up with level.
- Always keep the conversation going by ending with one simple question they can answer.
- If the learner wrote Arabic with a mistake, give one short encouraging correction naming what to fix. If their message was fine or in English, set correction to null.
- Respond ONLY with a JSON object. No markdown, no backticks, no text outside the object:
{"arabic":"your reply in ${settings.dialect}","transliteration":"readable Latin-letter pronunciation","english":"natural English translation","correction":"short note on their Arabic or null","newWords":[{"arabic":"","transliteration":"","english":""}]}
- newWords: 0–3 key words from YOUR reply worth saving. Use readable transliteration (avoid heavy academic symbols).`;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const apiMessages = next.map((m) =>
        m.role === "user"
          ? { role: "user", content: m.text }
          : {
              role: "assistant",
              content: JSON.stringify({
                arabic: m.arabic,
                transliteration: m.translit,
                english: m.english,
              }),
            }
      );
      const raw = await callClaude(apiMessages, system);
      const j = parseJSON(raw);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          arabic: j.arabic || "",
          translit: j.transliteration || "",
          english: j.english || "",
          correction: j.correction && j.correction !== "null" ? j.correction : null,
          newWords: Array.isArray(j.newWords) ? j.newWords.slice(0, 3) : [],
        },
      ]);
    } catch (err) {
      setError("That reply didn't come through. Try sending again.");
    } finally {
      setLoading(false);
    }
  }

  const inDeck = (ar) => deck.some((c) => c.arabic === ar);

  return (
    <div className="mj-converse">
      <div className="mj-scroll" ref={scroller}>
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div className="mj-userwrap" key={i}>
              <div className="mj-userbubble">{m.text}</div>
            </div>
          ) : (
            <div className="mj-turn" key={i}>
              {m.correction && (
                <div className="mj-correction">
                  <span className="mj-corr-label">gentle fix</span>
                  {m.correction}
                </div>
              )}
              <ArabicLine
                arabic={m.arabic}
                translit={m.translit}
                english={m.english}
                prefs={VOICE_PREFS[settings.dialect]}
                onSpeak={() => speak(m.arabic)}
                showTranslit={settings.showTranslit}
                showEnglish={settings.showEnglish}
              />
              {m.newWords && m.newWords.length > 0 && (
                <div className="mj-words">
                  {m.newWords.map((w, k) => (
                    <button
                      key={k}
                      className="mj-wordchip"
                      disabled={inDeck(w.arabic)}
                      onClick={() =>
                        addCard({
                          arabic: w.arabic,
                          translit: w.transliteration,
                          english: w.english,
                        })
                      }
                      style={
                        inDeck(w.arabic)
                          ? { color: T.teal, borderColor: T.tealDim }
                          : {}
                      }
                    >
                      <span dir="rtl" lang="ar" className="mj-wordar">
                        {w.arabic}
                      </span>
                      <span className="mj-worden">
                        {inDeck(w.arabic) ? "saved" : "+ save"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        )}
        {loading && (
          <div className="mj-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {error && <div className="mj-error">{error}</div>}
      </div>

      <div className="mj-composer">
        <textarea
          className="mj-input"
          rows={1}
          placeholder="Reply in Arabic or English…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          className="mj-send"
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M4 12L20 4l-4 16-4-7-8-1z"
              fill={T.canvas}
              stroke={T.canvas}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Lessons view
   ========================================================= */
function Lessons({ settings, speak, deck, addCard }) {
  const [topic, setTopic] = useState("");
  const [custom, setCustom] = useState("");
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function build(chosen) {
    const tp = (chosen || custom).trim();
    if (!tp || loading) return;
    setTopic(tp);
    setError(null);
    setLesson(null);
    setLoading(true);
    const system = `You are an Arabic tutor creating a focused micro-lesson in ${settings.dialect} for a "${settings.level}" learner. Topic: "${tp}". Goal context: "${settings.goal}".
Respond ONLY with a JSON object, no markdown or backticks:
{"title":"short English title","intro":"one friendly sentence in English","phrases":[{"arabic":"","transliteration":"readable Latin pronunciation","english":"","note":"tiny usage note or null"}],"tip":"one short practical tip in English"}
Give 5–7 genuinely useful phrases, ordered simplest first. Keep transliteration readable.`;
    try {
      const raw = await callClaude(
        [{ role: "user", content: `Make the lesson on: ${tp}` }],
        system
      );
      const j = parseJSON(raw);
      setLesson(j);
    } catch {
      setError("Couldn't build that lesson. Try again or pick another topic.");
    } finally {
      setLoading(false);
    }
  }

  const inDeck = (ar) => deck.some((c) => c.arabic === ar);

  return (
    <div className="mj-lessons">
      <div className="mj-scroll">
        <p className="mj-lead">
          Pick a situation and get a tight set of phrases you can actually use —
          each one tappable, hearable, and savable.
        </p>
        <div className="mj-topics">
          {LESSON_TOPICS.map((t) => (
            <Chip key={t} active={topic === t} onClick={() => build(t)} tone="gold">
              {t}
            </Chip>
          ))}
        </div>
        <div className="mj-customrow">
          <input
            className="mj-input mj-custominput"
            placeholder="…or type any situation"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") build();
            }}
          />
          <button
            className="mj-build"
            onClick={() => build()}
            disabled={loading || !custom.trim()}
          >
            Build
          </button>
        </div>

        {loading && (
          <div className="mj-typing mj-typing-center">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {error && <div className="mj-error">{error}</div>}

        {lesson && (
          <div className="mj-lesson">
            <h2 className="mj-lesson-title">{lesson.title}</h2>
            {lesson.intro && <p className="mj-lesson-intro">{lesson.intro}</p>}
            {(lesson.phrases || []).map((p, i) => (
              <div key={i}>
                <ArabicLine
                  arabic={p.arabic}
                  translit={p.transliteration}
                  english={p.english}
                  prefs={VOICE_PREFS[settings.dialect]}
                  onSpeak={() => speak(p.arabic)}
                  showTranslit={settings.showTranslit}
                  showEnglish={settings.showEnglish}
                  onAdd={() =>
                    addCard({
                      arabic: p.arabic,
                      translit: p.transliteration,
                      english: p.english,
                    })
                  }
                  added={inDeck(p.arabic)}
                />
                {p.note && p.note !== "null" && (
                  <div className="mj-note">{p.note}</div>
                )}
              </div>
            ))}
            {lesson.tip && (
              <div className="mj-tip">
                <span className="mj-tip-label">tip</span>
                {lesson.tip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Deck / review view
   ========================================================= */
function Deck({ settings, speak, deck, setDeck }) {
  const now = Date.now();
  const due = deck.filter((c) => c.due <= now);
  const [reviewing, setReviewing] = useState(false);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!reviewing) {
      setIdx(0);
      setRevealed(false);
    }
  }, [reviewing]);

  function grade(known) {
    const card = due[idx];
    setDeck((d) =>
      d.map((c) => {
        if (c.id !== card.id) return c;
        const box = known ? Math.min(c.box + 1, 5) : 1;
        const dueAt = known ? Date.now() + INTERVALS[box] : Date.now() + 10 * 60 * 1000;
        return { ...c, box, due: dueAt };
      })
    );
    if (idx + 1 >= due.length) {
      setReviewing(false);
    } else {
      setIdx(idx + 1);
      setRevealed(false);
    }
  }

  function remove(id) {
    setDeck((d) => d.filter((c) => c.id !== id));
  }

  function nextDueLabel() {
    if (deck.length === 0) return null;
    const soonest = Math.min(...deck.map((c) => c.due));
    const mins = Math.round((soonest - now) / 60000);
    if (mins <= 0) return "now";
    if (mins < 60) return `in ${mins} min`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `in ${hrs} h`;
    return `in ${Math.round(hrs / 24)} d`;
  }

  if (reviewing && due.length > 0) {
    const card = due[idx];
    return (
      <div className="mj-review">
        <div className="mj-review-top">
          <button className="mj-back" onClick={() => setReviewing(false)}>
            ← back
          </button>
          <span className="mj-progress">
            {idx + 1} / {due.length}
          </span>
        </div>
        <div className="mj-review-stage">
          <div className="mj-card mj-review-card">
            <div className="mj-card-top">
              <div className="mj-ar mj-ar-big" dir="rtl" lang="ar">
                {card.arabic}
              </div>
              <Speaker onClick={() => speak(card.arabic)} />
            </div>
            {revealed ? (
              <div className="mj-reveal">
                <div className="mj-translit">{card.translit}</div>
                <div className="mj-en">{card.english}</div>
              </div>
            ) : (
              <button className="mj-show" onClick={() => setRevealed(true)}>
                Show answer
              </button>
            )}
          </div>
        </div>
        {revealed && (
          <div className="mj-grade">
            <button className="mj-again" onClick={() => grade(false)}>
              Again
            </button>
            <button className="mj-got" onClick={() => grade(true)}>
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mj-deck">
      <div className="mj-scroll">
        <div className="mj-deckhead">
          <div>
            <div className="mj-decknum">{deck.length}</div>
            <div className="mj-decklabel">
              {deck.length === 1 ? "word saved" : "words saved"}
            </div>
          </div>
          <button
            className="mj-startreview"
            disabled={due.length === 0}
            onClick={() => setReviewing(true)}
          >
            {due.length > 0 ? `Review ${due.length} due` : "Nothing due"}
          </button>
        </div>

        {deck.length === 0 && (
          <div className="mj-empty">
            Your deck is empty. Save words from a conversation or a lesson and
            they'll show up here for spaced review.
          </div>
        )}

        {deck.length > 0 && due.length === 0 && (
          <div className="mj-allclear">
            All caught up. Next review {nextDueLabel()}.
          </div>
        )}

        {deck
          .slice()
          .sort((a, b) => a.due - b.due)
          .map((c) => (
            <div className="mj-deckrow" key={c.id}>
              <button
                className="mj-rowspeak"
                onClick={() => speak(c.arabic)}
                aria-label="Hear it"
              >
                <Speaker onClick={() => speak(c.arabic)} />
              </button>
              <div className="mj-rowtext">
                <div className="mj-ar mj-ar-row" dir="rtl" lang="ar">
                  {c.arabic}
                </div>
                <div className="mj-rowmeta">
                  {c.translit} · {c.english}
                </div>
              </div>
              <div className="mj-rowright">
                <span className="mj-box">lvl {c.box}</span>
                <button
                  className="mj-del"
                  onClick={() => remove(c.id)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* =========================================================
   Settings sheet
   ========================================================= */
function Settings({ settings, setSettings, onClose }) {
  function set(k, v) {
    setSettings((s) => ({ ...s, [k]: v }));
  }
  return (
    <div className="mj-sheet-wrap" onClick={onClose}>
      <div className="mj-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mj-sheet-grab" />
        <h3 className="mj-sheet-title">Your study</h3>

        <div className="mj-field">
          <label className="mj-flabel">Dialect</label>
          <div className="mj-opts">
            {DIALECTS.map((d) => (
              <Chip key={d} active={settings.dialect === d} onClick={() => set("dialect", d)}>
                {d.replace(" (MSA)", "")}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mj-field">
          <label className="mj-flabel">Level</label>
          <div className="mj-opts">
            {LEVELS.map((l) => (
              <Chip key={l} active={settings.level === l} onClick={() => set("level", l)}>
                {l}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mj-field">
          <label className="mj-flabel">Focus</label>
          <div className="mj-opts">
            {GOALS.map((g) => (
              <Chip key={g} active={settings.goal === g} onClick={() => set("goal", g)}>
                {g}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mj-field">
          <label className="mj-flabel">Show by default</label>
          <div className="mj-opts">
            <Chip
              active={settings.showTranslit}
              tone="gold"
              onClick={() => set("showTranslit", !settings.showTranslit)}
            >
              Pronunciation
            </Chip>
            <Chip
              active={settings.showEnglish}
              tone="gold"
              onClick={() => set("showEnglish", !settings.showEnglish)}
            >
              Meaning
            </Chip>
          </div>
          <p className="mj-hint">
            Turn these off to test your recall — you can still tap any line to
            peek.
          </p>
        </div>

        <div className="mj-field">
          <label className="mj-flabel">Quiz sound</label>
          <div className="mj-opts">
            <Chip
              active={settings.sfx !== false}
              tone="gold"
              onClick={() => set("sfx", settings.sfx === false)}
            >
              Sound effects {settings.sfx !== false ? "on" : "off"}
            </Chip>
          </div>
        </div>

        <button className="mj-done" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Letters / alphabet view
   ========================================================= */
function Letters({ settings, speak, learned, setLearned, deck, addCard }) {
  const [sel, setSel] = useState(null);
  const ZWJ = "\u200D";
  const count = learned.length;

  function toggleLearned(name) {
    setLearned((L) =>
      L.includes(name) ? L.filter((x) => x !== name) : [...L, name]
    );
  }

  if (sel !== null) {
    const l = LETTERS[sel];
    const forms = [
      ["On its own", l.ar],
      ["Start", l.ar + ZWJ],
      ["Middle", ZWJ + l.ar + ZWJ],
      ["End", ZWJ + l.ar],
    ];
    const isLearned = learned.includes(l.name);
    const inDeck = deck.some((c) => c.arabic === l.word);
    return (
      <div className="mj-letters">
        <div className="mj-scroll">
          <div className="mj-ltr-detailtop">
            <button className="mj-back" onClick={() => setSel(null)}>
              ← all letters
            </button>
            <span className="mj-progress">{sel + 1} / 28</span>
          </div>

          <div className="mj-card mj-ltr-hero">
            <div className="mj-card-top">
              <div className="mj-ar mj-ltr-big" dir="rtl" lang="ar">
                {l.ar}
              </div>
              <Speaker onClick={() => speak(l.ar)} />
            </div>
            <div className="mj-ltr-name">{l.name}</div>
            <div className="mj-ltr-sound">
              sounds like <b>{l.sound}</b>
            </div>
            <div className="mj-ltr-hint">{l.hint}</div>
          </div>

          <div className="mj-formlabel">How it changes shape</div>
          <div className="mj-forms">
            {forms.map(([lab, g]) => (
              <div className="mj-form" key={lab}>
                <div className="mj-ar mj-formglyph" dir="rtl" lang="ar">
                  {g}
                </div>
                <div className="mj-formcap">{lab}</div>
              </div>
            ))}
          </div>
          {l.nonConnector && (
            <div className="mj-note">
              One of six letters that never joins to the letter after it — so a
              small gap appears before the next one.
            </div>
          )}

          <div className="mj-formlabel">In a word</div>
          <ArabicLine
            arabic={l.word}
            translit={l.wordTranslit}
            english={l.wordEn}
            prefs={VOICE_PREFS[settings.dialect]}
            onSpeak={() => speak(l.word)}
            showTranslit={true}
            showEnglish={true}
            onAdd={() =>
              addCard({
                arabic: l.word,
                translit: l.wordTranslit,
                english: l.wordEn,
              })
            }
            added={inDeck}
          />

          <div className="mj-ltr-nav">
            <button
              className="mj-navbtn"
              disabled={sel === 0}
              onClick={() => setSel(sel - 1)}
            >
              ‹ Prev
            </button>
            <button
              className="mj-learnbtn"
              onClick={() => toggleLearned(l.name)}
              style={
                isLearned
                  ? { background: T.teal, color: "#06201b", borderColor: "transparent" }
                  : {}
              }
            >
              {isLearned ? "✓ Learned" : "Mark as learned"}
            </button>
            <button
              className="mj-navbtn"
              disabled={sel === 27}
              onClick={() => setSel(sel + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mj-letters">
      <div className="mj-scroll">
        <p className="mj-lead">
          The Arabic alphabet has 28 letters. Three things to know before you
          start:
        </p>
        <div className="mj-truths">
          <div className="mj-truth">
            <span className="mj-truthnum">→</span>You read from right to left.
          </div>
          <div className="mj-truth">
            <span className="mj-truthnum">∞</span>Letters join up, and change
            shape depending on where they sit in a word.
          </div>
          <div className="mj-truth">
            <span className="mj-truthnum">◌</span>Short vowels are little marks
            added above or below — you'll meet those soon.
          </div>
        </div>
        <div className="mj-ltr-progress">
          <span>{count} / 28 learned</span>
          <div className="mj-bar">
            <div
              className="mj-barfill"
              style={{ width: (count / 28) * 100 + "%" }}
            />
          </div>
        </div>
        <div className="mj-grid">
          {LETTERS.map((l, i) => (
            <button
              key={l.name}
              className="mj-gridcell"
              onClick={() => setSel(i)}
            >
              {learned.includes(l.name) && <span className="mj-dot" />}
              <span className="mj-ar mj-gridglyph" dir="rtl" lang="ar">
                {l.ar}
              </span>
              <span className="mj-gridname">{l.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Quiz view — letters (built locally) or a lesson topic (Claude)
   ========================================================= */
function Quiz({ settings, speak, learned }) {
  const [stage, setStage] = useState("setup"); // setup | active | done
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [custom, setCustom] = useState("");

  const learnedLetters = LETTERS.filter((l) => learned.includes(l.name));

  function start(qs) {
    setQuestions(qs);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setStage("active");
  }

  function buildLettersQuiz(useLearnedOnly) {
    const pool =
      useLearnedOnly && learnedLetters.length >= 3 ? learnedLetters : LETTERS;
    const n = Math.min(8, pool.length);
    const chosen = shuffle(pool).slice(0, n);
    const qs = chosen.map((l) => {
      const distract = shuffle(
        LETTERS.filter((x) => x.name !== l.name)
      ).slice(0, 3);
      const opts = shuffle([l, ...distract]);
      const answer = opts.findIndex((x) => x.name === l.name);
      if (Math.random() < 0.5) {
        return {
          prompt: "Which letter is this?",
          display: { glyph: l.ar },
          hearable: l.ar,
          options: opts.map((x) => ({ text: x.name + "  ·  " + x.sound })),
          answer,
        };
      }
      return {
        prompt: 'Which letter makes the "' + l.sound + '" sound? (' + l.name + ")",
        display: null,
        hearable: null,
        options: opts.map((x) => ({ text: x.ar, arabic: true })),
        answer,
      };
    });
    start(qs);
  }

  async function buildLessonQuiz(topic) {
    const tp = (topic || custom).trim();
    if (!tp || loading) return;
    setError(null);
    setLoading(true);
    const system = `You are an Arabic tutor writing a short multiple-choice quiz in ${settings.dialect} for a "${settings.level}" learner on the topic "${tp}". Goal context: "${settings.goal}".
Respond ONLY with a JSON object, no markdown or backticks:
{"questions":[{"prompt":"the question in English","arabic":"an Arabic word or phrase to show, or null","options":["option 1","option 2","option 3","option 4"],"answer":0,"explain":"one short sentence"}]}
Write 6 questions, four options each. Mix two styles: (a) show an Arabic word in "arabic" and ask its English meaning, with the options in English; (b) ask which Arabic word matches an English term, with the options written in Arabic script. "answer" is the 0-based index of the correct option. Keep it level-appropriate.`;
    try {
      const raw = await callClaude(
        [{ role: "user", content: "Make the quiz on: " + tp }],
        system
      );
      const j = parseJSON(raw);
      const qs = (j.questions || [])
        .slice(0, 8)
        .map((q) => ({
          prompt: q.prompt,
          display:
            q.arabic && q.arabic !== "null" ? { arabic: q.arabic } : null,
          hearable: q.arabic && q.arabic !== "null" ? q.arabic : null,
          options: (q.options || []).map((o) => ({
            text: String(o),
            arabic: hasArabic(String(o)),
          })),
          answer: typeof q.answer === "number" ? q.answer : 0,
          explain: q.explain && q.explain !== "null" ? q.explain : null,
        }))
        .filter((q) => q.options.length >= 2);
      if (qs.length === 0) throw new Error("empty");
      start(qs);
    } catch {
      setError("Couldn't build that quiz. Try again or pick another topic.");
    } finally {
      setLoading(false);
    }
  }

  function choose(i) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === questions[idx].answer;
    if (correct) setScore((s) => s + 1);
    if (settings.sfx !== false) (correct ? playCorrect : playWrong)();
  }
  function next() {
    if (idx + 1 >= questions.length) setStage("done");
    else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  /* ---- setup ---- */
  if (stage === "setup") {
    return (
      <div className="mj-quiz">
        <div className="mj-scroll">
          <p className="mj-lead">
            Test yourself — multiple choice, instant feedback. Pick what to be
            quizzed on.
          </p>

          <div className="mj-sectlabel">Letters</div>
          <button className="mj-bigbtn" onClick={() => buildLettersQuiz(false)}>
            <span className="mj-bigbtn-ar" dir="rtl" lang="ar">
              أ ب ت
            </span>
            <span className="mj-bigbtn-text">
              <b>Quiz all 28 letters</b>
              <small>Recognize the shape and the sound</small>
            </span>
          </button>
          {learnedLetters.length >= 3 && (
            <button className="mj-bigbtn" onClick={() => buildLettersQuiz(true)}>
              <span className="mj-bigbtn-ar mj-bigbtn-teal">✓</span>
              <span className="mj-bigbtn-text">
                <b>Just my learned letters</b>
                <small>{learnedLetters.length} so far</small>
              </span>
            </button>
          )}

          <div className="mj-sectlabel" style={{ marginTop: 26 }}>
            From a lesson
          </div>
          <div className="mj-topics">
            {LESSON_TOPICS.map((t) => (
              <Chip key={t} tone="gold" onClick={() => buildLessonQuiz(t)}>
                {t}
              </Chip>
            ))}
          </div>
          <div className="mj-customrow">
            <input
              className="mj-input mj-custominput"
              placeholder="…or quiz me on any topic"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") buildLessonQuiz();
              }}
            />
            <button
              className="mj-build"
              onClick={() => buildLessonQuiz()}
              disabled={loading || !custom.trim()}
            >
              Build
            </button>
          </div>

          {loading && (
            <div className="mj-typing mj-typing-center">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {error && <div className="mj-error">{error}</div>}
        </div>
      </div>
    );
  }

  /* ---- results ---- */
  if (stage === "done") {
    const ratio = questions.length ? score / questions.length : 0;
    const msg =
      ratio >= 0.9
        ? "Excellent — that's really sticking."
        : ratio >= 0.6
        ? "Solid. A few worth another look."
        : "Early days — repetition is how it locks in.";
    return (
      <div className="mj-quiz">
        <div className="mj-scroll mj-resultwrap">
          <div className="mj-result">
            <div className="mj-resultscore">
              {score}
              <span className="mj-resultslash"> / {questions.length}</span>
            </div>
            <div className="mj-resultmsg">{msg}</div>
            <button className="mj-startreview" onClick={() => setStage("setup")}>
              New quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- active ---- */
  const q = questions[idx];
  return (
    <div className="mj-quiz">
      <div className="mj-scroll">
        <div className="mj-ltr-detailtop">
          <button className="mj-back" onClick={() => setStage("setup")}>
            ← end quiz
          </button>
          <span className="mj-progress">
            {idx + 1} / {questions.length}
          </span>
        </div>

        <div className="mj-qprompt">{q.prompt}</div>

        {q.display && (
          <div className="mj-card mj-qdisplay">
            <div className="mj-card-top">
              <div
                className={"mj-ar " + (q.display.glyph ? "mj-qglyph" : "mj-qphrase")}
                dir="rtl"
                lang="ar"
              >
                {q.display.glyph || q.display.arabic}
              </div>
              {q.hearable && <Speaker onClick={() => speak(q.hearable)} />}
            </div>
          </div>
        )}

        <div className="mj-options">
          {q.options.map((o, i) => {
            let cls = "mj-option";
            if (picked !== null) {
              if (i === q.answer) cls += " mj-opt-correct";
              else if (i === picked) cls += " mj-opt-wrong";
              else cls += " mj-opt-dim";
            }
            return (
              <button
                key={i}
                className={cls}
                disabled={picked !== null}
                onClick={() => choose(i)}
              >
                <span
                  className={o.arabic ? "mj-ar mj-optar" : "mj-opttext"}
                  dir={o.arabic ? "rtl" : "ltr"}
                  lang={o.arabic ? "ar" : undefined}
                >
                  {o.text}
                </span>
                {picked !== null && i === q.answer && (
                  <span className="mj-markwrap">
                    <span className="mj-spark-burst" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map((k) => (
                        <span
                          key={k}
                          className="mj-sparkray"
                          style={{ transform: `rotate(${k * 60}deg)` }}
                        >
                          <span className="mj-spark" />
                        </span>
                      ))}
                    </span>
                    <span className="mj-mark mj-mark-pop">✓</span>
                  </span>
                )}
                {picked !== null && i === picked && i !== q.answer && (
                  <span className="mj-mark mj-markx mj-mark-pop">✕</span>
                )}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mj-qfoot">
            {q.explain && <div className="mj-explain">{q.explain}</div>}
            <button className="mj-next" onClick={next}>
              {idx + 1 >= questions.length ? "See results" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   App shell
   ========================================================= */
export default function App() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState({
    dialect: "Modern Standard Arabic (MSA)",
    level: "Beginner",
    goal: "Everyday conversation",
    showTranslit: true,
    showEnglish: true,
    sfx: true,
  });
  const [deck, setDeck] = useState([]);
  const [learned, setLearned] = useState([]);
  const [view, setView] = useState("letters");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const [, force] = useState(0);

  // load persisted state
  useEffect(() => {
    (async () => {
      const s = await storeGet("settings", null);
      const d = await storeGet("deck", []);
      const ll = await storeGet("learned", []);
      if (s) setSettings((cur) => ({ ...cur, ...s }));
      if (Array.isArray(d)) setDeck(d);
      if (Array.isArray(ll)) setLearned(ll);
      setReady(true);
    })();
  }, []);

  // persist
  useEffect(() => {
    if (ready) storeSet("settings", settings);
  }, [settings, ready]);
  useEffect(() => {
    if (ready) storeSet("deck", deck);
  }, [deck, ready]);
  useEffect(() => {
    if (ready) storeSet("learned", learned);
  }, [learned, ready]);

  // make voices populate
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const f = () => force((n) => n + 1);
    window.speechSynthesis.onvoiceschanged = f;
    f();
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis) {
        setNoVoice(true);
        return;
      }
      window.speechSynthesis.cancel();
      const prefs = VOICE_PREFS[settings.dialect] || ["ar"];
      const v = pickVoice(prefs);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = (v && v.lang) || prefs[0];
      if (v) u.voice = v;
      u.rate = 0.85;
      const hasAr = (
        (window.speechSynthesis.getVoices() || []).some(
          (vc) => vc.lang && vc.lang.toLowerCase().startsWith("ar")
        )
      );
      if (!hasAr) setNoVoice(true);
      window.speechSynthesis.speak(u);
    },
    [settings.dialect]
  );

  const addCard = useCallback(
    (w) => {
      if (!w.arabic) return;
      setDeck((d) =>
        d.some((c) => c.arabic === w.arabic)
          ? d
          : [
              ...d,
              {
                id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                arabic: w.arabic,
                translit: w.translit || "",
                english: w.english || "",
                box: 1,
                due: Date.now(),
              },
            ]
      );
    },
    []
  );

  const dueCount = deck.filter((c) => c.due <= Date.now()).length;

  return (
    <div className="mj-root">
      <style>{CSS}</style>

      <header className="mj-header">
        <button className="mj-brand" onClick={() => setSettingsOpen(true)}>
          <span className="mj-wordmark" dir="rtl" lang="ar">
            مَجْلِس
          </span>
          <span className="mj-tagline">
            {settings.dialect.replace(" (MSA)", "")} · {settings.level}
            <span className="mj-gear"> ⚙</span>
          </span>
        </button>
      </header>

      <nav className="mj-tabs">
        {[
          ["letters", "Letters"],
          ["converse", "Converse"],
          ["lessons", "Lessons"],
          ["quiz", "Quiz"],
          ["deck", dueCount > 0 ? `Deck · ${dueCount}` : "Deck"],
        ].map(([k, label]) => (
          <button
            key={k}
            className="mj-tab"
            onClick={() => setView(k)}
            style={
              view === k
                ? { color: T.cream, borderColor: T.gold }
                : {}
            }
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mj-main">
        {!ready ? (
          <div className="mj-boot">Opening your study…</div>
        ) : view === "letters" ? (
          <Letters
            settings={settings}
            speak={speak}
            learned={learned}
            setLearned={setLearned}
            deck={deck}
            addCard={addCard}
          />
        ) : view === "converse" ? (
          <Converse settings={settings} speak={speak} deck={deck} addCard={addCard} />
        ) : view === "lessons" ? (
          <Lessons settings={settings} speak={speak} deck={deck} addCard={addCard} />
        ) : view === "quiz" ? (
          <Quiz settings={settings} speak={speak} learned={learned} />
        ) : (
          <Deck settings={settings} speak={speak} deck={deck} setDeck={setDeck} />
        )}
      </main>

      {noVoice && (
        <div className="mj-voicebar" onClick={() => setNoVoice(false)}>
          No Arabic voice found on this device — pronunciation audio may be
          silent. Tap to dismiss.
        </div>
      )}

      {settingsOpen && (
        <Settings
          settings={settings}
          setSettings={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

/* =========================================================
   Styles
   ========================================================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Inter:wght@400;500;600&display=swap');

* { box-sizing: border-box; }
.mj-root {
  --canvas:${T.canvas};
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  background:
    radial-gradient(120% 80% at 50% -10%, #18302F 0%, ${T.canvas} 55%);
  color: ${T.cream};
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}
.mj-ar { font-family: 'Amiri', serif; color: ${T.inkText}; line-height: 1.7; }

/* header */
.mj-header { padding: 16px 20px 10px; }
.mj-brand {
  background: none; border: none; padding: 0; cursor: pointer;
  display: flex; align-items: baseline; gap: 12px; text-align: left;
}
.mj-wordmark {
  font-family: 'Amiri', serif; font-size: 30px; font-weight: 700;
  color: ${T.cream}; line-height: 1;
}
.mj-tagline {
  font-size: 12px; color: ${T.muted}; letter-spacing: .04em;
  text-transform: uppercase;
}
.mj-gear { color: ${T.gold}; margin-left: 4px; }

/* tabs */
.mj-tabs {
  display: flex; gap: 4px; padding: 0 16px;
  border-bottom: 1px solid ${T.edge};
}
.mj-tab {
  background: none; border: none; cursor: pointer;
  color: ${T.muted}; font-family: 'Inter', sans-serif;
  font-size: 14px; font-weight: 500; letter-spacing: .02em;
  padding: 12px 14px; border-bottom: 2px solid transparent;
  margin-bottom: -1px; transition: color .15s;
}
.mj-tab:hover { color: ${T.cream}; }

.mj-main { flex: 1; min-height: 0; display: flex; }
.mj-boot, .mj-converse, .mj-lessons, .mj-deck, .mj-review {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
}
.mj-boot { align-items: center; justify-content: center; color: ${T.muted}; }

.mj-scroll {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 20px 16px 28px;
  scrollbar-width: thin; scrollbar-color: ${T.edge} transparent;
}
.mj-scroll::-webkit-scrollbar { width: 7px; }
.mj-scroll::-webkit-scrollbar-thumb { background: ${T.edge}; border-radius: 4px; }

/* the parchment card — Arabic lives here */
.mj-card {
  background:
    linear-gradient(${T.parchment}, ${T.parchment}) padding-box;
  border: 1px solid ${T.parchmentEdge};
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 10px 28px -16px rgba(0,0,0,.6);
  margin-bottom: 10px;
}
.mj-card-top {
  display: flex; align-items: flex-start; gap: 12px;
  justify-content: space-between;
}
.mj-ar { font-size: 27px; flex: 1; }
.mj-ar-big { font-size: 38px; text-align: center; width: 100%; }
.mj-ar-row { font-size: 22px; }
.mj-speak {
  flex: none; width: 38px; height: 38px; border-radius: 10px;
  background: #fff6e4; border: 1px solid #ecdcb6; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform .12s, background .15s;
}
.mj-speak:hover { background: #fdedca; transform: translateY(-1px); }
.mj-speak:active { transform: translateY(0); }

.mj-reveal { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.mj-translit {
  font-family: 'Newsreader', serif; font-style: italic;
  font-size: 17px; color: #6a5a3a;
}
.mj-en { font-size: 15px; color: ${T.inkText}; font-weight: 500; }
.mj-peek {
  align-self: flex-start; background: none; border: none; cursor: pointer;
  color: #9c8a63; font-size: 13px; font-style: italic;
  font-family: 'Newsreader', serif; padding: 2px 0;
  border-bottom: 1px dashed #c9b78c;
}
.mj-peek:hover { color: #6a5a3a; }

.mj-add {
  margin-top: 14px; background: none; cursor: pointer;
  border: 1px solid #d8c79e; border-radius: 999px;
  color: #7a6843; font-size: 13px; font-weight: 500;
  padding: 6px 14px; transition: all .15s;
}
.mj-add:hover:not(:disabled) { background: #ece0c2; }
.mj-add:disabled { cursor: default; }

/* conversation */
.mj-turn { margin-bottom: 18px; }
.mj-userwrap { display: flex; justify-content: flex-end; margin-bottom: 14px; }
.mj-userbubble {
  background: ${T.panelHi}; border: 1px solid ${T.edge};
  color: ${T.cream}; padding: 11px 15px; border-radius: 14px 14px 4px 14px;
  max-width: 80%; font-size: 15px; line-height: 1.5;
}
.mj-correction {
  background: ${T.roseDim}; border: 1px solid #5a3a37;
  border-radius: 12px; padding: 10px 14px; margin-bottom: 8px;
  font-size: 14px; color: #f0cfcc; line-height: 1.45;
}
.mj-corr-label {
  display: inline-block; font-size: 10px; letter-spacing: .12em;
  text-transform: uppercase; color: ${T.rose}; margin-right: 8px;
  font-weight: 600;
}
.mj-words { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.mj-wordchip {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  background: ${T.panel}; border: 1px solid ${T.edge};
  border-radius: 999px; padding: 6px 12px 6px 14px;
}
.mj-wordchip:hover:not(:disabled) { border-color: ${T.gold}; }
.mj-wordchip:disabled { cursor: default; }
.mj-wordar { font-family: 'Amiri', serif; font-size: 18px; color: ${T.cream}; }
.mj-worden { font-size: 11px; color: ${T.muted}; letter-spacing: .03em; }

.mj-typing { display: flex; gap: 5px; padding: 8px 4px; }
.mj-typing-center { justify-content: center; padding: 28px; }
.mj-typing span {
  width: 7px; height: 7px; border-radius: 50%; background: ${T.muted};
  animation: mjb 1.1s infinite ease-in-out;
}
.mj-typing span:nth-child(2) { animation-delay: .18s; }
.mj-typing span:nth-child(3) { animation-delay: .36s; }
@keyframes mjb { 0%,80%,100% { opacity:.25; transform:translateY(0);} 40% { opacity:1; transform:translateY(-4px);} }

.mj-error {
  color: ${T.rose}; font-size: 14px; padding: 10px 14px;
  border: 1px solid #5a3a37; border-radius: 10px; margin-top: 8px;
}

/* composer */
.mj-composer {
  display: flex; align-items: flex-end; gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid ${T.edge}; background: ${T.canvas};
}
.mj-input {
  flex: 1; resize: none; max-height: 120px;
  background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 12px;
  color: ${T.cream}; font-family: 'Inter', sans-serif; font-size: 15px;
  padding: 11px 14px; line-height: 1.4; outline: none;
}
.mj-input:focus { border-color: ${T.gold}; }
.mj-input::placeholder { color: #6f8783; }
.mj-send {
  flex: none; width: 44px; height: 44px; border-radius: 12px;
  background: ${T.gold}; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform .12s, opacity .15s;
}
.mj-send:hover:not(:disabled) { transform: translateY(-1px); }
.mj-send:disabled { opacity: .4; cursor: default; }

/* lessons */
.mj-lead, .mj-lesson-intro {
  font-family: 'Newsreader', serif; font-size: 17px; line-height: 1.55;
  color: ${T.muted}; margin: 0 0 18px;
}
.mj-topics { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.mj-chip {
  background: ${T.panel}; border: 1px solid ${T.edge}; cursor: pointer;
  color: ${T.cream}; border-radius: 999px; padding: 8px 14px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
  transition: all .15s;
}
.mj-chip:hover { border-color: ${T.muted}; }
.mj-customrow { display: flex; gap: 8px; margin-bottom: 8px; }
.mj-custominput { max-height: none; }
.mj-build, .mj-startreview, .mj-done, .mj-show, .mj-got, .mj-again {
  font-family: 'Inter', sans-serif; cursor: pointer; font-weight: 600;
  border-radius: 12px; transition: transform .12s, opacity .15s;
}
.mj-build {
  flex: none; background: ${T.gold}; border: none; color: #1a1205;
  padding: 0 18px; font-size: 14px;
}
.mj-build:disabled { opacity: .4; cursor: default; }
.mj-lesson { margin-top: 20px; }
.mj-lesson-title {
  font-family: 'Newsreader', serif; font-size: 25px; font-weight: 500;
  color: ${T.cream}; margin: 0 0 4px;
}
.mj-lesson-intro { margin-bottom: 18px; }
.mj-note {
  font-size: 13px; color: ${T.muted}; font-style: italic;
  margin: -4px 4px 14px; line-height: 1.45;
}
.mj-tip {
  margin-top: 18px; background: ${T.tealDim}33; border: 1px solid ${T.tealDim};
  border-radius: 12px; padding: 12px 15px; font-size: 14px;
  color: #bfe7dc; line-height: 1.5;
}
.mj-tip-label {
  display: inline-block; font-size: 10px; letter-spacing: .12em;
  text-transform: uppercase; color: ${T.teal}; margin-right: 8px; font-weight: 600;
}

/* deck */
.mj-deckhead {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px;
}
.mj-decknum {
  font-family: 'Newsreader', serif; font-size: 40px; line-height: 1; color: ${T.cream};
}
.mj-decklabel { font-size: 13px; color: ${T.muted}; margin-top: 2px; }
.mj-startreview {
  background: ${T.teal}; border: none; color: #06201b;
  padding: 12px 18px; font-size: 14px;
}
.mj-startreview:disabled { background: ${T.panel}; color: ${T.muted}; cursor: default; }
.mj-empty, .mj-allclear {
  font-family: 'Newsreader', serif; font-size: 16px; line-height: 1.6;
  color: ${T.muted}; padding: 20px; text-align: center;
  border: 1px dashed ${T.edge}; border-radius: 14px; margin-bottom: 20px;
}
.mj-allclear { color: ${T.teal}; border-color: ${T.tealDim}; }
.mj-deckrow {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 6px; border-bottom: 1px solid ${T.edge};
}
.mj-rowspeak { background: none; border: none; padding: 0; cursor: pointer; flex: none; }
.mj-rowtext { flex: 1; min-width: 0; }
.mj-ar-row { color: ${T.cream}; }
.mj-rowmeta { font-size: 13px; color: ${T.muted}; margin-top: 2px; }
.mj-rowright { display: flex; align-items: center; gap: 10px; flex: none; }
.mj-box {
  font-size: 11px; color: ${T.teal}; border: 1px solid ${T.tealDim};
  border-radius: 6px; padding: 2px 7px; letter-spacing: .03em;
}
.mj-del {
  background: none; border: none; cursor: pointer; color: ${T.muted};
  font-size: 22px; line-height: 1; padding: 0 4px;
}
.mj-del:hover { color: ${T.rose}; }

/* review */
.mj-review-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid ${T.edge};
}
.mj-back { background: none; border: none; cursor: pointer; color: ${T.muted}; font-size: 14px; }
.mj-back:hover { color: ${T.cream}; }
.mj-progress { font-size: 13px; color: ${T.muted}; letter-spacing: .05em; }
.mj-review-stage {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 24px 20px;
}
.mj-review-card { width: 100%; max-width: 460px; padding: 32px 24px; }
.mj-show {
  width: 100%; margin-top: 20px; background: ${T.inkText}; border: none;
  color: ${T.parchment}; padding: 13px; font-size: 15px;
}
.mj-grade {
  display: flex; gap: 12px; padding: 16px 20px calc(20px + env(safe-area-inset-bottom));
  max-width: 500px; margin: 0 auto; width: 100%;
}
.mj-again, .mj-got { flex: 1; padding: 15px; font-size: 15px; border: none; }
.mj-again { background: ${T.panelHi}; color: ${T.rose}; border: 1px solid #5a3a37; }
.mj-got { background: ${T.teal}; color: #06201b; }
.mj-again:hover, .mj-got:hover { transform: translateY(-1px); }

/* settings sheet */
.mj-sheet-wrap {
  position: fixed; inset: 0; background: rgba(6,14,15,.6);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 40; animation: mjfade .2s ease;
}
@keyframes mjfade { from { opacity: 0; } }
.mj-sheet {
  background: ${T.panel}; border: 1px solid ${T.edge};
  border-radius: 22px 22px 0 0; width: 100%; max-width: 560px;
  padding: 10px 20px calc(24px + env(safe-area-inset-bottom));
  max-height: 88vh; overflow-y: auto; animation: mjrise .26s cubic-bezier(.2,.8,.2,1);
}
@keyframes mjrise { from { transform: translateY(40px); opacity: .4; } }
.mj-sheet-grab {
  width: 40px; height: 4px; border-radius: 2px; background: ${T.edge};
  margin: 6px auto 16px;
}
.mj-sheet-title {
  font-family: 'Newsreader', serif; font-size: 22px; font-weight: 500;
  color: ${T.cream}; margin: 0 0 18px;
}
.mj-field { margin-bottom: 20px; }
.mj-flabel {
  display: block; font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
  color: ${T.muted}; margin-bottom: 10px; font-weight: 600;
}
.mj-opts { display: flex; flex-wrap: wrap; gap: 8px; }
.mj-hint {
  font-size: 13px; color: ${T.muted}; font-style: italic; line-height: 1.5;
  margin: 10px 2px 0; font-family: 'Newsreader', serif;
}
.mj-done {
  width: 100%; margin-top: 8px; background: ${T.gold}; border: none;
  color: #1a1205; padding: 14px; font-size: 15px;
}

.mj-voicebar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 30;
  background: ${T.roseDim}; border-top: 1px solid #5a3a37; cursor: pointer;
  color: #f0cfcc; font-size: 13px; text-align: center; padding: 10px 16px;
}

/* letters */
.mj-letters { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.mj-truths { display: flex; flex-direction: column; gap: 9px; margin-bottom: 22px; }
.mj-truth {
  display: flex; align-items: flex-start; gap: 12px;
  background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 12px;
  padding: 13px 15px; font-size: 14.5px; line-height: 1.5; color: ${T.cream};
}
.mj-truthnum {
  flex: none; width: 26px; height: 26px; border-radius: 7px;
  background: ${T.panelHi}; color: ${T.gold};
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; margin-top: -1px;
}
.mj-ltr-progress { margin-bottom: 16px; }
.mj-ltr-progress > span { font-size: 13px; color: ${T.muted}; letter-spacing: .04em; }
.mj-bar {
  height: 6px; border-radius: 3px; background: ${T.panel};
  border: 1px solid ${T.edge}; margin-top: 7px; overflow: hidden;
}
.mj-barfill { height: 100%; background: ${T.teal}; transition: width .3s ease; }
.mj-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }
.mj-gridcell {
  position: relative; cursor: pointer;
  background: ${T.parchment}; border: 1px solid ${T.parchmentEdge};
  border-radius: 12px; padding: 12px 6px 9px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: transform .12s, box-shadow .15s;
}
.mj-gridcell:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -12px rgba(0,0,0,.55); }
.mj-gridglyph { font-size: 34px; color: ${T.inkText}; line-height: 1; }
.mj-gridname { font-size: 11px; color: #7a6843; letter-spacing: .02em; }
.mj-dot {
  position: absolute; top: 8px; right: 8px; width: 8px; height: 8px;
  border-radius: 50%; background: ${T.teal};
}
.mj-ltr-detailtop {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.mj-ltr-hero { text-align: center; padding: 26px 22px; }
.mj-ltr-hero .mj-card-top { justify-content: center; position: relative; }
.mj-ltr-hero .mj-speak { position: absolute; right: 0; top: 50%; transform: translateY(-50%); }
.mj-ltr-big { font-size: 72px; flex: none; }
.mj-ltr-name {
  font-family: 'Newsreader', serif; font-size: 24px; color: ${T.inkText};
  margin-top: 10px; text-transform: capitalize;
}
.mj-ltr-sound { font-size: 15px; color: #6a5a3a; margin-top: 2px; }
.mj-ltr-sound b { color: ${T.inkText}; }
.mj-ltr-hint {
  font-family: 'Newsreader', serif; font-size: 15.5px; line-height: 1.55;
  color: #5e5036; margin-top: 12px;
}
.mj-formlabel {
  font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
  color: ${T.muted}; font-weight: 600; margin: 22px 2px 10px;
}
.mj-forms { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.mj-form {
  background: ${T.parchment}; border: 1px solid ${T.parchmentEdge};
  border-radius: 11px; padding: 14px 4px 8px; text-align: center;
}
.mj-formglyph { font-size: 32px; color: ${T.inkText}; line-height: 1.2; min-height: 42px; }
.mj-formcap { font-size: 11px; color: #7a6843; margin-top: 4px; }
.mj-ltr-nav { display: flex; align-items: center; gap: 8px; margin-top: 22px; }
.mj-navbtn {
  flex: none; background: ${T.panel}; border: 1px solid ${T.edge}; cursor: pointer;
  color: ${T.cream}; border-radius: 10px; padding: 11px 14px; font-size: 13px;
  font-family: 'Inter', sans-serif; font-weight: 500;
}
.mj-navbtn:disabled { opacity: .35; cursor: default; }
.mj-learnbtn {
  flex: 1; background: none; border: 1px solid ${T.tealDim}; cursor: pointer;
  color: ${T.teal}; border-radius: 10px; padding: 11px; font-size: 14px;
  font-family: 'Inter', sans-serif; font-weight: 600; transition: all .15s;
}

/* quiz */
.mj-quiz { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.mj-sectlabel {
  font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
  color: ${T.muted}; font-weight: 600; margin: 0 2px 12px;
}
.mj-bigbtn {
  display: flex; align-items: center; gap: 16px; width: 100%; cursor: pointer;
  background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 14px;
  padding: 16px 18px; margin-bottom: 10px; text-align: left;
  transition: transform .12s, border-color .15s;
}
.mj-bigbtn:hover { transform: translateY(-2px); border-color: ${T.gold}; }
.mj-bigbtn-ar {
  flex: none; width: 52px; height: 52px; border-radius: 12px;
  background: ${T.parchment}; color: ${T.inkText};
  font-family: 'Amiri', serif; font-size: 22px;
  display: flex; align-items: center; justify-content: center;
}
.mj-bigbtn-teal { background: ${T.tealDim}; color: ${T.teal}; font-size: 24px; }
.mj-bigbtn-text { display: flex; flex-direction: column; gap: 3px; }
.mj-bigbtn-text b { font-size: 15.5px; color: ${T.cream}; font-weight: 600; }
.mj-bigbtn-text small { font-size: 13px; color: ${T.muted}; }

.mj-qprompt {
  font-family: 'Newsreader', serif; font-size: 21px; line-height: 1.4;
  color: ${T.cream}; margin: 6px 2px 16px;
}
.mj-qdisplay { text-align: center; padding: 22px; }
.mj-qdisplay .mj-card-top { justify-content: center; position: relative; }
.mj-qdisplay .mj-speak { position: absolute; right: 0; top: 50%; transform: translateY(-50%); }
.mj-qglyph { font-size: 58px; flex: none; }
.mj-qphrase { font-size: 30px; flex: none; }

.mj-options { display: flex; flex-direction: column; gap: 9px; }
.mj-option {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  width: 100%; cursor: pointer; text-align: left;
  background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 12px;
  padding: 14px 16px; transition: border-color .15s, background .15s;
}
.mj-option:hover:not(:disabled) { border-color: ${T.muted}; }
.mj-opttext { font-size: 15px; color: ${T.cream}; }
.mj-optar { font-size: 26px; color: ${T.cream}; }
.mj-opt-correct {
  background: ${T.tealDim}55; border-color: ${T.teal};
}
.mj-opt-correct .mj-opttext, .mj-opt-correct .mj-optar { color: #d4f3ea; }
.mj-opt-wrong { background: ${T.roseDim}; border-color: ${T.rose}; }
.mj-opt-dim { opacity: .5; }
.mj-mark { flex: none; font-size: 16px; color: ${T.teal}; font-weight: 700; }
.mj-markx { color: ${T.rose}; }

.mj-qfoot { margin-top: 16px; }
.mj-explain {
  background: ${T.panelHi}; border: 1px solid ${T.edge}; border-radius: 12px;
  padding: 12px 15px; font-size: 14px; line-height: 1.5; color: ${T.muted};
  margin-bottom: 12px;
}
.mj-next {
  width: 100%; background: ${T.gold}; border: none; color: #1a1205;
  padding: 14px; font-size: 15px; font-weight: 600; border-radius: 12px;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: transform .12s;
}
.mj-next:hover { transform: translateY(-1px); }

.mj-resultwrap { display: flex; align-items: center; justify-content: center; }
.mj-result { text-align: center; padding: 30px 20px; max-width: 360px; }
.mj-resultscore {
  font-family: 'Newsreader', serif; font-size: 66px; line-height: 1; color: ${T.cream};
}
.mj-resultslash { color: ${T.muted}; font-size: 40px; }
.mj-resultmsg {
  font-family: 'Newsreader', serif; font-size: 18px; color: ${T.muted};
  margin: 14px 0 26px; line-height: 1.5;
}

/* quiz answer feedback */
.mj-markwrap {
  position: relative; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
}
.mj-mark-pop { animation: mj-pop .4s cubic-bezier(.2,1.5,.4,1) both; }
@keyframes mj-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.35); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.mj-markx { color: #E5645F; }
.mj-spark-burst { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.mj-sparkray { position: absolute; left: 0; top: 0; width: 0; height: 0; }
.mj-spark {
  position: absolute; left: -3px; top: -3px; width: 6px; height: 6px;
  border-radius: 50%; background: #61E3A4; box-shadow: 0 0 6px #61E3A4;
  animation: mj-spark .55s ease-out forwards;
}
@keyframes mj-spark {
  0% { opacity: 0; transform: translateY(-1px) scale(.3); }
  30% { opacity: 1; transform: translateY(-8px) scale(1); }
  100% { opacity: 0; transform: translateY(-18px) scale(.2); }
}
.mj-opt-wrong { animation: mj-shake .36s ease both; }
@keyframes mj-shake {
  0%, 100% { transform: translateX(0); }
  18% { transform: translateX(-6px); }
  36% { transform: translateX(6px); }
  54% { transform: translateX(-4px); }
  72% { transform: translateX(4px); }
  88% { transform: translateX(-2px); }
}
@media (prefers-reduced-motion: reduce) {
  .mj-spark-burst { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
:focus-visible { outline: 2px solid ${T.gold}; outline-offset: 2px; }
`;
