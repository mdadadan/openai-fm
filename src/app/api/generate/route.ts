import { NextRequest, userAgent } from "next/server";

export const MAX_INPUT_LENGTH = 1000;
export const MAX_PROMPT_LENGTH = 1000;

// GET handler that proxies requests to the OpenAI TTS API and streams
// the response back to the client.
import { VOICES } from "@/lib/library";

function buildHeaders({
  response_format,
  filename,
  forceDownload,
}: {
  response_format: "wav" | "mp3";
  filename: string;
  forceDownload: boolean;
}) {
  const headers = new Headers();

  headers.set(
    "Content-Type",
    response_format === "wav" ? "audio/wav" : "audio/mpeg"
  );

  // ✅ download=1 のときだけ添付（保存）にする
  // 通常は inline（その場で再生）
  headers.set(
    "Content-Disposition",
    `${forceDownload ? "attachment" : "inline"}; filename="${filename}"`
  );

  // キャッシュで挙動が崩れやすいので抑止
  headers.set("Cache-Control", "no-store");

  return headers;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const ua = userAgent(req);
  const response_format = ua.engine?.name === "Blink" ? "wav" : "mp3";

  // ✅ クエリに download=1 が付いていたら保存モード
  const forceDownload = searchParams.get("download") === "1";

  // Get parameters from the query string
  let input = searchParams.get("input") || "";
  let prompt = searchParams.get("prompt") || "";
  const voice = searchParams.get("voice") || "";
  const vibe = searchParams.get("vibe") || "audio";

  // Truncate input and prompt to max 1000 characters
  input = input.slice(0, MAX_INPUT_LENGTH);
  prompt = prompt.slice(0, MAX_PROMPT_LENGTH);

  if (!VOICES.includes(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.TTS_MODEL ?? "tts-1",
        input,
        response_format,
        voice,
        ...(prompt && { instructions: prompt }),
      }),
    });

    if (!apiResponse.ok) {
      return new Response(`An error occurred while generating the audio.`, {
        status: apiResponse.status,
      });
    }

    const filename = `openai-fm-${voice}-${vibe}.${response_format}`;

    // Stream response back to client.
    return new Response(apiResponse.body, {
      headers: buildHeaders({ response_format, filename, forceDownload }),
    });
  } catch (err) {
    console.error("Error generating speech:", err);
    return new Response("Error generating speech", {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  const ua = userAgent(req);
  const response_format = ua.engine?.name === "Blink" ? "wav" : "mp3";

  const formData = await req.formData();
  let input = formData.get("input")?.toString() || "";
  let prompt = formData.get("prompt")?.toString() || "";
  const voice = formData.get("voice")?.toString() || "";
  const vibe = formData.get("vibe") || "audio";

  // ✅ POST の場合も ?download=1 が付いていたら保存モード
  // （フロントがPOSTで叩く実装でも対応できるようにする）
  const { searchParams } = new URL(req.url);
  const forceDownload = searchParams.get("download") === "1";

  // Truncate input and prompt to max 1000 characters
  input = input.slice(0, MAX_INPUT_LENGTH);
  prompt = prompt.slice(0, MAX_PROMPT_LENGTH);

  if (!VOICES.includes(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // ✅ GETと揃える（gpt-4o-mini-tts で403/権限エラーになるケースがあるため）
        model: process.env.TTS_MODEL ?? "tts-1",
        input,
        response_format,
        voice,
        ...(prompt && { instructions: prompt }),
      }),
    });

    if (!apiResponse.ok) {
      return new Response(`An error occurred while generating the audio.`, {
        status: apiResponse.status,
      });
    }

    const filename = `openai-fm-${voice}-${vibe}.${response_format}`;

    // Stream response back to client.
    return new Response(apiResponse.body, {
      headers: buildHeaders({ response_format, filename, forceDownload }),
    });
  } catch (err) {
    console.error("Error generating speech:", err);
    return new Response("Error generating speech", {
      status: 500,
    });
  }
}
