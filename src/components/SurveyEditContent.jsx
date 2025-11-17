import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/SurveyEditContent.css";
import { createPage, getPages } from "../api/api";

const SurveyEditContent = forwardRef(({ surveyId, surveyData }, ref) => {
    // =====================
    // 기본 설문 정보
    // =====================
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(100);
    const [isPublic, setIsPublic] = useState(true);

    // =====================
    // 페이지 / 탭
    // =====================
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(null);
    const [activeTab, setActiveTab] = useState("목차");

    // 페이지별 질문 저장
    const [pageQuestions, setPageQuestions] = useState({});

    // =====================
    // 초기 surveyData 로드
    // =====================
    useEffect(() => {
        if (surveyData) {
            setTitle(surveyData.title || "");
            setDescription(surveyData.description || "");
            setStartDate(surveyData.start_date?.slice(0, 10) || "");
            setEndDate(surveyData.end_date?.slice(0, 10) || "");
            setMaxParticipants(surveyData.max_participants || 100);
            setIsPublic(surveyData.is_public ?? true);
        }
    }, [surveyData]);

    // =====================
    // 페이지 불러오기
    // =====================
    useEffect(() => {
        if (surveyId) loadPages();
    }, [surveyId]);

    const loadPages = async () => {
        try {
            const res = await getPages(surveyId);
            setPages(res.pages || []);

            if (res.pages?.length) {
                const firstPageId = res.pages[0].page_id;
                setCurrentPage(firstPageId);
                setPageQuestions((prev) => ({
                    ...prev,
                    [firstPageId]: prev[firstPageId] || [
                        {
                            id: Date.now() + Math.random(),
                            question: "",
                            options: [""],
                        },
                    ],
                }));
            }
        } catch (err) {
            console.error("페이지 불러오기 실패:", err);
        }
    };

    // =====================
    // 페이지 추가
    // =====================
    const handleAddPage = async () => {
        try {
            const newPageData = {
                title: `${pages.length + 1}번째 페이지`,
                order_index: pages.length + 1,
            };
            const res = await createPage(surveyId, newPageData);

            setPages([...pages, res.page]);

            setPageQuestions((prev) => ({
                ...prev,
                [res.page.page_id]: [
                    {
                        id: Date.now() + Math.random(),
                        question: "",
                        options: [""],
                    },
                ],
            }));

            setCurrentPage(res.page.page_id);
        } catch (err) {
            console.error("페이지 추가 실패:", err);
        }
    };

    // =====================
    // 질문 관련
    // =====================
    const addQuestion = (pageId) => {
        setPageQuestions({
            ...pageQuestions,
            [pageId]: [
                ...(pageQuestions[pageId] || []),
                { id: Date.now() + Math.random(), question: "", options: [""] },
            ],
        });
    };

    const deleteQuestion = (pageId, qid) => {
        setPageQuestions({
            ...pageQuestions,
            [pageId]: (pageQuestions[pageId] || []).filter((q) => q.id !== qid),
        });
    };

    const updateQuestion = (pageId, qid, value) => {
        setPageQuestions({
            ...pageQuestions,
            [pageId]: (pageQuestions[pageId] || []).map((q) =>
                q.id === qid ? { ...q, question: value } : q
            ),
        });
    };

    const addOption = (pageId, qid) => {
        setPageQuestions({
            ...pageQuestions,
            [pageId]: (pageQuestions[pageId] || []).map((q) =>
                q.id === qid ? { ...q, options: [...q.options, ""] } : q
            ),
        });
    };

    const updateOption = (pageId, qid, idx, value) => {
        setPageQuestions({
            ...pageQuestions,
            [pageId]: (pageQuestions[pageId] || []).map((q) =>
                q.id === qid
                    ? {
                          ...q,
                          options: q.options.map((o, i) =>
                              i === idx ? value : o
                          ),
                      }
                    : q
            ),
        });
    };

    // =====================
    // 부모로 내보내는 데이터
    // =====================
    useImperativeHandle(ref, () => ({
        getSurveyData: () => ({
            title,
            description,
            start_date: startDate,
            end_date: endDate,
            max_participants: maxParticipants,
            is_public: isPublic,
            pages,
            pageQuestions,
        }),
    }));

    // =====================
    // 렌더링
    // =====================
    return (
        <div className="survey-layout">
            {/* 왼쪽: 질문 영역 */}
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

                {/* 페이지별 컨테이너 */}
                {pages.map((page) => (
                    <div
                        key={page.page_id}
                        className={`page-container ${
                            currentPage === page.page_id ? "active" : "hidden"
                        }`}
                    >
                        <h4>{page.title}</h4>
                        <AnimatePresence>
                            {(pageQuestions[page.page_id] || []).map(
                                (q, index) => (
                                    <motion.div
                                        key={q.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="question-card"
                                    >
                                        <div className="question-header">
                                            <span>질문 {index + 1}</span>
                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    deleteQuestion(
                                                        page.page_id,
                                                        q.id
                                                    )
                                                }
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            className="question-input"
                                            value={q.question}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    page.page_id,
                                                    q.id,
                                                    e.target.value
                                                )
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
                                                        page.page_id,
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
                                            onClick={() =>
                                                addOption(page.page_id, q.id)
                                            }
                                        >
                                            + 보기 추가
                                        </button>
                                    </motion.div>
                                )
                            )}
                        </AnimatePresence>
                        <button
                            className="add-question-btn"
                            onClick={() => addQuestion(page.page_id)}
                        >
                            + 질문 추가
                        </button>
                    </div>
                ))}
            </div>

            {/* 오른쪽: 탭 */}
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
                        <>
                            <h3>📄 페이지 목록</h3>
                            <ul>
                                {pages.map((p) => (
                                    <li
                                        key={p.page_id}
                                        onClick={() =>
                                            setCurrentPage(p.page_id)
                                        }
                                        style={{
                                            cursor: "pointer",
                                            fontWeight:
                                                currentPage === p.page_id
                                                    ? "bold"
                                                    : "normal",
                                            color:
                                                currentPage === p.page_id
                                                    ? "#5a2dff"
                                                    : "black",
                                        }}
                                    >
                                        {p.order_index}. {p.title}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="add-page-btn"
                                onClick={handleAddPage}
                            >
                                + 페이지 추가
                            </button>
                        </>
                    )}

                    {activeTab === "꾸미기" && (
                        <>
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
                        </>
                    )}

                    {activeTab === "설문 설정" && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default SurveyEditContent;
