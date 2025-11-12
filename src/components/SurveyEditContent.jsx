import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/SurveyEditContent.css";

function SurveyEditContent({ surveyId }) {
    const [questions, setQuestions] = useState([
        { id: Date.now(), question: "", options: [""] },
    ]);
    const [activeTab, setActiveTab] = useState("목차");

    // 질문 추가
    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now(), question: "", options: [""] },
        ]);
    };

    // 질문 삭제
    const deleteQuestion = (id) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    // 질문 업데이트
    const updateQuestion = (id, value) => {
        setQuestions(
            questions.map((q) => (q.id === id ? { ...q, question: value } : q))
        );
    };

    // 옵션 추가
    const addOption = (qid) => {
        setQuestions(
            questions.map((q) =>
                q.id === qid ? { ...q, options: [...q.options, ""] } : q
            )
        );
    };

    const updateOption = (qid, idx, value) => {
        setQuestions(
            questions.map((q) =>
                q.id === qid
                    ? {
                          ...q,
                          options: q.options.map((opt, i) =>
                              i === idx ? value : opt
                          ),
                      }
                    : q
            )
        );
    };

    // 카드 드래그 순서 변경
    const moveQuestion = (dragIndex, hoverIndex) => {
        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(dragIndex, 1);
        newQuestions.splice(hoverIndex, 0, removed);
        setQuestions(newQuestions);
    };

    return (
        <div className="survey-layout">
            {/* 왼쪽: 설문 폼 */}
            <div className="survey-left">
                <input
                    type="text"
                    className="survey-input title-input"
                    placeholder="설문 제목을 입력하세요"
                />
                <textarea
                    className="survey-input desc-input"
                    placeholder="설문 설명을 입력하세요"
                />
                <div className="date-group">
                    <label>
                        시작일: <input type="date" />
                    </label>
                    <label>
                        종료일: <input type="date" />
                    </label>
                </div>

                <div className="question-section">
                    <AnimatePresence>
                        {questions.map((q, index) => (
                            <motion.div
                                key={q.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 500 }}
                                onDragEnd={() => {}}
                                className="question-card"
                            >
                                <div className="question-header">
                                    <span>질문 {index + 1}</span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteQuestion(q.id)}
                                    >
                                        삭제
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="question-input"
                                    value={q.question}
                                    onChange={(e) =>
                                        updateQuestion(q.id, e.target.value)
                                    }
                                    placeholder="질문을 입력하세요"
                                />
                                {q.options.map((opt, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        className="option-input"
                                        value={opt}
                                        onChange={(e) =>
                                            updateOption(
                                                q.id,
                                                i,
                                                e.target.value
                                            )
                                        }
                                        placeholder={`보기 ${i + 1}`}
                                    />
                                ))}
                                <button
                                    className="add-option-btn"
                                    onClick={() => addOption(q.id)}
                                >
                                    + 보기 추가
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <button className="add-question-btn" onClick={addQuestion}>
                        + 질문 추가
                    </button>
                </div>
            </div>

            {/* 오른쪽 탭 패널 */}
            <div className="survey-right">
                <div className="tab-buttons">
                    {["목차", "꾸미기", "설문 설정"].map((tab) => (
                        <button
                            key={tab}
                            className={activeTab === tab ? "active" : ""}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === "목차" && (
                        <ul>
                            {questions.map((q, index) => (
                                <li key={q.id}>
                                    {q.question || `질문 ${index + 1}`}
                                </li>
                            ))}
                        </ul>
                    )}
                    {activeTab === "꾸미기" && (
                        <div>
                            <label>
                                글꼴:
                                <select>
                                    <option>기본</option>
                                    <option>돋움</option>
                                    <option>바탕</option>
                                </select>
                            </label>
                            <label>
                                배경색:
                                <input type="color" />
                            </label>
                            <label>
                                설문 커버 이미지:
                                <input type="file" />
                            </label>
                        </div>
                    )}
                    {activeTab === "설문 설정" && (
                        <div>
                            <label>
                                최대 참여 수:
                                <input type="number" />
                            </label>
                            <label>
                                결과 공개:
                                <select>
                                    <option>공개</option>
                                    <option>비공개</option>
                                </select>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SurveyEditContent;
