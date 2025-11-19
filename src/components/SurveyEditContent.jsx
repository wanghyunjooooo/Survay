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
    getQuestionsByPage,
    createOption,
    updateOption,
    deleteOption,
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
        // 초기 설문/페이지 로드 + 질문/선택지 불러오기
        // =======================
        useEffect(() => {
            const fetchOrCreateSurvey = async () => {
                if (!surveyType) return;
                try {
                    let sid = currentSurveyId;

                    if (currentSurveyId === "new") {
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
                            setCurrentSurveyId(sid);

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
                                        ).map((q) => {
                                            const options =
                                                q.options?.map((o) => {
                                                    // ✅ JSON 파싱 후 title만 사용
                                                    let parsedText = "";
                                                    try {
                                                        parsedText =
                                                            JSON.parse(o.text)
                                                                ?.title ||
                                                            o.text;
                                                    } catch {
                                                        parsedText = o.text;
                                                    }
                                                    return {
                                                        id: o.option_id,
                                                        text: parsedText,
                                                    };
                                                }) || [];

                                            return {
                                                id: q.question_id,
                                                text: q.title,
                                                type: q.type,
                                                order_index: q.order_index ?? 0,
                                                options,
                                            };
                                        });

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
                                                                  : [
                                                                        {
                                                                            id: `temp-opt-${Date.now()}`,
                                                                            text: "",
                                                                        },
                                                                    ],
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
        // 상위 컴포넌트로 데이터 전달
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
        // 페이지/질문 CRUD
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
                                    options:
                                        surveyType === "short"
                                            ? []
                                            : [
                                                  {
                                                      id: `temp-opt-${Date.now()}`,
                                                      text: "",
                                                  },
                                              ],
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
            setPages((prev) =>
                prev.map((p) =>
                    p.id === page.id
                        ? { ...p, title: newTitle || "제목 없음" }
                        : p
                )
            );
        };

        const handlePageBlur = async (page, pageIdx) => {
            try {
                await updatePage(page.id, {
                    title: page.title || "제목 없음",
                    order_index: pageIdx ?? 0,
                });
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
            const tempQuestion = {
                id: `temp-${Date.now()}-${Math.random()}`,
                text: "새 질문",
                type: questionType,
                order_index: page.questions.length,
                options:
                    questionType === "short"
                        ? []
                        : [{ id: `temp-opt-${Date.now()}`, text: "" }],
                isTemp: true,
            };

            setPages((prev) =>
                prev.map((p) =>
                    p.id === pageId
                        ? { ...p, questions: [...p.questions, tempQuestion] }
                        : p
                )
            );

            try {
                const res = await createQuestion({
                    pageId,
                    title: tempQuestion.text,
                    type: questionType,
                    order_index: tempQuestion.order_index,
                });

                if (res?.success && res.question) {
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
                                                    options:
                                                        res.question.options?.map(
                                                            (o, idx) => {
                                                                let parsedText =
                                                                    "";
                                                                try {
                                                                    parsedText =
                                                                        JSON.parse(
                                                                            o.text
                                                                        )
                                                                            ?.title ||
                                                                        o.text;
                                                                } catch {
                                                                    parsedText =
                                                                        o.text;
                                                                }

                                                                // id 중복 방지: 서버 option_id가 없거나 중복될 경우 임시 id 생성
                                                                const safeId =
                                                                    o.option_id ||
                                                                    `temp-opt-${Date.now()}-${idx}`;

                                                                return {
                                                                    id: safeId,
                                                                    text: parsedText,
                                                                    order_index:
                                                                        o.order_index ??
                                                                        idx, // order_index 없으면 idx 사용
                                                                };
                                                            }
                                                        ) ||
                                                        [] ||
                                                        [],
                                                    isTemp: false,
                                                }
                                              : q
                                      ),
                                  }
                                : p
                        )
                    );
                } else {
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
            setPages((prev) =>
                prev.map((p) =>
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
            if (!question || question.isTemp) return;

            try {
                await updateQuestion(questionId, {
                    title: question.text || "제목 없음",
                    type:
                        question.type ||
                        (surveyType === "short" ? "short" : "single"),
                    order_index: question.order_index ?? qIdx ?? 0,
                });
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

        const addOption = async (pageId, questionId) => {
            const page = pages.find((p) => p.id === pageId);
            if (!page) return;

            const question = page.questions.find((q) => q.id === questionId);
            if (!question) return;

            const tempOption = { id: `temp-opt-${Date.now()}`, text: "" };
            setPages((prev) =>
                prev.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: p.questions.map((q) =>
                                  q.id === questionId
                                      ? {
                                            ...q,
                                            options: [
                                                ...(q.options || []),
                                                tempOption,
                                            ],
                                        }
                                      : q
                              ),
                          }
                        : p
                )
            );

            try {
                const res = await createOption({
                    questionId,
                    text: tempOption.text,
                    order_index: question.options ? question.options.length : 0,
                });

                if (res?.success && res.option) {
                    const newOption = {
                        id: res.option.option_id,
                        text: (() => {
                            try {
                                return (
                                    JSON.parse(res.option.text)?.title ||
                                    res.option.text
                                );
                            } catch {
                                return res.option.text;
                            }
                        })(),
                    };

                    setPages((prev) =>
                        prev.map((p) =>
                            p.id === pageId
                                ? {
                                      ...p,
                                      questions: p.questions.map((q) =>
                                          q.id === questionId
                                              ? {
                                                    ...q,
                                                    options: q.options.map(
                                                        (o) =>
                                                            o.id ===
                                                            tempOption.id
                                                                ? newOption
                                                                : o
                                                    ),
                                                }
                                              : q
                                      ),
                                  }
                                : p
                        )
                    );
                } else {
                    setPages((prev) =>
                        prev.map((p) =>
                            p.id === pageId
                                ? {
                                      ...p,
                                      questions: p.questions.map((q) => ({
                                          ...q,
                                          options:
                                              q.id === questionId
                                                  ? q.options.filter(
                                                        (o) =>
                                                            o.id !==
                                                            tempOption.id
                                                    )
                                                  : q.options,
                                      })),
                                  }
                                : p
                        )
                    );
                    alert("선택지 추가 실패");
                }
            } catch (err) {
                console.error("선택지 추가 오류:", err);
                setPages((prev) =>
                    prev.map((p) =>
                        p.id === pageId
                            ? {
                                  ...p,
                                  questions: p.questions.map((q) =>
                                      q.id === questionId
                                          ? {
                                                ...q,
                                                options: q.options.filter(
                                                    (o) =>
                                                        o.id !== tempOption.id
                                                ),
                                            }
                                          : q
                                  ),
                              }
                            : p
                    )
                );
                alert("선택지 추가 실패: 서버 오류");
            }
        };

        const updateOptionText = async (
            pageId,
            questionId,
            optionId,
            value
        ) => {
            setPages((prev) =>
                prev.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: p.questions.map((q) =>
                                  q.id === questionId
                                      ? {
                                            ...q,
                                            options: q.options.map((o) =>
                                                o.id === optionId
                                                    ? { ...o, text: value }
                                                    : o
                                            ),
                                        }
                                      : q
                              ),
                          }
                        : p
                )
            );

            if (optionId.toString().startsWith("temp-")) return;

            try {
                await updateOption(optionId, { title: value });
            } catch (err) {
                console.error("선택지 수정 오류:", err);
            }
        };

        const deleteOptionById = async (pageId, questionId, optionId) => {
            try {
                const res = await deleteOption(optionId);
                if (res?.success) {
                    setPages((prev) =>
                        prev.map((p) =>
                            p.id === pageId
                                ? {
                                      ...p,
                                      questions: p.questions.map((q) =>
                                          q.id === questionId
                                              ? {
                                                    ...q,
                                                    options: q.options.filter(
                                                        (o) => o.id !== optionId
                                                    ),
                                                }
                                              : q
                                      ),
                                  }
                                : p
                        )
                    );
                }
            } catch (err) {
                console.error("선택지 삭제 오류:", err);
            }
        };

        const updatePageDescription = (pageId, value) => {
            setPages((prev) =>
                prev.map((p) =>
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
                                                    key={opt.id}
                                                >
                                                    <Form.Control
                                                        placeholder={`보기 ${
                                                            idx + 1
                                                        }`}
                                                        value={opt.text}
                                                        onChange={(e) =>
                                                            updateOptionText(
                                                                page.id,
                                                                q.id,
                                                                opt.id,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            deleteOptionById(
                                                                page.id,
                                                                q.id,
                                                                opt.id
                                                            )
                                                        }
                                                    >
                                                        삭제
                                                    </Button>
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
