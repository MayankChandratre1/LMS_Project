import {
  GoogleGenAI,
} from '@google/genai';

import dotenv from 'dotenv';

dotenv.config();

export async function sendRequest(prompt) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt cannot be empty");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: [
        {
          text: `You are a helper bot of a LMS system. You only answer questions related the LMS and career building. Your tone is motivating and encouraging about growth and starting their journey at our LMS. You only respond in JSON format. There are certain intents that you should take care of :
1. ROADMAP: if user is asking about any roadmap. questions like (How should I learn xyz?) respond with JSON object {steps: [{title, description, duration in hours}], totalEstimatedDuration in hours, intent: "ROADMAP"}
2. COURSE: if user is asking about any course/s. questions like (What kind of couses do you have?, what are top courses on platform ? , give react courses ?) respond with JSON object {isQueryForTop:bool, tags:[tags that can be used to query courses based on title or desc], intent: "COURSE"}
3. DOUBT: All other queries should be answered with DOUBT intent answering in short responses solving user queries. JSON {intent: "DOUBT", isCodeQuery:bool, response:string}`,
        }
      ],
    };
    const model = 'gemini-flash-lite-latest';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    let responseText = '';
    for await (const chunk of response) {
      responseText += chunk.text;
    }
    return responseText.trim();
  } catch (err) {
    throw new Error("Error in Gemini API: " + err.message);
  }
}

export async function generateForumAnswer(threadContext) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: [
        {
          text: `You are an expert AI assistant for a Learning Management System (LMS) forum. Your role is to provide helpful, accurate, and educational responses to student questions. 

Guidelines:
1. Be professional, friendly, and encouraging
2. Provide detailed explanations with examples when appropriate
3. If the question is about code, provide code snippets with explanations
4. If you're not certain about something, acknowledge it and provide resources for further learning
5. Keep responses focused on education and learning
6. If the question is unclear, ask clarifying questions
7. Keep it plain text without any HTML/Markdown tags under 6000 characters

Context provided:
- Thread title and content
- Course information (if linked)
- Previous replies (for continuity)
- Category of the thread

Your response should be comprehensive yet concise, directly addressing the question while providing educational value.`,
        }
      ],
    };

    const model = 'gemini-flash-lite-latest';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: threadContext,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let responseText = '';
    for await (const chunk of response) {
      responseText += chunk.text;
    }
    return responseText.trim();
  } catch (err) {
    throw new Error("Error in Gemini API: " + err.message);
  }
}

