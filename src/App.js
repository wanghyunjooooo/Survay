// src/App.js
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Auth";
import Home from "./pages/Home"; // 메인 홈 페이지
import EditSurvey from "./pages/EditSurvey"; // 설문 수정 페이지
import SurveyParticipate from "./pages/SurveyParticipate"; // 설문 참여 페이지
import NewSurveyTypeSelect from "./pages/NewSurveyTypeSelect"; // 새 설문 유형 선택

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    return (
        <Router>
            <Routes>
                {/* 기본 경로는 로그인 페이지로 리다이렉트 */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* 로그인 & 회원가입 */}
                <Route path="/login" element={<Login />} />

                {/* 로그인 후 이동하는 홈 */}
                <Route path="/home" element={<Home />} />

                {/* 새 설문 만들기 → 유형 선택 */}
                <Route path="/new-survey" element={<NewSurveyTypeSelect />} />

                {/* 설문 수정 페이지 */}
                <Route path="/edit-survey/:id" element={<EditSurvey />} />

                {/* 설문 참여 페이지 (공유 링크) */}
                <Route
                    path="/survey/:shareLink"
                    element={<SurveyParticipate />}
                />

                {/* 존재하지 않는 경로는 홈으로 */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </Router>
    );
}

export default App;
