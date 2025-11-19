import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import {
    getSurveyById,
    createSurvey,
    updateSurvey,
    getPages,
    createPage,
    updatePage,
    deletePage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByPage, // FIXED: 페이지 질문 조회 API 추가
} from "../api/api";

const SurveyEditorWithAPI = forwardRef(
    ({ surveyId, surveyType, onChange }, ref) => {
        const [title, setTitle] = useState("");
        const [description, setDescription] = useState("");
        const [pages, setPages] = useState([]);
        const [loading, setLoading] = useState(true);
        const [currentSurveyId, setCurrentSurveyId] = useState(surveyId);

        const [meta, setMeta] = useState({
            subtitle: "",
            cover_image: "",
            bg_color: "#ffffff",
            font: "Arial",
            start_date: "",
            end_date: "",
            max_participants: 100,
            is_public: true,
        });

        const prevDataRef = useRef(null);

        const handleMetaChange = (key, value) => {
            setMeta((prev) => ({ ...prev, [key]: value }));
        };

        // =======================
        // 초기 설문/페이지 로드 + 질문 리스트 연결
        // =======================
        useEffect(() => {
            const fetchOrCreateSurvey = async () => {
                if (!surveyType) return; // surveyType 준비될 때까지 대기

                try {
                    let sid = currentSurveyId;

                    if (currentSurveyId === "new") {
                        // 1. 새 설문 생성
                        const res = await createSurvey({
                            title: "제목 없음",
                            subtitle: "",
                            description: "",
                            cover_image: "",
                            bg_color: "#ffffff",
                            font: "Arial",
                            start_date: new Date().toISOString(),
                            end_date: new Date().toISOString(),
                            max_participants: 100,
                            is_public: true,
                        });

                        if (res?.success) {
                            sid = res.survey?.survey_id || res.survey?.id;
                            if (!sid)
                                throw new Error("서버 응답에 ID가 없습니다.");
                            setCurrentSurveyId(sid);

                            // 2. 첫 페이지 생성
                            const pageRes = await createPage(sid, {
                                title: "페이지 1",
                                order_index: 0,
                            });

                            if (pageRes?.success) {
                                const firstQuestion = {
                                    id: `temp-${Date.now()}`,
                                    text: "질문 입력",
                                    type:
                                        surveyType === "short"
                                            ? "short"
                                            : "single",
                                    order_index: 0,
                                    options: surveyType === "short" ? [] : [""],
                                    isTemp: true,
                                };

                                setPages([
                                    {
                                        id: pageRes.page.page_id,
                                        title: pageRes.page.title || "페이지 1",
                                        description: "",
                                        questions: [firstQuestion],
                                    },
                                ]);
                            }
                        }
                    } else {
                        // 3. 기존 설문 불러오기
                        const res = await getSurveyById(sid);
                        if (res?.success) {
                            setTitle(res.survey?.title || "");
                            setDescription(res.survey?.description || "");
                            setMeta({
                                subtitle: res.survey.subtitle || "",
                                cover_image: res.survey.cover_image || "",
                                bg_color: res.survey.bg_color || "#ffffff",
                                font: res.survey.font || "Arial",
                                start_date: res.survey.start_date || "",
                                end_date: res.survey.end_date || "",
                                max_participants:
                                    res.survey.max_participants || 100,
                                is_public: res.survey.is_public ?? true,
                            });

                            const pagesRes = await getPages(sid);
                            if (pagesRes?.success) {
                                const pagesWithQuestions = await Promise.all(
                                    pagesRes.pages.map(async (p, idx) => {
                                        const qRes = await getQuestionsByPage(
                                            p.page_id
                                        );
                                        const questions = (
                                            qRes.questions || []
                                        ).map((q) => ({
                                            id: q.question_id,
                                            text: q.title,
                                            type: q.type,
                                            order_index: q.order_index ?? 0,
                                            options: [], // 필요 시 옵션 추가
                                        }));

                                        // 질문이 없으면 임시 질문 1개 추가
                                        const finalQuestions =
                                            questions.length > 0
                                                ? questions
                                                : [
                                                      {
                                                          id: `temp-${Date.now()}`,
                                                          text: "질문 입력",
                                                          type:
                                                              surveyType ===
                                                              "short"
                                                                  ? "short"
                                                                  : "single",
                                                          order_index: 0,
                                                          options:
                                                              surveyType ===
                                                              "short"
                                                                  ? []
                                                                  : [""],
                                                          isTemp: true,
                                                      },
                                                  ];

                                        return {
                                            id: p.page_id,
                                            title:
                                                p.title || `페이지 ${idx + 1}`,
                                            description: p.description || "",
                                            questions: finalQuestions,
                                        };
                                    })
                                );
                                setPages(pagesWithQuestions);
                            } else {
                                setPages([]);
                            }
                        } else {
                            setPages([]);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    setPages([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchOrCreateSurvey();
        }, [currentSurveyId, surveyType]);

        // =======================
        // 상위 데이터 전달
        // =======================
        useEffect(() => {
            const data = { title, description, pages, type: surveyType, meta };
            const dataString = JSON.stringify(data);

            if (prevDataRef.current !== dataString) {
                prevDataRef.current = dataString;
                onChange?.(data);
            }
        }, [title, description, pages, surveyType, meta, onChange]);

        // =======================
        // ref API
        // =======================
        useImperativeHandle(ref, () => ({
            getSurveyData: () => ({ title, description, pages, meta }),
            saveSurvey: async () => {
                try {
                    const payload = {
                        title: title || "제목 없음",
                        subtitle: meta.subtitle || "",
                        description: description || "",
                        cover_image: meta.cover_image || "",
                        bg_color: meta.bg_color || "#ffffff",
                        font: meta.font || "Arial",
                        start_date: meta.start_date
                            ? new Date(meta.start_date).toISOString()
                            : new Date().toISOString(),
                        end_date: meta.end_date
                            ? new Date(meta.end_date).toISOString()
                            : new Date().toISOString(),
                        max_participants: meta.max_participants || 100,
                        is_public: meta.is_public ?? true,
                    };

                    let res;
                    if (currentSurveyId === "new") {
                        res = await createSurvey(payload);
                        if (res?.success) {
                            const newId =
                                res.survey?.survey_id || res.survey?.id;
                            if (!newId)
                                throw new Error("서버 응답에 ID가 없습니다.");
                            setCurrentSurveyId(newId);
                            alert("설문 저장 완료!");
                        } else {
                            alert("저장 실패: " + (res?.message || ""));
                        }
                    } else {
                        res = await updateSurvey(currentSurveyId, payload);
                        if (res?.success) alert("설문 저장 완료!");
                        else alert("저장 실패: " + (res?.message || ""));
                    }
                } catch (err) {
                    console.error(err);
                    alert("서버 오류");
                }
            },
        }));

        // =======================
        // 페이지 / 질문 CRUD
        // =======================

        const addPage = async () => {
            if (!currentSurveyId) return alert("설문을 먼저 저장하세요.");
            try {
                const res = await createPage(currentSurveyId, {
                    title: `페이지 ${pages.length + 1}`,
                    order_index: pages.length,
                });
                if (res?.success) {
                    setPages([
                        ...pages,
                        {
                            id: res.page.page_id,
                            title: res.page.title,
                            description: "",
                            questions: [
                                {
                                    id: `temp-${Date.now()}`,
                                    text: "질문 입력",
                                    type:
                                        surveyType === "short"
                                            ? "short"
                                            : "single",
                                    order_index: 0,
                                    options: surveyType === "short" ? [] : [""],
                                    isTemp: true,
                                },
                            ],
                        },
                    ]);
                }
            } catch {
                alert("페이지 추가 실패");
            }
        };

        const updatePageTitle = (page, pageIdx, newTitle) => {
            const safeTitle = newTitle || "제목 없음";
            setPages((prev) =>
                prev.map((p) =>
                    p.id === page.id ? { ...p, title: safeTitle } : p
                )
            );
        };

        const handlePageBlur = async (page, pageIdx) => {
            const targetPage = pages.find((p) => p.id === page.id);
            if (!targetPage) return;

            const payload = {
                title: targetPage.title || "제목 없음",
                order_index: pageIdx ?? 0,
            };

            try {
                await updatePage(page.id, payload);
            } catch (err) {
                console.error("페이지 수정 오류:", err);
            }
        };
        const deletePageById = async (pageId) => {
            try {
                await deletePage(pageId);
                setPages((prev) => prev.filter((p) => p.id !== pageId));
            } catch {
                alert("페이지 삭제 실패");
            }
        };

        const addQuestion = async (pageId) => {
            const page = pages.find((p) => p.id === pageId);
            if (!page) return;

            const questionType = surveyType === "short" ? "short" : "single";

            // 1) 임시 질문 추가 (UI용)
            const tempQuestion = {
                id: `temp-${Date.now()}-${Math.random()}`, // 임시 ID 문자열로 변경
                text: "새 질문",
                type: questionType,
                order_index: page.questions.length,
                options: [],
                isTemp: true, // 임시 질문 표시용 플래그
            };

            setPages((prev) =>
                prev.map((p) =>
                    p.id === pageId
                        ? { ...p, questions: [...p.questions, tempQuestion] }
                        : p
                )
            );

            try {
                // 2) 서버 저장
                const res = await createQuestion({
                    pageId,
                    title: tempQuestion.text,
                    type: questionType,
                    order_index: tempQuestion.order_index,
                });

                if (res?.success && res.question) {
                    // 3) 서버에서 받은 ID로 임시 ID 교체
                    setPages((prev) =>
                        prev.map((p) =>
                            p.id === pageId
                                ? {
                                      ...p,
                                      questions: p.questions.map((q) =>
                                          q.id === tempQuestion.id
                                              ? {
                                                    ...q,
                                                    id: res.question
                                                        .question_id,
                                                    text: res.question.title,
                                                    type: res.question.type,
                                                    order_index:
                                                        res.question
                                                            .order_index,
                                                    isTemp: false, // 서버 저장 완료
                                                }
                                              : q
                                      ),
                                  }
                                : p
                        )
                    );
                } else {
                    // 서버 저장 실패 시 임시 질문 롤백
                    setPages((prev) =>
                        prev.map((p) =>
                            p.id === pageId
                                ? {
                                      ...p,
                                      questions: p.questions.filter(
                                          (q) => q.id !== tempQuestion.id
                                      ),
                                  }
                                : p
                        )
                    );
                    alert("질문 추가 실패: 서버 저장 오류");
                }
            } catch (err) {
                console.error("질문 추가 오류:", err);
                // 서버 오류 시 임시 질문 롤백
                setPages((prev) =>
                    prev.map((p) =>
                        p.id === pageId
                            ? {
                                  ...p,
                                  questions: p.questions.filter(
                                      (q) => q.id !== tempQuestion.id
                                  ),
                              }
                            : p
                    )
                );
                alert("질문 추가 실패: 서버 오류");
            }
        };

        const updateQuestionText = (pageId, questionId, value) => {
            setPages(
                pages.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: p.questions.map((q) =>
                                  q.id === questionId
                                      ? { ...q, text: value }
                                      : q
                              ),
                          }
                        : p
                )
            );
        };

        const handleQuestionBlur = async (pageId, questionId, qIdx) => {
            const page = pages.find((p) => p.id === pageId);
            if (!page) return;

            const question = page.questions.find((q) => q.id === questionId);
            if (!question || question.isTemp) return; // 임시 질문이면 무시

            const payload = {
                title: question.text || "제목 없음",
                type:
                    question.type ||
                    (surveyType === "short" ? "short" : "single"),
                order_index: question.order_index ?? qIdx ?? 0,
            };

            try {
                await updateQuestion(questionId, payload);
            } catch (err) {
                console.error("질문 수정 오류:", err);
            }
        };

        const handleDeleteQuestion = async (pageId, questionId) => {
            try {
                const res = await deleteQuestion(questionId);
                if (res?.success) {
                    setPages((prev) =>
                        prev.map((p) =>
                            p.id === pageId
                                ? {
                                      ...p,
                                      questions: p.questions.filter(
                                          (q) => q.id !== questionId
                                      ),
                                  }
                                : p
                        )
                    );
                }
            } catch (err) {
                console.error("질문 삭제 오류:", err);
            }
        };

        const addOption = (pageId, questionId) => {
            if (surveyType === "short") return;
            setPages(
                pages.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: p.questions.map((q) =>
                                  q.id === questionId
                                      ? {
                                            ...q,
                                            options: [...(q.options || []), ""],
                                        }
                                      : q
                              ),
                          }
                        : p
                )
            );
        };

        const updateOptionText = (pageId, questionId, idx, value) => {
            setPages(
                pages.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: p.questions.map((q) =>
                                  q.id === questionId
                                      ? {
                                            ...q,
                                            options: q.options.map((o, i) =>
                                                i === idx ? value : o
                                            ),
                                        }
                                      : q
                              ),
                          }
                        : p
                )
            );
        };

        const updatePageDescription = (pageId, value) => {
            setPages(
                pages.map((p) =>
                    p.id === pageId ? { ...p, description: value } : p
                )
            );
        };

        if (loading) return <div>로딩 중...</div>;

        return (
            <div style={{ display: "flex", gap: "2rem", marginTop: "50px" }}>
                <div style={{ flex: 3 }}>
                    <Form.Group className="mb-3">
                        <Form.Control
                            placeholder="설문 제목"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="설문 설명"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    {pages.map((page, pageIdx) => (
                        <Card key={page.id} className="mb-3">
                            <Card.Body>
                                <Card.Title>
                                    <InputGroup>
                                        <Form.Control
                                            value={page.title}
                                            onChange={(e) =>
                                                updatePageTitle(
                                                    page,
                                                    pageIdx,
                                                    e.target.value
                                                )
                                            }
                                            onBlur={() =>
                                                handlePageBlur(page, pageIdx)
                                            }
                                        />
                                        <Button
                                            variant="outline-danger"
                                            onClick={() =>
                                                deletePageById(page.id)
                                            }
                                        >
                                            삭제
                                        </Button>
                                    </InputGroup>
                                </Card.Title>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="페이지 설명"
                                        value={page.description}
                                        onChange={(e) =>
                                            updatePageDescription(
                                                page.id,
                                                e.target.value
                                            )
                                        }
                                    />
                                </Form.Group>

                                {page.questions.map((q, qIdx) => (
                                    <div key={q.id} className="mb-2">
                                        <InputGroup className="mb-2">
                                            <Form.Control
                                                placeholder={`질문 ${qIdx + 1}`}
                                                value={q.text}
                                                onChange={(e) =>
                                                    updateQuestionText(
                                                        page.id,
                                                        q.id,
                                                        e.target.value
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleQuestionBlur(
                                                        page.id,
                                                        q.id,
                                                        qIdx
                                                    )
                                                }
                                                className="mb-2"
                                            />
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteQuestion(
                                                        page.id,
                                                        q.id
                                                    )
                                                }
                                            >
                                                삭제
                                            </Button>
                                        </InputGroup>

                                        {surveyType !== "short" &&
                                            q.options.map((opt, idx) => (
                                                <InputGroup
                                                    className="mb-2"
                                                    key={idx}
                                                >
                                                    <Form.Control
                                                        placeholder={`보기 ${
                                                            idx + 1
                                                        }`}
                                                        value={opt}
                                                        onChange={(e) =>
                                                            updateOptionText(
                                                                page.id,
                                                                q.id,
                                                                idx,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </InputGroup>
                                            ))}

                                        {surveyType !== "short" && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() =>
                                                    addOption(page.id, q.id)
                                                }
                                            >
                                                + 보기 추가
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => addQuestion(page.id)}
                                >
                                    질문 추가
                                </Button>
                            </Card.Body>
                        </Card>
                    ))}

                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={addPage}
                    >
                        + 페이지 추가
                    </Button>
                </div>

                <div style={{ flex: 1, position: "sticky", top: "80px" }}>
                    <Card
                        className="p-3"
                        style={{ backgroundColor: meta.bg_color }}
                    >
                        <h5>설문 정보</h5>
                        <Form.Group className="mb-2">
                            <Form.Label>설문 부제</Form.Label>
                            <Form.Control
                                type="text"
                                value={meta.subtitle}
                                onChange={(e) =>
                                    handleMetaChange("subtitle", e.target.value)
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>커버 이미지 URL</Form.Label>
                            <Form.Control
                                type="text"
                                value={meta.cover_image}
                                onChange={(e) =>
                                    handleMetaChange(
                                        "cover_image",
                                        e.target.value
                                    )
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>배경 색상</Form.Label>
                            <Form.Control
                                type="color"
                                value={meta.bg_color}
                                onChange={(e) =>
                                    handleMetaChange("bg_color", e.target.value)
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>폰트</Form.Label>
                            <Form.Control
                                type="text"
                                value={meta.font}
                                onChange={(e) =>
                                    handleMetaChange("font", e.target.value)
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>시작일</Form.Label>
                            <Form.Control
                                type="date"
                                value={meta.start_date?.slice(0, 10) || ""}
                                onChange={(e) =>
                                    handleMetaChange(
                                        "start_date",
                                        e.target.value
                                    )
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>종료일</Form.Label>
                            <Form.Control
                                type="date"
                                value={meta.end_date?.slice(0, 10) || ""}
                                onChange={(e) =>
                                    handleMetaChange("end_date", e.target.value)
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>최대 참여자 수</Form.Label>
                            <Form.Control
                                type="number"
                                value={meta.max_participants}
                                onChange={(e) =>
                                    handleMetaChange(
                                        "max_participants",
                                        Number(e.target.value)
                                    )
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="설문 공개"
                                checked={meta.is_public}
                                onChange={(e) =>
                                    handleMetaChange(
                                        "is_public",
                                        e.target.checked
                                    )
                                }
                            />
                        </Form.Group>
                    </Card>
                </div>
            </div>
        );
    }
);

export default SurveyEditorWithAPI;
