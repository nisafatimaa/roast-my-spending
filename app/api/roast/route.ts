import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Created once when the server starts, not per request.andedeff
const anthropic = new Anthropic();

function computeTotal(expenses: string): number {
  const lines = expenses.split("\n").filter((line) => line.trim());

  let total = 0;
  for (const line of lines) {
    const match = line.match(/\d+(\.\d+)?/); 
    if (match) {
      total += parseFloat(match[0]);
    }
  }

  return total;
}

export async function POST(req: Request) {
  const { expenses } = await req.json();

  if (!expenses?.trim()) {
    return NextResponse.json(
      { error: "Paste some expenses first." },
      { status: 400 },
    );
  }

  const total = computeTotal(expenses);

  async function callAndParse() {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are roasting the user's spending habits based on the expenses they paste in.
Persona: you are a sarcastic but funny old grandma with bad knees, roasting your friend's spending like you've known them for years. Silly and warm underneath the sass.
All amounts are in USD. Never convert to any other currency.
If the user's message is not expenses (chit-chat, gibberish, random words), respond with the roast field saying something like "sorry dearie, granny's hearing aid is acting up, tell me what you actually bought" in granny's voice. Set guilt_score to -1 in this case (a signal that there was nothing to judge). Set honest_tip to a short funny non-advice line, like a joke about how granny can't give financial advice on silence, in granny's voice.
Respond with ONLY valid JSON in exactly this shape, no other text before or after, no markdown code fences:
{
  "roast": "string, sarcastic grandma roast, under 80 words, plain sentences, no markdown, ends with a grumble not a question",
  "guilt_score": "number from 1 to 10, how bad these expenses are: 1 means responsible saint, 10 means financial disaster, judge by vibe and necessity not just the dollar amount",
  "honest_tip": "string, one genuine non-sarcastic piece of advice",
   "total_spent": "number, must exactly match the computed total given to you, do not alter it"
}`,
      messages: [
        {
          role: "user",
          content: `Expenses:\n${expenses}\n\nComputed total (already calculated correctly, do not recalculate): $${total.toFixed(2)}`,
        },
      ],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return JSON.parse(text); // throws if invalid JSON, caller decides what happens next
  }

  try {
    let parsed;
    try {
      parsed = await callAndParse(); // attempt 1
    } catch {
      console.error("First attempt gave bad JSON, retrying once...");
      try {
        parsed = await callAndParse(); // attempt 2
      } catch {
        console.error("Second attempt also failed.");
        return NextResponse.json(
          { error: "Granny got confused, try again." },
          { status: 500 },
        );
      }
    }

    console.log("Computed total:", total, "| Model echoed:", parsed.total_spent);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Roast machine broke. Try again." },
      { status: 500 },
    );
  }
}