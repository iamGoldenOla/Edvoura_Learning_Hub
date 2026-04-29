const fs = require("fs");

const responseString = `{"message":{"model":"claude-sonnet-4-6","id":"msg_018583YM3Rpz5XLY1a3qBBza","type":"message","role":"assistant","content":[{"type":"text","text":"Parts of Speech: The Building Blocks of Every Sentence"}]}}`;

function readPuterText(response) {
  let candidate = response;

  if (typeof candidate === "string") {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        candidate = parsed;
      }
    } catch {
      // fine
    }
  }

  if (candidate && typeof candidate === "object") {
    if (
      candidate.message &&
      Array.isArray(candidate.message.content) &&
      candidate.message.content[0] &&
      typeof candidate.message.content[0].text === "string"
    ) {
      return candidate.message.content[0].text;
    }

    if (
      candidate.message &&
      typeof candidate.message.content === "string"
    ) {
      return candidate.message.content;
    }

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

  return typeof response === "string" ? response : JSON.stringify(response);
}

console.log(readPuterText(responseString));
