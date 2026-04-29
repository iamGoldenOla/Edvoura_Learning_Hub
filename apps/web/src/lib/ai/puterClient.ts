export const DEFAULT_EDVOURA_AI_MODEL =
  process.env.NEXT_PUBLIC_EDVOURA_AI_MODEL || "claude-sonnet-4-6";

const PUTER_LOAD_TIMEOUT_MS = 15000;
const PUTER_POLL_INTERVAL_MS = 250;

function readPuterText(response: unknown): string {
  if (typeof response === "string") {
    return response;
  }

  if (response && typeof response === "object") {
    const candidate = response as any;

    // Claude shape: response.message.content[0].text
    if (
      candidate.message &&
      Array.isArray(candidate.message.content) &&
      candidate.message.content[0] &&
      typeof candidate.message.content[0].text === "string"
    ) {
      return candidate.message.content[0].text;
    }

    // DeepSeek shape: response.message.content
    if (
      candidate.message &&
      typeof candidate.message.content === "string"
    ) {
      return candidate.message.content;
    }

    // Generic fallbacks
    if (typeof candidate.message === "string") {
      return candidate.message;
    }
    if (typeof candidate.text === "string") {
      return candidate.text;
    }
    if (typeof candidate.content === "string") {
      return candidate.content;
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

export async function waitForPuterToLoad(timeoutMs = PUTER_LOAD_TIMEOUT_MS) {
  if (typeof window === "undefined") {
    throw new Error("Puter.js is not available during server-side rendering");
  }

  const startedAt = Date.now();

  while (!window.puter) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(
        "Puter.js did not finish loading. Check your connection, disable strict script blockers, and try again.",
      );
    }

    await new Promise((resolve) => window.setTimeout(resolve, PUTER_POLL_INTERVAL_MS));
  }

  return window.puter;
}

export async function ensurePuterReady() {
  const puter = await waitForPuterToLoad();

  if (!puter.ai || !puter.ai.chat) {
    throw new Error("Puter AI is not available");
  }

  if (!puter.auth?.isSignedIn?.()) {
    throw new Error("Sign in to Puter before generating AI content.");
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Puter AI Error: ${errorMessage}`);
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
  const puter = await waitForPuterToLoad();

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

export async function signInToPuter() {
  const puter = await waitForPuterToLoad();

  if (puter.auth?.isSignedIn?.()) {
    return await puter.auth?.getUser?.();
  }

  if (!puter.auth?.signIn) {
    throw new Error("Puter sign-in is not available yet. Reload this page and try again.");
  }

  try {
    await puter.auth.signIn();
    return await puter.auth?.getUser?.();
  } catch (error) {
    console.error("Puter sign-in failed:", error);
    throw new Error("Puter sign-in did not complete. Try again and allow the popup window.");
  }
}
