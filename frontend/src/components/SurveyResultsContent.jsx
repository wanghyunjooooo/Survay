import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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
                    s.pages?.forEach((page) => {
                        page.questions?.forEach((q) => {
                            qMap[q.id] = q.text;
                            q.options?.forEach((opt) => {
                                oMap[opt.id] = opt.text;
                            });
                        });
                    });
                    setQuestionMap(qMap);
                    setOptionMap(oMap);
                }

                const participantsRes = await getSurveyParticipants(surveyId);
                if (participantsRes.success && participantsRes.participants) {
                    setParticipants(participantsRes.participants);
                    setSurveyInfo((prev) => ({
                        ...prev,
                        totalParticipants: participantsRes.participants.length,
                    }));
                }

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

    const getPieChartData = (questionId) => {
        const filtered = summaryData.filter(
            (item) => item.question_id === questionId
        );

        const labels = filtered.map((f) => {
            try {
                const parsed = f.option_text ? JSON.parse(f.option_text) : {};
                return parsed.title || "알 수 없음";
            } catch {
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
                        "#a3bffa",
                        "#7dd3fc",
                        "#fcd34d",
                        "#fbbf24",
                        "#fde68a",
                        "#fda4af",
                    ],
                    hoverOffset: 6,
                },
            ],
        };
    };

    const uniqueQuestions = [...new Set(summaryData.map((s) => s.question_id))];

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
            if (counts.hasOwnProperty(date)) counts[date] += 1;
        });

        return {
            labels: dates,
            datasets: [
                {
                    label: "참여자 수",
                    data: dates.map((d) => counts[d]),
                    backgroundColor: "#60a5fa",
                    borderRadius: 4,
                },
            ],
        };
    };

    return (
        <div className="results-container container my-4">
            <div className="results-header mb-4">
                <h2 className="results-title">{surveyInfo.title}</h2>
                <div className="results-meta text-muted">
                    <span className="me-3">{surveyInfo.status}</span>
                    <span className="me-3">
                        {surveyInfo.startDate} ~ {surveyInfo.endDate}
                    </span>
                    <span>총 참여: {surveyInfo.totalParticipants}명</span>
                </div>
            </div>

            <div className="results-tabs mb-4">
                {["종합 결과", "참여자별 결과", "일자별 참여수"].map((tab) => (
                    <button
                        key={tab}
                        className={`btn btn-outline-secondary me-2 ${
                            activeTab === tab ? "active" : ""
                        }`}
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
                        <h3 className="mb-3">종합 결과</h3>
                        {uniqueQuestions.length > 0 ? (
                            uniqueQuestions.map((qId) => (
                                <div
                                    key={qId}
                                    className="chart-section mb-4"
                                    style={{
                                        maxWidth: "500px",
                                        margin: "0 auto",
                                    }}
                                >
                                    <h5 className="mb-2">
                                        {questionMap[qId] || "제목 없음"}
                                    </h5>
                                    <Pie
                                        data={getPieChartData(qId)}
                                        options={{ maintainAspectRatio: true }}
                                    />
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
                        <h3 className="mb-3">참여자별 결과</h3>
                        {participants.length > 0 ? (
                            <div
                                className="table-responsive"
                                style={{
                                    maxHeight: "500px",
                                    overflowY: "auto",
                                }}
                            >
                                <table className="table table-striped table-hover align-middle text-break">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>응답 ID</th>
                                            <th>참여자 이름</th>
                                            <th>제출일</th>
                                            <th>질문</th>
                                            <th>선택 옵션</th>
                                            <th>답변</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((p, pIdx) =>
                                            p.answers.map((a, idx) => {
                                                const respondentName =
                                                    p.respondent_name ??
                                                    `익명 ${pIdx + 1}`;
                                                const questionText =
                                                    questionMap[a.questionId] ??
                                                    "제목 없음";
                                                let optionText = "";
                                                if (
                                                    a.optionId &&
                                                    optionMap[a.optionId]
                                                ) {
                                                    optionText =
                                                        optionMap[a.optionId];
                                                } else if (a.optionText) {
                                                    try {
                                                        const parsed =
                                                            JSON.parse(
                                                                a.optionText
                                                            );
                                                        optionText =
                                                            parsed.title ??
                                                            a.optionText;
                                                    } catch {
                                                        optionText =
                                                            a.optionText;
                                                    }
                                                }
                                                const answerText =
                                                    a.answerText ?? "-";

                                                return (
                                                    <tr
                                                        key={`${p.response_id}-${idx}`}
                                                    >
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                        >
                                                            {p.response_id}
                                                        </td>
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "100px",
                                                            }}
                                                        >
                                                            {respondentName}
                                                        </td>
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                        >
                                                            {new Date(
                                                                p.submitted_at
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "200px",
                                                            }}
                                                        >
                                                            {questionText}
                                                        </td>
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                        >
                                                            {optionText || "-"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                minWidth:
                                                                    "150px",
                                                            }}
                                                        >
                                                            {answerText}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>참여자가 없습니다.</p>
                        )}
                    </section>
                )}

                {/* 일자별 참여수 */}
                {activeTab === "일자별 참여수" && (
                    <section>
                        <h3 className="mb-3">일자별 참여수 (최근 7일)</h3>
                        {participants.length > 0 ? (
                            <div
                                style={{ maxWidth: "600px", margin: "0 auto" }}
                            >
                                <Bar
                                    data={getBarChartData()}
                                    options={{
                                        maintainAspectRatio: true,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { stepSize: 1 },
                                            },
                                        },
                                    }}
                                />
                            </div>
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
