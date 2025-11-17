// SurveyEditorWithAPI.js
import React, { useState, useEffect } from "react";
import {
    Card,
    Form,
    Button,
    Row,
    Col,
    InputGroup,
    Tab,
    Nav,
} from "react-bootstrap";
import {
    getSurveyById,
    createSurvey,
    updateSurvey,
    getPages,
    createPage,
    updatePage,
    createQuestion,
    updateQuestionAPI,
} from "../api/api"; // API 경로 확인
import "bootstrap/dist/css/bootstrap.min.css";

const SurveyEditorWithAPI = ({ surveyId }) => {
    // 설문 기본 정보
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    // =====================
    // 초기 설문/페이지 로드
    // =====================
    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                if (surveyId === "new") {
                    // 새 설문이면 기본 페이지 1개 생성
                    const newPage = {
                        id: Date.now(),
                        title: "페이지 1",
                        description: "",
                        questions: [
                            { id: Date.now() + 1, text: "", options: [""] },
                        ],
                    };
                    setPages([newPage]);
                    setLoading(false);
                } else {
                    // 기존 설문 불러오기
                    const res = await getSurveyById(surveyId);
                    if (res.success) {
                        setTitle(res.survey.title);
                        setDescription(res.survey.description);
                        const pagesRes = await getPages(surveyId);
                        if (pagesRes.success) {
                            // pages에 questions 구조 맞춰 초기화
                            const formattedPages = pagesRes.pages.map((p) => ({
                                ...p,
                                questions: p.questions?.length
                                    ? p.questions
                                    : [
                                          {
                                              id: Date.now() + Math.random(),
                                              text: "",
                                              options: [""],
                                          },
                                      ],
                            }));
                            setPages(formattedPages);
                        }
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [surveyId]);

    // =====================
    // 페이지/질문/옵션 상태 업데이트
    // =====================
    const addPage = async () => {
        if (surveyId !== "new") {
            const res = await createPage(surveyId, {
                title: `페이지 ${pages.length + 1}`,
                order_index: pages.length + 1,
            });
            if (res.success) {
                setPages([
                    ...pages,
                    {
                        ...res.page,
                        description: "",
                        questions: [
                            { id: Date.now(), text: "", options: [""] },
                        ],
                    },
                ]);
            }
        } else {
            setPages([
                ...pages,
                {
                    id: Date.now(),
                    title: `페이지 ${pages.length + 1}`,
                    description: "",
                    questions: [
                        { id: Date.now() + 1, text: "", options: [""] },
                    ],
                },
            ]);
        }
    };

    const addQuestion = (pageId) => {
        setPages(
            pages.map((p) =>
                p.id === pageId
                    ? {
                          ...p,
                          questions: [
                              ...p.questions,
                              { id: Date.now(), text: "", options: [""] },
                          ],
                      }
                    : p
            )
        );
    };

    const addOption = (pageId, questionId) => {
        setPages(
            pages.map((p) =>
                p.id === pageId
                    ? {
                          ...p,
                          questions: p.questions.map((q) =>
                              q.id === questionId
                                  ? { ...q, options: [...q.options, ""] }
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
                              q.id === questionId ? { ...q, text: value } : q
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

    // =====================
    // 설문 저장
    // =====================
    const saveSurvey = async () => {
        try {
            const payload = { title, description, pages };
            let res;
            if (surveyId === "new") res = await createSurvey(payload);
            else res = await updateSurvey(surveyId, payload);

            if (res.success) alert("설문 저장 완료!");
            else alert("저장 실패: " + res.message);
        } catch (err) {
            console.error(err);
            alert("서버 오류");
        }
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="container py-5">
            <Row>
                {/* 왼쪽 설문 에디터 */}
                <Col md={8}>
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
                        <Card key={page.id} className="mb-4">
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
                                    <div key={q.id} className="mb-3">
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
                                        {q.options.map((opt, idx) => (
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
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() =>
                                                addOption(page.id, q.id)
                                            }
                                        >
                                            + 보기 추가
                                        </Button>
                                    </div>
                                ))}

                                <Row className="mt-3">
                                    <Col>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => addQuestion(page.id)}
                                        >
                                            + 질문 추가
                                        </Button>
                                    </Col>
                                    {pageIdx === pages.length - 1 && (
                                        <Col className="text-end">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={addPage}
                                            >
                                                + 페이지 추가
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}

                    <Button variant="primary" onClick={saveSurvey}>
                        설문 저장
                    </Button>
                </Col>

                {/* 오른쪽 탭 */}
                <Col md={4}>
                    <Tab.Container defaultActiveKey="toc">
                        <Nav variant="tabs" className="mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="toc">목차</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="design">꾸미기</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="settings">
                                    설문 설정
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="toc">
                                <h5>📄 페이지 목록</h5>
                                <ul>
                                    {pages.map((p, idx) => (
                                        <li key={p.id}>
                                            {idx + 1}. {p.title}
                                        </li>
                                    ))}
                                </ul>
                            </Tab.Pane>
                            <Tab.Pane eventKey="design">
                                <Form.Group className="mb-2">
                                    <Form.Label>글꼴</Form.Label>
                                    <Form.Select>
                                        <option>기본</option>
                                        <option>돋움</option>
                                        <option>바탕</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>배경색</Form.Label>
                                    <Form.Control type="color" />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>커버 이미지</Form.Label>
                                    <Form.Control type="file" />
                                </Form.Group>
                            </Tab.Pane>
                            <Tab.Pane eventKey="settings">
                                <Form.Group className="mb-2">
                                    <Form.Label>최대 참여 수</Form.Label>
                                    <Form.Control type="number" />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>결과 공개</Form.Label>
                                    <Form.Select>
                                        <option value="true">공개</option>
                                        <option value="false">비공개</option>
                                    </Form.Select>
                                </Form.Group>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Col>
            </Row>
        </div>
    );
};

export default SurveyEditorWithAPI;
