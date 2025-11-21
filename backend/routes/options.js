// routes/optionRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const optionCtrl = require("../controllers/optionController");

router.use(auth);

// =====================================
// 선택지 CRUD
// =====================================

// 선택지 생성 (질문에 선택지 추가)
router.post("/:questionId", optionCtrl.createOption);

// 선택지 수정
router.put("/:optionId", optionCtrl.updateOption);

// 선택지 삭제
router.delete("/:optionId", optionCtrl.deleteOption);

// 선택지 순서 변경
router.patch("/reorder", optionCtrl.reorderOptions);
// 질문별 선택지 조회 (GET)
router.get("/question/:questionId", optionCtrl.getOptionsByQuestion);
module.exports = router;
