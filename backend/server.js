// ============================================
// 🌐 Survey Backend Server (Refactored)
// ============================================
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ================================
// 📦 라우트 불러오기
// ================================
const authRoutes = require("./routes/authRoutes");
const surveyRoutes = require("./routes/surveys");
const pageRoutes = require("./routes/pages");
const questionRoutes = require("./routes/questions");
const optionRoutes = require("./routes/options"); // 선택지
const responseRoutes = require("./routes/responses"); // 응답/참여
const shareRoutes = require("./routes/shares");

// ================================
// 🚀 서버 설정
// ================================
const app = express();
const PORT = process.env.PORT || 8080;

// ================================
// 🧩 미들웨어
// ================================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 정적파일 제공

// ================================
// 🛣️ RESTful 라우트 등록
// ==============================   ==
// 인증 미들웨어는 각 라우트 파일 내부에서 처리하도록 둠
app.use("/api/auth", authRoutes); // 회원가입 / 로그인 / 내 정보
app.use("/api/surveys", surveyRoutes); // 설문 CRUD
app.use("/api", pageRoutes); // 페이지 CRUD + 순서 변경
app.use("/api/questions", questionRoutes); // 질문 CRUD + 순서 변경
app.use("/api/options", optionRoutes); // 선택지 CRUD + 순서 변경
app.use("/api", responseRoutes); // 응답/참여 관련 라우트 (Postman 테스트 가능)
app.use("/api", shareRoutes);

// ================================
// ⚠️ 404 처리 (없는 경로)
// ================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "요청하신 API가 존재하지 않습니다.",
    });
});

// ================================
// ⚠️ 에러 처리 미들웨어
// ================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "서버 내부 오류",
        error: err.message,
    });
});

// ================================
// 🏠 기본 라우트
// ================================
app.get("/", (req, res) => {
    res.send("✅ Survey Backend API is running successfully! (Refactored)");
});

// ================================
// 🖥️ 서버 실행
// ================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
