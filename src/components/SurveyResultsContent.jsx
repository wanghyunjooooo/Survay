import React, { useState, useEffect } from "react";
import "../styles/SurveyResultsContent.css";
import { getSurveyById, getSurveyResponses } from "../api/api.js"; // API 함수 import

function SurveyResultsContent({ surveyId }) {
    const [activeTab, setActiveTab] = useState("종합 결과");
    const [surveyInfo, setSurveyInfo] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                // 1️⃣ 설문 기본 정보 조회
                const surveyRes = await getSurveyById(surveyId);
                if (surveyRes.success && surveyRes.survey) {
                    const s = surveyRes.survey;
                    setSurveyInfo({
                        title: s.title,
                        status:
                            s.end_date && new Date(s.end_date) > new Date()
                                ? "진행 중"
                                : "종료됨",
                        startDate: s.start_date
                            ? new Date(s.start_date).toLocaleString()
                            : "미정",
                        endDate: s.end_date
                            ? new Date(s.end_date).toLocaleString()
                            : "제한 없음",
                        totalParticipants: 0, // 초기값, 아래 응답 조회 후 업데이트
                    });
                } else {
                    alert("설문 정보를 불러올 수 없습니다.");
                }

                // 2️⃣ 설문 응답 조회
                const responsesRes = await getSurveyResponses(surveyId);
                if (responsesRes.success && responsesRes.responses) {
                    setResponses(responsesRes.responses);
                    setSurveyInfo((prev) => ({
                        ...prev,
                        totalParticipants: responsesRes.responses.length,
                    }));
                }
            } catch (err) {
                console.error("설문 결과 조회 오류:", err);
                alert("설문 결과를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyData();
    }, [surveyId]);

    if (loading) return <div className="results-container">로딩 중...</div>;
    if (!surveyInfo)
        return <div className="results-container">설문 정보 없음</div>;

    return (
        <div className="results-container">
            {/* 상단 설문 기본 정보 */}
            <div className="results-header">
                <h2 className="results-title">{surveyInfo.title}</h2>
                <div className="results-meta">
                    <span className="status">{surveyInfo.status}</span>
                    <span>
                        {surveyInfo.startDate} ~ {surveyInfo.endDate}
                    </span>
                    <span>총 참여: {surveyInfo.totalParticipants}명</span>
                </div>
            </div>

            {/* 탭 버튼 */}
            <div className="results-tabs">
                {["종합 결과", "참여자별 결과", "일자별 참여수"].map((tab) => (
                    <button
                        key={tab}
                        className={activeTab === tab ? "active" : ""}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 탭 내용 */}
            <div className="results-content">
                {activeTab === "종합 결과" && (
                    <section>
                        <h3>종합 결과</h3>
                        <p>
                            전체 문항에 대한 평균 응답 및 비율 차트를
                            표시합니다.
                        </p>
                        <div className="chart-placeholder">
                            📊 종합 그래프 영역
                        </div>
                    </section>
                )}

                {activeTab === "참여자별 결과" && (
                    <section>
                        <h3>참여자별 결과</h3>
                        <p>참여자 개별 응답 목록 또는 표를 보여줍니다.</p>
                        <div className="table-placeholder">
                            {responses.length > 0 ? (
                                <ul>
                                    {responses.map((r) => (
                                        <li key={r.response_id}>
                                            ID: {r.response_id} | 제출일:{" "}
                                            {new Date(
                                                r.submitted_at
                                            ).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                "응답이 없습니다."
                            )}
                        </div>
                    </section>
                )}

                {activeTab === "일자별 참여수" && (
                    <section>
                        <h3>일자별 참여수</h3>
                        <p>날짜별 참여 추이를 막대 그래프로 시각화합니다.</p>
                        <div className="chart-placeholder">
                            📅 일자별 그래프 영역
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default SurveyResultsContent;
