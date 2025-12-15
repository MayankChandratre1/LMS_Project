import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaVolumeUp, FaStop, FaRobot, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../helpers/AxiosInstance';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function LectureChatModal({ isOpen, onClose, lecture, courseId }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState(null);

    const messagesEndRef = useRef(null);
    const speechSynthRef = useRef(null);

    // Strip markdown syntax for speech
    const stripMarkdown = (text) => {
        return text
            .replace(/#{1,6}\s?/g, '') // Remove headers
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.+?)\*/g, '$1') // Remove italic
            .replace(/__(.+?)__/g, '$1') // Remove bold (underscore)
            .replace(/_(.+?)_/g, '$1') // Remove italic (underscore)
            .replace(/`(.+?)`/g, '$1') // Remove inline code
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
            .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
            .replace(/^>\s?/gm, '') // Remove blockquotes
            .replace(/^-\s?/gm, '') // Remove unordered list markers
            .replace(/^\d+\.\s?/gm, '') // Remove ordered list markers
            .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
            .trim();
    };

    // Markdown component styles
    const markdownComponents = {
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mb-2 mt-3" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mb-2 mt-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-white mb-1 mt-2" {...props} />,
        p: ({ node, ...props }) => <p className="text-gray-200 mb-2 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-200 mb-2 ml-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-200 mb-2 ml-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
        code: ({ node, inline, ...props }) => (
            <code className="bg-gray-700/50 text-yellow-400 px-1 py-0.5 rounded text-xs font-mono" {...props} />
        ),
        pre: ({ node, ...props }) => <pre className="mb-2 overflow-x-auto bg-gray-900 p-2 rounded" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-2 italic text-gray-300 mb-2" {...props} />,
        strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="text-gray-200 italic" {...props} />,
    };

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Stop speech when modal closes
    useEffect(() => {
        if (!isOpen && speechSynthRef.current) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentlySpeakingIndex(null);
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Add user message to chat
        const newUserMessage = {
            id: Date.now(),
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newUserMessage]);

        // Call API
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(
                `/lecture-chat/${courseId}/${lecture._id}`,
                { message: userMessage }
            );

            // Add AI response
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.response,
                timestamp: new Date(),
                hasTranscript: response.data.lectureInfo?.hasTranscript
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to get response');
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeak = (text, index) => {
        // Stop any ongoing speech
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentlySpeakingIndex(null);

            // If clicking the same message, just stop
            if (currentlySpeakingIndex === index) {
                return;
            }
        }

        // Strip markdown for clean speech
        const cleanText = stripMarkdown(text);

        // Start new speech
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.lang = 'en-US';

        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingIndex(null);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingIndex(null);
            toast.error('Speech synthesis failed');
        };

        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setCurrentlySpeakingIndex(index);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black p-4 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaRobot className="text-2xl" />
                        <div>
                            <h2 className="font-bold text-lg">Talk with Lecture</h2>
                            <p className="text-sm opacity-80">{lecture?.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-8">
                            <FaRobot className="text-5xl mx-auto mb-4 text-yellow-500" />
                            <p className="text-lg font-semibold mb-2">Ask me anything about this lecture!</p>
                            <p className="text-sm">I can help you understand the content better.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                                <div className="flex items-start gap-2">
                                    {msg.type === 'ai' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center flex-shrink-0">
                                            <FaRobot className="text-black text-sm" />
                                        </div>
                                    )}
                                    <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                                        <div
                                            className={`inline-block p-3 rounded-2xl ${msg.type === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-gray-200 border border-gray-700'
                                                }`}
                                        >
                                            {msg.type === 'ai' ? (
                                                <div className="prose prose-invert prose-sm max-w-none text-left">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={markdownComponents}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                        {msg.type === 'ai' && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSpeak(msg.content, index)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${isSpeaking && currentlySpeakingIndex === index
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {isSpeaking && currentlySpeakingIndex === index ? (
                                                        <>
                                                            <FaStop /> Stop
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaVolumeUp /> Speak
                                                        </>
                                                    )}
                                                </button>
                                                {msg.hasTranscript && (
                                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                                        ✓ Using transcript
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {msg.type === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <FaUser className="text-white text-sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center">
                                    <FaRobot className="text-black text-sm" />
                                </div>
                                <div className="bg-gray-800 border border-gray-700 p-3 rounded-2xl">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask a question about this lecture..."
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <FaPaperPlane />
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
