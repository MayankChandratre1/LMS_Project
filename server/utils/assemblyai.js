import { AssemblyAI } from 'assemblyai';
import dotenv from 'dotenv';

dotenv.config();

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY
});

/**
 * Transcribe a video using AssemblyAI
 * @param {string} videoUrl - URL of the video to transcribe
 * @returns {Promise<string>} - The transcript text
 */
export async function transcribeVideo(videoUrl) {
    try {
        if (!process.env.ASSEMBLYAI_API_KEY) {
            throw new Error('ASSEMBLYAI_API_KEY is not set in environment variables');
        }

        if (!videoUrl || videoUrl.trim() === '') {
            throw new Error('Video URL cannot be empty');
        }

        console.log('🎤 Starting transcription for:', videoUrl);

        // Submit transcription request
        const transcript = await client.transcripts.transcribe({
            audio: videoUrl,
            language_code: 'en'
        });

        // Check if transcription was successful
        if (transcript.status === 'error') {
            throw new Error(`Transcription failed: ${transcript.error}`);
        }

        console.log('✅ Transcription completed successfully');
        return transcript.text;
    } catch (err) {
        console.error('❌ Transcription error:', err.message);
        throw new Error('Error transcribing video: ' + err.message);
    }
}

/**
 * Get video duration from Cloudinary response metadata
 * Cloudinary returns duration in the response when uploading
 * @param {object} cloudinaryResponse - Response from Cloudinary upload
 * @returns {number} - Duration in seconds
 */
export function getVideoDuration(cloudinaryResponse) {
    try {
        // Cloudinary video upload response includes duration
        return cloudinaryResponse.duration || 0;
    } catch (err) {
        console.error('Error getting video duration:', err);
        return 0;
    }
}
