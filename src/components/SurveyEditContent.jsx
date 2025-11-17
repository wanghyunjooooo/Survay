import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/SurveyEditContent.css";

const SurveyEditContent = forwardRef(({ surveyId, surveyData }, ref) => {
    // =====================
    // 초기 state 설정
    // =====================
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(100);
    const [isPublic, setIsPublic] = useState(true);
    const [questions, setQuestions] = useState([
        { id: Date.now(), question: "", options: [""] },
    ]);
    const [activeTab, setActiveTab] = useState("목차");

    // =====================
    // surveyData로 초기값 세팅
    // =====================
    useEffect(() => {
        if (surveyData) {
            setTitle(surveyData.title || "");
            setDescription(surveyData.description || "");
            setStartDate(surveyData.start_date?.slice(0, 10) || "");
            setEndDate(surveyData.end_date?.slice(0, 10) || "");
            setMaxParticipants(surveyData.max_participants || 100);
            setIsPublic(surveyData.is_public ?? true);
            setQuestions(
                surveyData.questions?.length
                    ? surveyData.questions.map((q, idx) => ({
                          id: Date.now() + idx,
                          question: q.question || "",
                          options: q.options?.length ? q.options : [""],
                      }))
                    : [{ id: Date.now(), question: "", options: [""] }]
            );
        }
    }, [surveyData]);

    // =====================
    // ref를 통해 부모가 상태 가져갈 수 있도록
    // =====================
    useImperativeHandle(ref, () => ({
        getSurveyData: () => ({
            title,
            description,
            start_date: startDate,
            end_date: endDate,
            max_participants: maxParticipants,
            is_public: isPublic,
            questions: questions.map((q) => ({
                question: q.question,
                options: q.options,
            })),
        }),
    }));

    // =====================
    // 질문 관련 함수
    // =====================
    const addQuestion = () =>
        setQuestions([
            ...questions,
            { id: Date.now(), question: "", options: [""] },
        ]);

    const deleteQuestion = (id) =>
        setQuestions(questions.filter((q) => q.id !== id));

    const updateQuestion = (id, value) =>
        setQuestions(
            questions.map((q) => (q.id === id ? { ...q, question: value } : q))
        );

    const addOption = (qid) =>
        setQuestions(
            questions.map((q) =>
                q.id === qid ? { ...q, options: [...q.options, ""] } : q
            )
        );

    const updateOption = (qid, idx, value) =>
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

    const moveQuestion = (dragIndex, hoverIndex) => {
        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(dragIndex, 1);
        newQuestions.splice(hoverIndex, 0, removed);
        setQuestions(newQuestions);
    };

    // =====================
    // 렌더링
    // =====================
    return (
        <div className="survey-layout">
            {/* 왼쪽 설문 폼 */}
            <div className="survey-left">
                <input
                    type="text"
                    className="survey-input title-input"
                    placeholder="설문 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="survey-input desc-input"
                    placeholder="설문 설명을 입력하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="date-group">
                    <label>
                        시작일:{" "}
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>
                    <label>
                        종료일:{" "}
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
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
                            {questions.map((q, i) => (
                                <li key={q.id}>
                                    {q.question || `질문 ${i + 1}`}
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
                                배경색: <input type="color" />
                            </label>
                            <label>
                                커버 이미지: <input type="file" />
                            </label>
                        </div>
                    )}
                    {activeTab === "설문 설정" && (
                        <div>
                            <label>
                                최대 참여 수:{" "}
                                <input
                                    type="number"
                                    value={maxParticipants}
                                    onChange={(e) =>
                                        setMaxParticipants(
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </label>
                            <label>
                                결과 공개:
                                <select
                                    value={isPublic}
                                    onChange={(e) =>
                                        setIsPublic(e.target.value === "true")
                                    }
                                >
                                    <option value="true">공개</option>
                                    <option value="false">비공개</option>
                                </select>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default SurveyEditContent;
