import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSurveyByShareLink, submitSurveyResponse } from "../api/api";

function SurveyParticipate() {
    const { shareLink } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentPage, setCurrentPage] = useState(0);

    // 서버 옵션 text에서 JSON 파싱 후 title만 보여주는 함수
    const renderOptionText = (text) => {
        if (!text) return "";
        try {
            const parsed = JSON.parse(text);
            return parsed?.title || "";
        } catch {
            return text;
        }
    };

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const res = await getSurveyByShareLink(shareLink);
                if (res?.success && res?.survey) {
                    const normalizedSurvey = {
                        ...res.survey,
                        pages: (res.survey.pages || []).map((page) => ({
                            ...page,
                            questions: (page.questions || []).map((q) => ({
                                ...q,
                                type: q.type || "single", // 기본값 single
                            })),
                        })),
                    };
                    setSurvey(normalizedSurvey);
                } else alert("설문 정보를 불러올 수 없습니다.");
            } catch (err) {
                console.error("Survey fetch error:", err);
                alert("설문 정보를 불러오는 중 오류가 발생했습니다.");
            }
        };
        fetchSurvey();
    }, [shareLink]);

    const handleChange = (questionId, value, type) => {
        if (type === "multiple") {
            const prev = answers[questionId] || [];
            if (prev.includes(value)) {
                setAnswers({
                    ...answers,
                    [questionId]: prev.filter((v) => v !== value),
                });
            } else {
                setAnswers({ ...answers, [questionId]: [...prev, value] });
            }
        } else {
            setAnswers({ ...answers, [questionId]: value });
        }
    };

    const handleSubmit = async () => {
        if (!survey) return;

        const answerArray = (survey.pages || []).flatMap((page) =>
            (page.questions || [])
                .map((q) => {
                    const ans = answers[q?.id];
                    if (!ans || (Array.isArray(ans) && ans.length === 0))
                        return null;

                    if (q.type === "single")
                        return { questionId: q.id, optionId: ans };
                    if (q.type === "multiple")
                        return ans.map((optionId) => ({
                            questionId: q.id,
                            optionId,
                        }));
                    return { questionId: q.id, answerText: ans };
                })
                .filter(Boolean)
                .flat()
        );

        try {
            const res = await submitSurveyResponse(survey.id, answerArray);
            if (res?.success) alert("설문 제출 완료!");
            else alert("설문 제출 실패: " + res?.message);
        } catch (err) {
            console.error("Submit error:", err);
            alert("서버 오류로 제출에 실패했습니다.");
        }
    };

    if (!survey) return <div className="text-center py-5">설문 로딩 중...</div>;

    const page = survey.pages?.[currentPage] || { title: "", questions: [] };

    return (
        <div className="container py-5" style={{ maxWidth: "650px" }}>
            {/* 설문 제목 */}
            <div className="text-center mb-5">
                <h1 className="fw-bold">{survey?.title || "제목 없음"}</h1>
                <p className="text-secondary fs-5">
                    {survey?.description || ""}
                </p>
            </div>

            {/* 페이지 카드 */}
            <div className="card mb-4 shadow-sm rounded-4 p-4 border-0">
                <h4 className="mb-4 fw-semibold" style={{ color: "#0047f9" }}>
                    {page?.title || `페이지 ${currentPage + 1}`}
                </h4>

                {(page.questions || []).map((q, qIdx) => (
                    <div key={q?.id || qIdx} className="mb-4">
                        <p className="fw-semibold mb-2">
                            {qIdx + 1}. {q?.title || "질문 없음"}
                        </p>

                        {(q.type === "single" || q.type === "multiple") &&
                            (q.options || []).map((opt) => {
                                const selected =
                                    q.type === "single"
                                        ? answers[q?.id] === opt?.id
                                        : answers[q?.id]?.includes(opt?.id);

                                return (
                                    <div
                                        key={opt?.id}
                                        className={`form-check p-3 rounded-3 mb-2 shadow-sm d-flex align-items-center justify-content-between ${
                                            selected
                                                ? "bg-primary text-white"
                                                : "bg-light"
                                        }`}
                                        style={{
                                            cursor: "pointer",
                                            transition: "0.2s",
                                        }}
                                        onClick={() =>
                                            handleChange(q?.id, opt?.id, q.type)
                                        }
                                    >
                                        <span>
                                            {renderOptionText(opt?.text)}
                                        </span>
                                        <input
                                            className="form-check-input ms-2"
                                            type={
                                                q.type === "single"
                                                    ? "radio"
                                                    : "checkbox"
                                            }
                                            value={opt?.id}
                                            checked={selected || false}
                                            readOnly
                                        />
                                    </div>
                                );
                            })}

                        {(q.type === "short" || q.type === "long") && (
                            <textarea
                                className="form-control mt-2 rounded-3 shadow-sm"
                                rows={q.type === "long" ? 4 : 2}
                                value={answers[q?.id] || ""}
                                onChange={(e) =>
                                    handleChange(q?.id, e.target.value, q.type)
                                }
                                placeholder="여기에 입력하세요..."
                                style={{ resize: "none" }}
                            />
                        )}
                    </div>
                ))}

                {/* 페이지 전환/제출 버튼 */}
                <div className="d-flex justify-content-between mt-4">
                    {currentPage > 0 ? (
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            이전
                        </button>
                    ) : (
                        <div />
                    )}

                    {currentPage < (survey.pages?.length || 0) - 1 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            다음
                        </button>
                    ) : (
                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                        >
                            제출
                        </button>
                    )}
                </div>
            </div>

            <div className="text-center text-muted mt-2">
                페이지 {currentPage + 1} / {survey.pages?.length || 0}
            </div>
        </div>
    );
}

export default SurveyParticipate;
