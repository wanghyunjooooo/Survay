const express = require("express");
const router = express.Router();
const pageCtrl = require("../controllers/pageController");
const auth = require("../middleware/authMiddleware");

// 모든 페이지 관련 라우트 인증 필요
router.use(auth);

//////////////////////////////////////
// 설문 페이지 추가 / 리스트 조회
//////////////////////////////////////

// 1) 페이지 추가
// POST /api/surveys/:surveyId/pages
router.post("/surveys/:surveyId/pages", pageCtrl.createPage);

// 2) 설문 내 페이지 리스트 조회
// GET /api/surveys/:surveyId/pages
router.get("/surveys/:surveyId/pages", pageCtrl.getPagesBySurvey);

//////////////////////////////////////
// 페이지 수정 / 삭제 / 순서 변경
//////////////////////////////////////

// 3) 페이지 수정
// PUT /api/pages/:pageId
router.put("/pages/:pageId", pageCtrl.updatePage);

// 4) 페이지 삭제
// DELETE /api/pages/:pageId
router.delete("/pages/:pageId", pageCtrl.deletePage);

// 5) 페이지 순서 변경
// PATCH /api/pages/reorder
router.patch("/pages/reorder", pageCtrl.reorderPages);

module.exports = router;
