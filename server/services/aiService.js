const OPENROUTER_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const buildSystemPrompt = (contextBlock) => `
You are Paimon AI Chatbot, a helpful assistant for a web chat application.
Answer clearly and accurately.
If uploaded context is relevant, use it in the answer.
If the context does not contain the answer, say so briefly and rely on general knowledge.

Uploaded context:
${contextBlock}
`;

export const generateChatResponse = async ({
  message,
  history = [],
  contextBlock,
}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model =
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

  const payload = {
    model,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(contextBlock),
      },
      ...history.map((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.4,
  };

  const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Paimon AI Chatbot",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "No response generated.";
};
