// src/components/SurveyEditorWithAPI.jsx
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
} from "../api/api";

const SurveyEditorWithAPI = forwardRef(
    ({ surveyId, surveyType, onChange }, ref) => {
        const [title, setTitle] = useState("");
        const [description, setDescription] = useState("");
        const [pages, setPages] = useState([]);
        const [loading, setLoading] = useState(true);
        const [currentSurveyId, setCurrentSurveyId] = useState(surveyId);

        // =======================
        // meta 상태
        // =======================
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

        const handleMetaChange = (key, value) => {
            setMeta((prev) => ({ ...prev, [key]: value }));
        };

        // =======================
        // 초기 설문/페이지 로드
        // =======================
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
                    return;
                }

                try {
                    const res = await getSurveyById(surveyId);
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

                        const pagesRes = await getPages(surveyId);
                        if (pagesRes?.success) {
                            const formattedPages = (pagesRes.pages || []).map(
                                (p, pageIdx) => ({
                                    id: p.id || Date.now() + pageIdx,
                                    title: p.title || `페이지 ${pageIdx + 1}`,
                                    description: p.description || "",
                                    questions:
                                        p.questions?.length > 0
                                            ? p.questions.map((q) => ({
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
                                })
                            );
                            setPages(formattedPages);
                        } else setPages([]);
                    } else setPages([]);
                } catch (err) {
                    console.error(err);
                    setPages([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchSurvey();
        }, [surveyId, surveyType]);

        // =======================
        // 상위 컴포넌트 실시간 데이터 전달
        // =======================
        useEffect(() => {
            onChange?.({ title, description, pages, type: surveyType, meta });
        }, [title, description, pages, surveyType, meta, onChange]);

        // =======================
        // ref 함수
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
        // 페이지/질문/옵션 함수
        // =======================
        const addPage = () => {
            const localId = Date.now();
            const newPage = {
                id: localId,
                title: `페이지 ${pages.length + 1}`,
                description: "",
                questions: [
                    {
                        id: localId + 1,
                        text: "질문 입력",
                        options: surveyType === "short" ? [] : [""],
                    },
                ],
            };
            setPages([...pages, newPage]);
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
                                      text: "질문 입력",
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

        // =======================
        // 2단 레이아웃: 왼쪽 편집 / 오른쪽 사이드바
        // =======================
        return (
            <div style={{ display: "flex", gap: "2rem", marginTop: "50px" }}>
                {/* 왼쪽: 설문 편집 영역 */}
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
                                <Card.Title>{page.title}</Card.Title>
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
                                            className="mb-2"
                                        />
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

                {/* 오른쪽: Meta 관리 사이드바 */}
                <div style={{ flex: 1, position: "sticky", top: "80px" }}>
                    <Card
                        className="p-3"
                        style={{ backgroundColor: meta.bg_color }}
                    >
                        <h5>설문 정보</h5>
                        <Form.Group className="mb-2">
                            <Form.Label>설문 제목</Form.Label>
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
