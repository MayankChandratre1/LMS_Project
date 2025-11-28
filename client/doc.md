# API Documentation

## Quiz Routes

### Create a Quiz (Instructors/Admins Only)
**Request:**
```
curl -X POST http://localhost:5000/api/quiz \
-H "Authorization: Bearer <your_token>" \
-H "Content-Type: application/json" \
-d '{
    "courseId": "<course_id>",
    "title": "Sample Quiz",
    "description": "This is a sample quiz",
    "questions": [
        {
            "question": "What is 2 + 2?",
            "options": ["3", "4", "5", "6"],
            "correctOption": 1,
            "timeout": 30
        }
    ]
}'
```

**Response:**
```json
{
    "success": true,
    "message": "Quiz created successfully",
    "quiz": {
        "_id": "64f1a2b3c4d5e6f7890a1234",
        "courseId": "64f1a2b3c4d5e6f7890a5678",
        "title": "Sample Quiz",
        "description": "This is a sample quiz",
        "questions": [
            {
                "_id": "64f1a2b3c4d5e6f7890a9101",
                "question": "What is 2 + 2?",
                "options": ["3", "4", "5", "6"],
                "correctOption": 1,
                "timeout": 30
            }
        ],
        "createdBy": "64f1a2b3c4d5e6f7890a1111",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:00:00.000Z"
    }
}
```

---

### Get All Quizzes for a Course
**Request:**
```
curl -X GET http://localhost:5000/api/quiz/course/<course_id> \
-H "Authorization: Bearer <your_token>"
```

**Response:**
```json
{
    "success": true,
    "message": "Quizzes retrieved successfully",
    "quizzes": [
        {
            "_id": "64f1a2b3c4d5e6f7890a1234",
            "title": "Sample Quiz",
            "description": "This is a sample quiz"
        }
    ]
}
```

---

### Get a Specific Quiz by ID
**Request:**
```
curl -X GET http://localhost:5000/api/quiz/<quiz_id> \
-H "Authorization: Bearer <your_token>"
```

**Response:**
```json
{
    "success": true,
    "message": "Quiz retrieved successfully",
    "quiz": {
        "_id": "64f1a2b3c4d5e6f7890a1234",
        "courseId": "64f1a2b3c4d5e6f7890a5678",
        "title": "Sample Quiz",
        "description": "This is a sample quiz",
        "questions": [
            {
                "_id": "64f1a2b3c4d5e6f7890a9101",
                "question": "What is 2 + 2?",
                "options": ["3", "4", "5", "6"],
                "correctOption": 1,
                "timeout": 30
            }
        ],
        "createdBy": "64f1a2b3c4d5e6f7890a1111",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:00:00.000Z"
    }
}
```

---

### Update a Quiz (Instructors/Admins Only)
**Request:**
```
curl -X PUT http://localhost:5000/api/quiz/<quiz_id> \
-H "Authorization: Bearer <your_token>" \
-H "Content-Type: application/json" \
-d '{
    "title": "Updated Quiz Title",
    "description": "Updated description",
    "questions": [
        {
            "question": "What is 3 + 3?",
            "options": ["5", "6", "7", "8"],
            "correctOption": 1,
            "timeout": 30
        }
    ]
}'
```

**Response:**
```json
{
    "success": true,
    "message": "Quiz updated successfully",
    "quiz": {
        "_id": "64f1a2b3c4d5e6f7890a1234",
        "courseId": "64f1a2b3c4d5e6f7890a5678",
        "title": "Updated Quiz Title",
        "description": "Updated description",
        "questions": [
            {
                "_id": "64f1a2b3c4d5e6f7890a9101",
                "question": "What is 3 + 3?",
                "options": ["5", "6", "7", "8"],
                "correctOption": 1,
                "timeout": 30
            }
        ],
        "createdBy": "64f1a2b3c4d5e6f7890a1111",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:30:00.000Z"
    }
}
```

---

### Delete a Quiz (Instructors/Admins Only)
**Request:**
```
curl -X DELETE http://localhost:5000/api/quiz/<quiz_id> \
-H "Authorization: Bearer <your_token>"
```

**Response:**
```json
{
    "success": true,
    "message": "Quiz deleted successfully"
}
```

---

## Quiz Submission Routes

### Submit a Quiz
**Request:**
```
curl -X POST http://localhost:5000/api/quiz-submission/<quiz_id> \
-H "Authorization: Bearer <your_token>" \
-H "Content-Type: application/json" \
-d '{
    "answers": [
        {
            "questionId": "<question_id>",
            "selectedOption": 1,
            "timeTaken": 15
        }
    ]
}'
```

**Response:**
```json
{
    "success": true,
    "message": "Quiz submitted successfully",
    "submission": {
        "_id": "64f1a2b3c4d5e6f7890a5678",
        "userId": "64f1a2b3c4d5e6f7890a1111",
        "quizId": "64f1a2b3c4d5e6f7890a1234",
        "courseId": "64f1a2b3c4d5e6f7890a5678",
        "answers": [
            {
                "questionId": "64f1a2b3c4d5e6f7890a9101",
                "selectedOption": 1,
                "isCorrect": true,
                "timeTaken": 15
            }
        ],
        "score": 1,
        "totalQuestions": 1,
        "correctAnswers": 1,
        "attemptedAt": "2023-10-01T12:30:00.000Z"
    }
}
```

---

## Streak Routes

### Get Streak for the Current Month or a Specific Month
**Request:**
```
curl -X GET "http://localhost:5000/api/streak?month=2023-10" \
-H "Authorization: Bearer <your_token>"
```

**Response:**
```json
{
    "success": true,
    "message": "Streak data retrieved successfully",
    "streak": {
        "userId": "64f1a2b3c4d5e6f7890a1111",
        "month": "2023-10",
        "streakDays": [
            { "date": "2023-10-01" },
            { "date": "2023-10-02" }
        ],
        "longestStreak": 5,
        "currentStreak": 2
    }
}
```

---

### Get Streak History for the User
**Request:**
```
curl -X GET http://localhost:5000/api/streak/history \
-H "Authorization: Bearer <your_token>"
```

**Response:**
```json
{
    "success": true,
    "message": "Streak history retrieved successfully",
    "streakHistory": [
        {
            "userId": "64f1a2b3c4d5e6f7890a1111",
            "month": "2023-09",
            "streakDays": [
                { "date": "2023-09-28" },
                { "date": "2023-09-29" }
            ],
            "longestStreak": 3,
            "currentStreak": 0
        },
        {
            "userId": "64f1a2b3c4d5e6f7890a1111",
            "month": "2023-10",
            "streakDays": [
                { "date": "2023-10-01" },
                { "date": "2023-10-02" }
            ],
            "longestStreak": 5,
            "currentStreak": 2
        }
    ]
}
```
