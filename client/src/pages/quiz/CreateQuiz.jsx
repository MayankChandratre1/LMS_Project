import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaMagic } from "react-icons/fa";
import { createQuiz, generateQuiz } from "../../redux/slices/QuizSlice";

const CreateQuiz = () => {
    const { name, id: courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [quizData, setQuizData] = useState({
        title: "",
        description: "",
        questions: [
            {
                question: "",
                options: ["", "", "", ""],
                correctOption: 0,
                timeout: 30,
            },
        ],
    });

    const [topicDescription, setTopicDescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuizData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[index][field] = value;
        setQuizData((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const addQuestion = () => {
        setQuizData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question: "",
                    options: ["", "", "", ""],
                    correctOption: 0,
                    timeout: 30,
                },
            ],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await dispatch(createQuiz({ ...quizData, courseId }));
        if (response?.payload) {
            toast.success("Quiz created successfully!");
            navigate(`/course/${name}/${courseId}/quizes`);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!topicDescription.trim()) {
            toast.error("Please enter a topic description");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await dispatch(generateQuiz(topicDescription));
            if (response?.payload) {
                setQuizData((prev) => ({
                    ...prev,
                    questions: response.payload,
                }));
                setTopicDescription(""); // Clear topic description after generation
            }
        } catch (error) {
            console.error("Error generating quiz:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-300 bg-gray-800/50 px-4 py-2 rounded-lg"
                >
                    <FaArrowLeft className="text-lg" />
                    Back
                </button>
                <h1 className="text-3xl font-bold text-white">Create Quiz for {name}</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* AI Quiz Generation Section */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/30">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FaMagic className="text-yellow-400" />
                        Generate Quiz with AI
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">
                                Topic Description
                            </label>
                            <textarea
                                value={topicDescription}
                                onChange={(e) => setTopicDescription(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-800 text-white min-h-[100px]"
                                placeholder="Describe the topic for your quiz (e.g., 'JavaScript Promises and Async/Await', 'Introduction to Machine Learning', etc.)"
                                disabled={isGenerating}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateQuiz}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FaMagic />
                                    Generate Quiz Questions
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Manual Quiz Creation Section */}
                <div>
                    <label className="block text-gray-300 mb-2">Quiz Title</label>
                    <input
                        type="text"
                        name="title"
                        value={quizData.title}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-gray-800 text-white"
                        placeholder="Enter quiz title"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={quizData.description}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-gray-800 text-white"
                        placeholder="Enter quiz description"
                        required
                    />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Questions</h2>
                    {quizData.questions.map((question, index) => (
                        <div key={index} className="mb-6 p-4 bg-gray-800 rounded-lg">
                            <label className="block text-gray-300 mb-2">Question {index + 1}</label>
                            <input
                                type="text"
                                value={question.question}
                                onChange={(e) =>
                                    handleQuestionChange(index, "question", e.target.value)
                                }
                                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                                placeholder="Enter question"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                {question.options.map((option, optIndex) => (
                                    <input
                                        key={optIndex}
                                        type="text"
                                        value={option}
                                        onChange={(e) =>
                                            handleQuestionChange(index, `options`, [
                                                ...question.options.slice(0, optIndex),
                                                e.target.value,
                                                ...question.options.slice(optIndex + 1),
                                            ])
                                        }
                                        className="p-3 rounded-lg bg-gray-700 text-white"
                                        placeholder={`Option ${optIndex + 1}`}
                                        required
                                    />
                                ))}
                            </div>
                            <div className="mt-4">
                                <label className="block text-gray-300 mb-2">Correct Option</label>
                                <select
                                    value={question.correctOption}
                                    onChange={(e) =>
                                        handleQuestionChange(index, "correctOption", parseInt(e.target.value))
                                    }
                                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                                >
                                    {question.options.map((_, optIndex) => (
                                        <option key={optIndex} value={optIndex}>
                                            Option {optIndex + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Add Question
                    </button>
                </div>
                <button
                    type="submit"
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold"
                >
                    Create Quiz
                </button>
            </form>
        </div>
    );
};

export default CreateQuiz;