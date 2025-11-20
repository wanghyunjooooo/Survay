import React, { useState, useEffect } from "react";
import "../styles/SurveyResultsContent.css";
import {
    getSurveyById,
    getSurveyParticipants,
    getSurveySummary,
} from "../api/api.js";

// Chart.js import
import { Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

function SurveyResultsContent({ surveyId }) {
    const [activeTab, setActiveTab] = useState("종합 결과");
    const [surveyInfo, setSurveyInfo] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [questionMap, setQuestionMap] = useState({});
    const [optionMap, setOptionMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                // 설문 기본 정보 조회
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
                        totalParticipants: 0,
                    });

                    // 질문/옵션 매핑
                    const qMap = {};
                    const oMap = {};
                    if (s.pages) {
                        s.pages.forEach((page) => {
                            if (page.questions) {
                                page.questions.forEach((q) => {
                                    qMap[q.id] = q.text;
                                    if (q.options) {
                                        q.options.forEach((opt) => {
                                            oMap[opt.id] = opt.text;
                                        });
                                    }
                                });
                            }
                        });
                    }
                    setQuestionMap(qMap);
                    setOptionMap(oMap);
                }

                // 참여자별 결과 조회
                const participantsRes = await getSurveyParticipants(surveyId);
                if (participantsRes.success && participantsRes.participants) {
                    setParticipants(participantsRes.participants);
                    setSurveyInfo((prev) => ({
                        ...prev,
                        totalParticipants: participantsRes.participants.length,
                    }));
                }

                // 질문별 통계 조회
                const summaryRes = await getSurveySummary(surveyId);
                if (summaryRes.success && summaryRes.summary) {
                    setSummaryData(summaryRes.summary);
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

    // Pie 차트 데이터 안전하게 생성
    const getPieChartData = (questionId) => {
        const filtered = summaryData.filter(
            (item) => item.question_id === questionId
        );

        const labels = filtered.map((f) => {
            try {
                const parsed = f.option_text ? JSON.parse(f.option_text) : {};
                return parsed.title || "알 수 없음";
            } catch (err) {
                console.warn("옵션 파싱 실패:", f.option_text, err);
                return "알 수 없음";
            }
        });

        const data = filtered.map((f) => Number(f.count) || 0);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                    ],
                    hoverOffset: 8,
                },
            ],
        };
    };

    const uniqueQuestions = [...new Set(summaryData.map((s) => s.question_id))];

    // 최근 7일 참여수 Bar 차트
    const getBarChartData = () => {
        const today = new Date();
        const dates = [];
        const counts = {};

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split("T")[0];
            dates.push(key);
            counts[key] = 0;
        }

        participants.forEach((p) => {
            const date = new Date(p.submitted_at).toISOString().split("T")[0];
            if (counts.hasOwnProperty(date)) {
                counts[date] += 1;
            }
        });

        return {
            labels: dates,
            datasets: [
                {
                    label: "참여자 수",
                    data: dates.map((d) => counts[d]),
                    backgroundColor: "#36A2EB",
                },
            ],
        };
    };

    return (
        <div className="results-container">
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

            <div className="results-content">
                {/* 종합 결과 */}
                {activeTab === "종합 결과" && (
                    <section>
                        <h3>종합 결과</h3>
                        {uniqueQuestions.length > 0 ? (
                            uniqueQuestions.map((qId) => (
                                <div key={qId} className="chart-section">
                                    <h4>{questionMap[qId] || "제목 없음"}</h4>
                                    <Pie data={getPieChartData(qId)} />
                                </div>
                            ))
                        ) : (
                            <p>통계 데이터가 없습니다.</p>
                        )}
                    </section>
                )}

                {/* 참여자별 결과 */}
                {activeTab === "참여자별 결과" && (
                    <section>
                        <h3>참여자별 결과</h3>
                        {participants.length > 0 ? (
                            <table className="participants-table">
                                <thead>
                                    <tr>
                                        <th>응답 ID</th>
                                        <th>제출일</th>
                                        <th>질문</th>
                                        <th>선택 옵션</th>
                                        <th>답변</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((p) =>
                                        p.answers.map((a, idx) => (
                                            <tr key={`${p.response_id}-${idx}`}>
                                                <td>{p.response_id}</td>
                                                <td>
                                                    {new Date(
                                                        p.submitted_at
                                                    ).toLocaleString()}
                                                </td>
                                                <td>
                                                    {questionMap[
                                                        a.questionId
                                                    ] ?? a.questionId}
                                                </td>
                                                <td>
                                                    {optionMap[a.optionId] ??
                                                        a.optionId}
                                                </td>
                                                <td>
                                                    {a.answerText ?? "없음"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <p>참여자가 없습니다.</p>
                        )}
                    </section>
                )}

                {/* 일자별 참여수 */}
                {activeTab === "일자별 참여수" && (
                    <section>
                        <h3>일자별 참여수 (최근 7일)</h3>
                        {participants.length > 0 ? (
                            <Bar data={getBarChartData()} />
                        ) : (
                            <p>참여자가 없습니다.</p>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

export default SurveyResultsContent;
