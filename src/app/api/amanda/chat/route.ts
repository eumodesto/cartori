import { NextRequest, NextResponse } from "next/server";
import { clientHasPurchase, isAmandaClient } from "@/lib/amanda-access";
import { buildAmandaSystemPrompt } from "@/lib/amanda-knowledge";
import { extractAmandaProducts } from "@/lib/amanda-products";
import { requireAuth } from "@/lib/authorization";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MAX_MESSAGES = 16;
const MAX_CONTENT_LENGTH = 2000;

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function sanitizeMessages(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item): item is ChatTurn => {
      if (!item || typeof item !== "object") return false;
      const role = (item as ChatTurn).role;
      const content = (item as ChatTurn).content;
      return (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      );
    })
    .slice(-MAX_MESSAGES)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_CONTENT_LENGTH),
    }));
}

async function requireAmandaClient() {
  const auth = await requireAuth();
  if (!auth.ok) {
    return NextResponse.json(
      {
        available: false,
        success: false,
        error: "Entre na conta para falar com a Amanda.",
      },
      { status: 401 }
    );
  }
  if (!isAmandaClient(auth.context)) {
    return NextResponse.json(
      {
        available: false,
        success: false,
        error: "A Amanda fica no painel do cliente.",
      },
      { status: 403 }
    );
  }
  const purchased = await clientHasPurchase(auth.context.userId);
  if (!purchased) {
    return NextResponse.json(
      {
        available: false,
        success: false,
        error: "A Amanda aparece no painel depois do primeiro pedido.",
      },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const denied = await requireAmandaClient();
  if (denied) return NextResponse.json({ available: false });
  return NextResponse.json({ available: true });
}

export async function POST(req: NextRequest) {
  const denied = await requireAmandaClient();
  if (denied) return denied;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "A Amanda ainda não está configurada neste ambiente.",
      },
      { status: 503 }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Não foi possível ler a mensagem." },
      { status: 400 }
    );
  }

  const history = sanitizeMessages(body.messages);
  const lastUser = [...history].reverse().find((item) => item.role === "user");

  if (!lastUser) {
    return NextResponse.json(
      { success: false, error: "Envie uma pergunta para a Amanda." },
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const openaiResponse = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 420,
        messages: [
          { role: "system", content: buildAmandaSystemPrompt() },
          ...history,
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const details = await openaiResponse.text();
      console.error("OpenAI Amanda error:", openaiResponse.status, details);
      return NextResponse.json(
        {
          success: false,
          error:
            "A Amanda está temporariamente indisponível. Tente novamente em instantes.",
        },
        { status: 502 }
      );
    }

    const payload = await openaiResponse.json();
    const rawReply =
      payload?.choices?.[0]?.message?.content?.trim() ||
      "Não consegui montar uma resposta agora. Pode reformular a pergunta?";

    const { text: reply, products } = extractAmandaProducts(
      rawReply,
      lastUser.content
    );

    return NextResponse.json({ success: true, reply, products });
  } catch (error) {
    console.error("Amanda chat failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao conversar com a Amanda. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
