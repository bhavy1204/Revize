import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateQuizQuestions = async (title, description) => {
    const prompt = `You are a quiz generator. Based on the following topic, generate exactly 30 multiple-choice questions to help someone revise/retain this topic through spaced repetition.

Title: ${title}
Description: ${description || "No additional description provided."}

Difficulty: moderate.

Return ONLY a JSON array (no markdown, no prose) of 30 objects, each with this exact shape:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0
}

correctIndex is the 0-based index of the correct option in the options array. Vary correctIndex across questions (don't always put it at 0). Ensure questions are distinct from each other and cover different aspects of the topic.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    const questions = Array.isArray(parsed) ? parsed : parsed.questions;

    if (!questions || questions.length < 30) {
        throw new Error("AI did not return 30 questions");
    }

    return questions.slice(0, 30).map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        used: false
    }));
};

