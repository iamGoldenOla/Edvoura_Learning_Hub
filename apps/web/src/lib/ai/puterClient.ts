export const DEFAULT_EDVOURA_AI_MODEL =
  process.env.NEXT_PUBLIC_EDVOURA_AI_MODEL || "gpt-5-nano";

function readPuterText(response: unknown): string {
  if (typeof response === "string") {
    return response;
  }

  if (response && typeof response === "object") {
    const candidate = response as { text?: unknown; message?: unknown };
    if (typeof candidate.text === "string") {
      return candidate.text;
    }
    if (typeof candidate.message === "string") {
      return candidate.message;
    }
  }

  return JSON.stringify(response);
}

export function getPuter() {
  if (typeof window === "undefined") {
    throw new Error("Puter.js is not available during server-side rendering");
  }

  if (!window.puter) {
    throw new Error("Puter.js has not loaded yet");
  }

  return window.puter;
}

export async function ensurePuterReady() {
  const puter = getPuter();

  if (!puter.ai || !puter.ai.chat) {
    throw new Error("Puter AI is not available");
  }

  return puter;
}

export async function generateWithPuterAI(
  prompt: string,
  options?: {
    model?: string;
    stream?: boolean;
  },
) {
  const puter = await ensurePuterReady();

  try {
    const response = await puter.ai!.chat!(prompt, {
      model: options?.model || DEFAULT_EDVOURA_AI_MODEL,
      stream: options?.stream || false,
    });

    return {
      raw: response,
      text: readPuterText(response),
    };
  } catch (error) {
    console.error("Puter AI generation failed:", error);
    throw new Error(
      "AI generation is temporarily unavailable. You can still create or edit this content manually.",
    );
  }
}

export async function streamWithPuterAI(
  prompt: string,
  onChunk: (text: string) => void,
  model = DEFAULT_EDVOURA_AI_MODEL,
) {
  const puter = await ensurePuterReady();

  const response = (await puter.ai!.chat!(prompt, {
    model,
    stream: true,
  })) as AsyncIterable<{ text?: string }>;

  for await (const part of response) {
    if (part?.text) {
      onChunk(part.text);
    }
  }
}

export async function getPuterUserIfSignedIn() {
  const puter = getPuter();

  try {
    const isSignedIn = puter.auth?.isSignedIn?.();

    if (!isSignedIn) {
      return null;
    }

    return await puter.auth?.getUser?.();
  } catch (error) {
    console.warn("Unable to get Puter user:", error);
    return null;
  }
}
