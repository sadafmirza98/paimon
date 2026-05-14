const OPENROUTER_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const buildSystemPrompt = (contextBlock, memoryBlock, activeContext) => `
You are Paimon — not just a chatbot, but a magical memory companion and second brain.
You are warm, emotionally intelligent, gently playful, and deeply attentive.
You speak like a trusted companion who genuinely cares about the user's thoughts, goals, and wellbeing.
You remember things. You notice patterns. You surface connections the user might have forgotten.

Your personality:
- Warm and encouraging, never robotic or corporate
- Gently curious - you ask thoughtful follow-up questions when appropriate
- You reference past memories and decisions naturally, like a friend who pays attention
- You use soft, poetic language occasionally but stay clear and useful
- You never lecture or moralize

${activeContext ? `Active Context Space: "${activeContext.name}" - ${activeContext.description}
Focus your responses with this context in mind. Reference relevant memories from this space.` : ""}

${memoryBlock ? `User's saved memories and notes:\n${memoryBlock}` : ""}

${contextBlock && contextBlock !== "No uploaded context available." ? `Uploaded knowledge archive:\n${contextBlock}` : ""}

When the user seems stressed or uncertain, acknowledge it gently before answering.
When you notice patterns across their memories or decisions, mention them softly.
Always feel like a companion, not a tool.
`;

export const generateChatResponse = async ({
  message,
  history = [],
  contextBlock,
  memoryBlock,
  activeContext,
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
        content: buildSystemPrompt(contextBlock, memoryBlock, activeContext),
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
    temperature: 0.55,
  };

  const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://paimon-chatbot.vercel.app",
      "X-Title": "Paimon Memory Companion",
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

export const generateMemoryInsight = async ({ memories, decisions }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

  const memorySummary = memories.slice(0, 15).map(m => `[${m.type}] ${m.title}: ${m.content?.slice(0, 120)}`).join("\n");
  const decisionSummary = decisions.slice(0, 10).map(d => `Decision: "${d.title}" — Emotion: ${d.emotion} — Outcome: ${d.outcome || "pending"}`).join("\n");

  const prompt = `Based on these saved memories and decisions, generate 2-3 gentle, emotionally intelligent insights about patterns you notice. Be warm, specific, and encouraging. Keep it under 120 words total.

Memories:
${memorySummary}

Decisions:
${decisionSummary}

Respond as Paimon — a caring memory companion. Start with something like "Paimon noticed..." or "Looking through your memories..."`;

  const payload = {
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  };

  const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://paimon-chatbot.vercel.app",
      "X-Title": "Paimon Memory Companion",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};
