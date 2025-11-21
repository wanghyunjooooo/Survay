const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const questionCtrl = require("../controllers/questionController");
const optionCtrl = require("../controllers/optionController");

router.use(auth);

//////////////////////////////////////
// 질문 관련
//////////////////////////////////////

// 질문 추가
// POST /api/questions
router.post("/", questionCtrl.createQuestion);

// 페이지 내 질문 리스트 조회
// GET /api/questions/:pageId
router.get("/:pageId", questionCtrl.getQuestionsByPage);

// 질문 수정
// PUT /api/questions/:questionId
router.put("/:questionId/edit", questionCtrl.updateQuestion);

// 질문 삭제
// DELETE /api/questions/:questionId
router.delete("/:questionId", questionCtrl.deleteQuestion);

// 질문 순서 변경
// PATCH /api/questions/reorder
router.patch("/reorder", questionCtrl.reorderQuestions);

module.exports = router;
