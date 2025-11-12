import React, { useState } from "react";
import "../styles/SurveyResultsContent.css";

function SurveyResultsContent({ surveyId }) {
    const [activeTab, setActiveTab] = useState("종합 결과");

    // 예시 데이터
    const surveyInfo = {
        title: "밥",
        status: "진행 중",
        startDate: "2025. 11. 10. 오후 02:18",
        endDate: "제한 없음",
        totalParticipants: 123,
    };

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
                            👤 참여자별 데이터 테이블
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
