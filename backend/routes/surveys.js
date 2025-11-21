const express = require("express");
const router = express.Router();
const surveyCtrl = require("../controllers/surveyController");
const auth = require("../middleware/authMiddleware"); // 인증 미들웨어 적용
// 모든 /api/surveys/* 경로는 인증 필요
router.use(auth);
// 내가 참여한 설문
router.get("/my-participated", auth, surveyCtrl.getMyParticipatedSurveys);
router.post("/", surveyCtrl.createSurvey);
router.get("/", surveyCtrl.getMySurveys);
router.get("/:id", surveyCtrl.getSurveyDetail);
router.put("/:id", surveyCtrl.updateSurvey);
router.delete("/:id", surveyCtrl.deleteSurvey);
router.post("/:id/clone", surveyCtrl.cloneSurvey);
router.put("/:id/settings", surveyCtrl.updateSurveySettings);
router.get("/search", surveyCtrl.searchSurveys);
router.get("/my/search", auth, surveyCtrl.searchMySurveys);
module.exports = router;
