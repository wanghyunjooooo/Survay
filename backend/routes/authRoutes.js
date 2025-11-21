const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

// 회원가입
router.post("/register", authController.register);

// 로그인
router.post("/login", authController.login);

// 로그아웃
router.post("/logout", authController.logout);

// 내 정보 조회
router.get("/me", auth, authController.getMe);

module.exports = router;
