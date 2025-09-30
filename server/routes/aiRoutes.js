import express from "express";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { chatWithAI,getChatHistory, deleteChatHistory } from "../controller/aiController.js";

const router = express.Router();

router.post("/chat", isLoggedIn, chatWithAI);
router.get("/history", isLoggedIn, getChatHistory);
router.delete("/history", isLoggedIn, deleteChatHistory);

export default router;
