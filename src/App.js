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

                {/* 설문 수정 페이지 */}
                <Route path="/edit-survey/:id" element={<EditSurvey />} />

                {/* 존재하지 않는 경로는 홈으로 */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </Router>
    );
}

export default App;
