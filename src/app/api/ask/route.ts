import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) {
      return NextResponse.json({ error: "Ask a question about the repository." }, { status: 400 });
    }

    const repo = body.repo && typeof body.repo === "object" ? body.repo : null;
    const analysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;
    if (!repo || !analysis) {
      return NextResponse.json({ error: "Analyze a repository before asking questions." }, { status: 400 });
    }

    const apiKey = process.env.GEMMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "The AI assistant is not configured." }, { status: 503 });
    }

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: "gemini-3.5-flash-lite",
    });
    const result = await model.generateContent(`You are a concise repository mentor. Answer the user's question using only the repository context below. If the context does not contain enough information, say what is missing instead of inventing a file or behavior.

Repository:
${JSON.stringify(repo)}

Existing analysis:
${JSON.stringify(analysis)}

Question:
${question}`);

    return NextResponse.json({ answer: result.response.text().trim() });
  } catch (error) {
    console.error("Repository assistant error:", error);
    return NextResponse.json({ error: "The repository assistant is temporarily unavailable." }, { status: 500 });
  }
}
