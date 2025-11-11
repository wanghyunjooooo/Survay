import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Login from "./pages/Auth";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
function App() {
    return (
        <Router>
            <Routes>
                {/* 기본 경로는 로그인 페이지 */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
