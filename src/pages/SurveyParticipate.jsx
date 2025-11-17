import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSurveyByShareLink, submitSurveyResponse } from "../api/api";

function SurveyParticipate() {
    const { shareLink } = useParams(); // URL에서 shareLink 가져오기
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: optionId or answerText }

    // 설문 데이터 불러오기
    useEffect(() => {
        const fetchSurvey = async () => {
            const res = await getSurveyByShareLink(shareLink);
            if (res.success) setSurvey(res.survey);
            else alert("설문 정보를 불러올 수 없습니다.");
        };
        fetchSurvey();
    }, [shareLink]);

    // 답변 선택/입력
    const handleChange = (questionId, value, type) => {
        if (type === "multiple") {
            // 다중 선택
            const prev = answers[questionId] || [];
            if (prev.includes(value)) {
                // 이미 선택했으면 제거
                setAnswers({
                    ...answers,
                    [questionId]: prev.filter((v) => v !== value),
                });
            } else {
                setAnswers({ ...answers, [questionId]: [...prev, value] });
            }
        } else {
            // 단일 선택/텍스트
            setAnswers({ ...answers, [questionId]: value });
        }
    };

    // 설문 제출
    const handleSubmit = async () => {
        if (!survey) return;

        const answerArray = survey.pages.flatMap((page) =>
            page.questions
                .map((q) => {
                    const ans = answers[q.id];
                    if (!ans || (Array.isArray(ans) && ans.length === 0))
                        return null;

                    if (q.type === "single") {
                        return { questionId: q.id, optionId: ans };
                    } else if (q.type === "multiple") {
                        return ans.map((optionId) => ({
                            questionId: q.id,
                            optionId,
                        }));
                    } else {
                        return { questionId: q.id, answerText: ans };
                    }
                })
                .filter(Boolean)
                .flat()
        );

        const res = await submitSurveyResponse(survey.id, answerArray);
        if (res.success) alert("설문 제출 완료!");
        else alert("설문 제출 실패: " + res.message);
    };

    if (!survey) return <div>설문 로딩 중...</div>;

    return (
        <div className="container py-5">
            <h3>{survey.title}</h3>
            <p>{survey.description}</p>
            <hr />
            {survey.pages.map((page) => (
                <div key={page.id} className="mb-4">
                    <h5>{page.title}</h5>
                    {page.questions.map((q) => (
                        <div key={q.id} className="mb-3">
                            <label className="form-label">{q.title}</label>

                            {q.type === "single" &&
                                q.options.length > 0 &&
                                q.options.map((opt) => (
                                    <div key={opt.id} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name={q.id}
                                            value={opt.id}
                                            onChange={() =>
                                                handleChange(
                                                    q.id,
                                                    opt.id,
                                                    q.type
                                                )
                                            }
                                        />
                                        <label className="form-check-label">
                                            {opt.text}
                                        </label>
                                    </div>
                                ))}

                            {q.type === "multiple" &&
                                q.options.length > 0 &&
                                q.options.map((opt) => (
                                    <div key={opt.id} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value={opt.id}
                                            checked={
                                                answers[q.id]?.includes(
                                                    opt.id
                                                ) || false
                                            }
                                            onChange={() =>
                                                handleChange(
                                                    q.id,
                                                    opt.id,
                                                    q.type
                                                )
                                            }
                                        />
                                        <label className="form-check-label">
                                            {opt.text}
                                        </label>
                                    </div>
                                ))}

                            {(q.type === "short" || q.type === "long") && (
                                <textarea
                                    className="form-control"
                                    rows={q.type === "long" ? 4 : 2}
                                    value={answers[q.id] || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            q.id,
                                            e.target.value,
                                            q.type
                                        )
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>
            ))}
            <button className="btn btn-primary" onClick={handleSubmit}>
                제출
            </button>
        </div>
    );
}

export default SurveyParticipate;
