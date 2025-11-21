const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

// 링크 생성 / 이메일 공유
router.post("/surveys/:surveyId/share", shareController.createShare);

// 공유 링크로 설문 조회
router.get("/surveys/share/:shareLink", shareController.getSurveyByShareLink);

// 공유 링크 삭제
router.delete("/surveys/:surveyId/share", shareController.deleteShare);

module.exports = router;
