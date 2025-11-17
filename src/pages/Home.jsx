// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { PlusCircle, Share2, BarChart2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Home.css";
import NavBar from "../components/Navbar.jsx";
import ShareModal from "../components/ShareModal.jsx";
import { useNavigate } from "react-router-dom";
import { getMySurveys, createShare } from "../api/api.js";

function Home() {
    const [activeTab, setActiveTab] = useState("my");
    const [mySurveys, setMySurveys] = useState([]);
    const [joinedSurveys, setJoinedSurveys] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedSurveyId, setSelectedSurveyId] = useState(null);
    const navigate = useNavigate();

    // 내 설문 리스트 불러오기
    const fetchMySurveys = async () => {
        const res = await getMySurveys();
        if (res.success) {
            const surveys = res.surveys.map((s) => ({
                id: s.survey_id,
                title: s.title,
                status:
                    new Date(s.end_date) > new Date() ? "진행 중" : "종료됨",
                endDate: s.end_date.slice(0, 10),
            }));
            setMySurveys(surveys);
        } else {
            alert("설문 리스트 불러오기 실패: " + res.message);
        }
    };

    useEffect(() => {
        fetchMySurveys();
    }, []);

    // 설문 수정 / 결과 확인
    const handleSurveyClick = (surveyId) => {
        navigate(`/edit-survey/${surveyId}`);
    };

    // 공유 모달 열기
    const openShareModal = (surveyId) => {
        setSelectedSurveyId(surveyId);
        setShowShareModal(true);
    };
    const handleShare = async (emails = []) => {
        if (!selectedSurveyId) return null;

        const res = await createShare(selectedSurveyId, emails);
        console.log("createShare 응답:", res);

        if (res.success) {
            const link = `${window.location.origin}/survey/${res.shareLink}`;
            navigator.clipboard.writeText(link);
            alert(`공유 링크 생성 완료!\n클립보드에 복사됨:\n${link}`);
            setShowShareModal(false);
            return link;
        } else {
            alert("공유 실패: " + res.message);
            return null;
        }
    };

    // 설문 리스트 렌더링
    const renderSurveyListItem = (survey) => (
        <li
            key={survey.id}
            className="list-group-item d-flex justify-content-between align-items-center survey-list-item"
            style={{ cursor: "pointer" }}
            onClick={() => handleSurveyClick(survey.id)}
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
                        e.stopPropagation();
                        navigate(`/edit-survey/${survey.id}`);
                    }}
                >
                    <BarChart2 size={16} className="me-1" />
                    결과 확인
                </button>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        openShareModal(survey.id);
                    }}
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

            {/* 공유 모달 */}
            {showShareModal && (
                <ShareModal
                    show={showShareModal}
                    handleClose={() => setShowShareModal(false)}
                    onShare={handleShare}
                />
            )}
        </>
    );
}

export default Home;
