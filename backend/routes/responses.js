const express = require("express");
const router = express.Router();
const responseController = require("../controllers/responseController");

// 설문 응답 제출
router.post("/surveys/:surveyId/responses", responseController.submitResponse);
// 응답 리스트 조회
router.get("/surveys/:surveyId/responses", responseController.getResponses);
// 특정 응답 상세
router.get("/responses/:responseId", responseController.getResponseDetail);
// 응답 삭제
router.delete("/responses/:responseId", responseController.deleteResponse);
// 질문별 통계
router.get("/surveys/:surveyId/summary", responseController.getSummary);
// 참여자별 결과
router.get(
    "/surveys/:surveyId/participants",
    responseController.getParticipants
);

module.exports = router;
