// Proxies requests to the Anthropic API so the API key stays server-side.
// Set ANTHROPIC_API_KEY in your Netlify site's environment variables.

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "Missing ANTHROPIC_API_KEY environment variable" },
      { status: 500 }
    );
  }
  const body = await req.text();
  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body,
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
};
