import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import {
    getSurveyById,
    createSurvey,
    updateSurvey,
    getPages,
    createPage,
} from "../api/api";

const SurveyEditorWithAPI = forwardRef(
    ({ surveyId, surveyType, onChange }, ref) => {
        const [title, setTitle] = useState("");
        const [description, setDescription] = useState("");
        const [pages, setPages] = useState([]);
        const [loading, setLoading] = useState(true);
        const [currentSurveyId, setCurrentSurveyId] = useState(surveyId);

        // =====================
        // 초기 설문/페이지 로드
        // =====================
        useEffect(() => {
            const fetchSurvey = async () => {
                if (surveyId === "new") {
                    const newPage = {
                        id: Date.now(),
                        title: "페이지 1",
                        description: "",
                        questions: [
                            {
                                id: Date.now() + 1,
                                text: "",
                                options: surveyType === "short" ? [] : [""],
                            },
                        ],
                    };
                    setPages([newPage]);
                    setLoading(false);
                } else {
                    try {
                        const res = await getSurveyById(surveyId);
                        if (res?.success) {
                            setTitle(res.survey?.title || "");
                            setDescription(res.survey?.description || "");
                            const pagesRes = await getPages(surveyId);
                            if (pagesRes?.success) {
                                const formattedPages = (
                                    pagesRes.pages || []
                                ).map((p, pageIdx) => ({
                                    id: p.id || Date.now() + pageIdx,
                                    title: p.title || `페이지 ${pageIdx + 1}`,
                                    description: p.description || "",
                                    questions:
                                        p.questions?.length > 0
                                            ? p.questions.map((q, qIdx) => ({
                                                  id:
                                                      q.id ||
                                                      Date.now() +
                                                          Math.random(),
                                                  text: q.text || "",
                                                  options:
                                                      surveyType === "short"
                                                          ? []
                                                          : q.options?.length
                                                          ? q.options
                                                          : [""],
                                              }))
                                            : [
                                                  {
                                                      id:
                                                          Date.now() +
                                                          Math.random(),
                                                      text: "",
                                                      options:
                                                          surveyType === "short"
                                                              ? []
                                                              : [""],
                                                  },
                                              ],
                                }));
                                setPages(formattedPages);
                            } else {
                                setPages([]);
                            }
                        } else {
                            setPages([]);
                        }
                    } catch (err) {
                        console.error(err);
                        setPages([]);
                    } finally {
                        setLoading(false);
                    }
                }
            };
            fetchSurvey();
        }, [surveyId, surveyType]);

        // =====================
        // 실시간 상위 데이터 전달
        // =====================
        useEffect(() => {
            if (onChange) {
                onChange({ title, description, pages, type: surveyType });
            }
        }, [title, description, pages, surveyType, onChange]);

        // =====================
        // ref 함수
        // =====================
        useImperativeHandle(ref, () => ({
            getSurveyData: () => ({ title, description, pages }),
            saveSurvey: async () => {
                try {
                    const payload = {
                        title,
                        description,
                        pages,
                        type: surveyType,
                    };
                    let res;
                    if (currentSurveyId === "new") {
                        // 새 설문 생성
                        res = await createSurvey(payload);
                        if (res?.success) {
                            const newId =
                                res.survey?.survey_id || res.survey?.id;
                            if (!newId) {
                                console.error(
                                    "설문 생성 응답에 ID가 없습니다:",
                                    res
                                );
                                alert("설문 생성 실패: 서버 응답 확인 필요");
                                return;
                            }
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

        // =====================
        // 페이지/질문/옵션 상태 업데이트
        // =====================
        const addPage = async () => {
            const newPageLocal = {
                id: Date.now(),
                title: `페이지 ${pages.length + 1}`,
                description: "",
                questions: [
                    {
                        id: Date.now() + 1,
                        text: "",
                        options: surveyType === "short" ? [] : [""],
                    },
                ],
            };

            setPages([...pages, newPageLocal]);

            // 서버에 이미 존재하는 설문만 페이지 API 호출
            if (currentSurveyId !== "new") {
                try {
                    const res = await createPage(currentSurveyId, {
                        title: newPageLocal.title,
                        description: newPageLocal.description,
                    });
                    if (res?.success && res.page) {
                        console.log("페이지 생성 완료:", res.page);
                    } else {
                        console.warn("페이지 생성 실패:", res?.message || "");
                    }
                } catch (err) {
                    console.error("페이지 생성 오류:", err);
                }
            }
        };

        const addQuestion = (pageId) => {
            setPages(
                pages.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: [
                                  ...(p.questions || []),
                                  {
                                      id: Date.now(),
                                      text: "",
                                      options:
                                          surveyType === "short" ? [] : [""],
                                  },
                              ],
                          }
                        : p
                )
            );
        };

        const addOption = (pageId, questionId) => {
            if (surveyType === "short") return;
            setPages(
                pages.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: (p.questions || []).map((q) =>
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

        const updateQuestionText = (pageId, questionId, value) => {
            setPages(
                pages.map((p) =>
                    p.id === pageId
                        ? {
                              ...p,
                              questions: (p.questions || []).map((q) =>
                                  q.id === questionId
                                      ? { ...q, text: value }
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
                              questions: (p.questions || []).map((q) =>
                                  q.id === questionId
                                      ? {
                                            ...q,
                                            options: (q.options || []).map(
                                                (o, i) =>
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
            <div>
                <Form.Group className="mb-3">
                    <Form.Control
                        placeholder="설문 제목"
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="설문 설명"
                        value={description || ""}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                {(pages || []).map((page, pageIdx) => (
                    <Card key={page.id || pageIdx} className="mb-3">
                        <Card.Body>
                            <Card.Title>
                                {page.title || `페이지 ${pageIdx + 1}`}
                            </Card.Title>
                            <Form.Group className="mb-2">
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="페이지 설명"
                                    value={page.description || ""}
                                    onChange={(e) =>
                                        updatePageDescription(
                                            page.id,
                                            e.target.value
                                        )
                                    }
                                />
                            </Form.Group>

                            {(page.questions || []).map((q, qIdx) => (
                                <div key={q.id || qIdx} className="mb-2">
                                    <Form.Control
                                        placeholder={`질문 ${qIdx + 1}`}
                                        value={q.text || ""}
                                        onChange={(e) =>
                                            updateQuestionText(
                                                page.id,
                                                q.id,
                                                e.target.value
                                            )
                                        }
                                        className="mb-2"
                                    />
                                    {surveyType !== "short" &&
                                        (q.options || []).map((opt, idx) => (
                                            <InputGroup
                                                className="mb-2"
                                                key={idx}
                                            >
                                                <Form.Control
                                                    placeholder={`보기 ${
                                                        idx + 1
                                                    }`}
                                                    value={opt || ""}
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

                <Button variant="outline-success" size="sm" onClick={addPage}>
                    + 페이지 추가
                </Button>
            </div>
        );
    }
);

export default SurveyEditorWithAPI;
