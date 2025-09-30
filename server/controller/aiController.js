import createError from '../utils/error.js'
import { sendRequest } from '../utils/gemini.js'
import Course from '../models/courseModel.js'
import User from '../models/userModel.js'

const parseAiResponse = (rawResponse) => {
    if (!rawResponse || typeof rawResponse !== 'string') {
        throw new Error('AI response is empty');
    }

    const cleaned = rawResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        throw new Error('Failed to parse AI response');
    }
};

const buildCourseQuery = (tags = []) => {
    const sanitizedTags = tags
        .filter((tag) => typeof tag === 'string' && tag.trim() !== '')
        .map((tag) => tag.trim());

    if (!sanitizedTags.length) {
        return null;
    }

    const fields = ['title', 'description', 'category'];
    const orConditions = [];

    sanitizedTags.forEach((tag) => {
        const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(escapedTag, 'i');

        fields.forEach((field) => {
            orConditions.push({ [field]: pattern });
        });
    });

    orConditions.push({ tags: { $in: sanitizedTags } });

    return { $or: orConditions };
};

const formatCourseResults = (courses = []) => courses.map((course) => ({
    id: course._id?.toString(),
    title: course.title,
    price: course.price ?? null,
    thumbnailUrl: course?.thumbnail?.secure_url ?? null,
}));

export const chatWithAI = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        const userId = req?.user?.id;

        if (!prompt || !prompt.trim()) {
            return next(createError(400, 'Prompt is required'));
        }

        if (!userId) {
            return next(createError(401, 'Unauthorized'));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, 'User not found'));
        }

        const aiRawResponse = await sendRequest(prompt);
        const aiResponse = parseAiResponse(aiRawResponse);
        const normalizedIntent = aiResponse?.intent?.toUpperCase() || 'UNKNOWN';

        if (normalizedIntent === 'COURSE') {
            const courseQuery = buildCourseQuery(aiResponse?.tags);
            console.log('Generated course query:', courseQuery); // Debug log
            
            if (courseQuery) {
                const matchedCourses = await Course.find(courseQuery).select('title price thumbnail');
                aiResponse.courses = formatCourseResults(matchedCourses);
            } else {
                aiResponse.courses = [];
            }
        }

        if (normalizedIntent === 'DOUBT' && aiResponse?.isCodeQuery) {
            aiResponse.response = 'I am not able to help with code-specific queries. Please reach out to our support team for detailed assistance.';
        }

        user.chatHistory.push({ text: prompt, isUser: true });
        user.chatHistory.push({ response: JSON.stringify(aiResponse), isUser: false });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Response generated successfully',
            data: aiResponse,
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
        const userId = req?.user?.id;
        if (!userId) {
            return next(createError(401, 'Unauthorized'));
        }
        const user = await User.findById(userId).select('chatHistory');
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.status(200).json({
            success: true,
            message: 'Chat history fetched successfully',
            data: user.chatHistory || [],
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
}

export const deleteChatHistory = async (req, res, next) => {
    try {
        const userId = req?.user?.id;
        if (!userId) {
            return next(createError(401, 'Unauthorized'));
        }
        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        user.chatHistory = [];
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Chat history deleted successfully',
        });
    } catch (error) {
        return next(createError(500, error.message));
    }
};
