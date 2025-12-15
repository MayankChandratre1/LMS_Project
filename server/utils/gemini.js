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

export async function generateQuizQuestions(topicDescription) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    if (!topicDescription || topicDescription.trim() === "") {
      throw new Error("Topic description cannot be empty");
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
          text: `You are an expert quiz generator for a Learning Management System (LMS). Your role is to create high-quality, educational quiz questions based on the topic description provided.

CRITICAL: You MUST respond with ONLY a valid JSON object, no additional text, no markdown formatting, no code blocks.

Generate 5-10 multiple choice questions based on the topic. Each question must follow this EXACT structure:
{
  "questions": [
    {
      "question": "The question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOption": 0,
      "timeout": 30
    }
  ]
}

Rules:
1. Generate 5-10 questions that cover different aspects of the topic
2. Each question must have exactly 4 options
3. correctOption is the index (0-3) of the correct answer in the options array
4. timeout is in seconds, use 30 for easy questions, 45 for medium, 60 for hard
5. Make questions clear, educational, and appropriate for the topic level
6. Ensure options are plausible but only one is correct
7. Mix difficulty levels (easy, medium, hard)
8. RESPOND ONLY WITH THE JSON OBJECT, NO OTHER TEXT`,
        }
      ],
    };

    const model = 'gemini-flash-lite-latest';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Generate quiz questions for the following topic:\n\n${topicDescription}`,
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

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Parse and validate the JSON
    const parsedResponse = JSON.parse(cleanedResponse);

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid response format from AI");
    }

    return parsedResponse.questions;
  } catch (err) {
    throw new Error("Error generating quiz questions: " + err.message);
  }
}

export async function generateLectureChatResponse(lectureContext, userMessage) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    if (!userMessage || userMessage.trim() === "") {
      throw new Error("User message cannot be empty");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { title, description, transcript } = lectureContext;

    const systemPrompt = `You are an AI tutor helping students understand a lecture.

Lecture Title: ${title}
Lecture Description: ${description}
${transcript ? `\nLecture Transcript:\n${transcript}` : ''}

Answer student questions about this lecture. Be helpful, clear, and educational.
If the question is not directly related to the lecture content, try to relate it back to the lecture topic if possible.
Keep responses concise and under 300 words.
Use simple language and provide examples when helpful.`;

    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: [
        {
          text: systemPrompt,
        }
      ],
    };

    const model = 'gemini-flash-lite-latest';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: userMessage,
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
    throw new Error("Error generating lecture chat response: " + err.message);
  }
}
