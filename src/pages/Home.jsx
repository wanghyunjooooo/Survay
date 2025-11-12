import React, { useState, useEffect } from "react";
import { PlusCircle, Share2, BarChart2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Home.css";
import NavBar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";

function Home() {
    const [activeTab, setActiveTab] = useState("my"); // my: 내 설문, joined: 참여한 설문
    const [mySurveys, setMySurveys] = useState([]);
    const [joinedSurveys, setJoinedSurveys] = useState([]);
    const navigate = useNavigate(); // 페이지 이동

    useEffect(() => {
        setMySurveys([
            {
                id: 1,
                title: "2025 고객 만족도 조사",
                status: "진행 중",
                endDate: "2025-12-31",
            },
            {
                id: 2,
                title: "신제품 피드백 설문",
                status: "종료됨",
                endDate: "2025-11-10",
            },
        ]);
        setJoinedSurveys([
            {
                id: 101,
                title: "참여 설문 A",
                status: "진행 중",
                endDate: "2025-12-20",
            },
            {
                id: 102,
                title: "참여 설문 B",
                status: "종료됨",
                endDate: "2025-11-05",
            },
        ]);
    }, []);

    const handleSurveyClick = (surveyId) => {
        // 클릭하면 EditSurvey 페이지로 이동
        navigate(`/edit-survey/${surveyId}`);
    };

    const renderSurveyListItem = (survey) => (
        <li
            key={survey.id}
            className="list-group-item d-flex justify-content-between align-items-center survey-list-item"
            style={{ cursor: "pointer" }}
            onClick={() => handleSurveyClick(survey.id)} // 클릭 이벤트
        >
            <div>
                <h6 className="mb-1">{survey.title}</h6>
                <small className="text-muted">
                    상태:{" "}
                    <span
                        className={
                            survey.status === "진행 중"
                                ? "text-success"
                                : "text-secondary"
                        }
                    >
                        {survey.status}
                    </span>{" "}
                    | 종료: {survey.endDate}
                </small>
            </div>
            <div>
                <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={(e) => {
                        e.stopPropagation(); // li 클릭 이벤트 막기
                        navigate(`/edit-survey/${survey.id}`);
                    }}
                >
                    <BarChart2 size={16} className="me-1" />
                    결과 확인
                </button>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Share2 size={16} className="me-1" />
                    공유
                </button>
            </div>
        </li>
    );

    return (
        <>
            <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div
                className="home-container container py-5"
                style={{ marginTop: "100px" }}
            >
                <section>
                    <h5 className="fw-bold text-primary mb-3">
                        {activeTab === "my"
                            ? "내 설문 리스트"
                            : "참여한 설문 리스트"}
                    </h5>

                    {/* 새 설문 만들기 버튼 맨 위 */}
                    {activeTab === "my" && (
                        <div className="mb-3 d-flex justify-content-end">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/edit-survey/new")}
                            >
                                <PlusCircle size={16} className="me-1" /> 새
                                설문 만들기
                            </button>
                        </div>
                    )}

                    <ul className="list-group survey-list">
                        {(activeTab === "my" ? mySurveys : joinedSurveys).map(
                            renderSurveyListItem
                        )}
                    </ul>
                </section>
            </div>
        </>
    );
}

export default Home;
