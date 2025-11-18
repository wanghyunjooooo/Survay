import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Nav, Tab, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SurveyPreviewPage = ({
    surveyData,
    surveyType,
    defaultDevice = "pc",
}) => {
    const navigate = useNavigate();
    const [activeDevice, setActiveDevice] = React.useState(defaultDevice);

    if (!surveyData)
        return <div className="container py-5">설문 데이터 없음</div>;

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-end mb-3">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    미리보기 종료
                </Button>
            </div>

            <h2 className="mb-3 text-center">{surveyData.title}</h2>
            {surveyData.description && (
                <p className="text-muted mb-4 text-center">
                    {surveyData.description}
                </p>
            )}

            <Tab.Container activeKey={activeDevice}>
                <Nav variant="tabs" className="mb-4 justify-content-center">
                    <Nav.Item>
                        <Nav.Link
                            eventKey="pc"
                            onClick={() => setActiveDevice("pc")}
                        >
                            PC 버전
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="mobile"
                            onClick={() => setActiveDevice("mobile")}
                        >
                            모바일 버전
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="pc">
                        {surveyData.pages.map((page, pageIdx) => (
                            <Card key={page.id} className="mb-4 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="mb-3">
                                        <span className="badge bg-primary me-2">
                                            페이지 {pageIdx + 1}
                                        </span>
                                        {page.title}
                                    </Card.Title>
                                    {page.description && (
                                        <p className="text-muted">
                                            {page.description}
                                        </p>
                                    )}

                                    {page.questions.map((q, qIdx) => (
                                        <Card
                                            key={q.id}
                                            className="mb-3 p-3 border-0 shadow-sm"
                                        >
                                            <p className="fw-bold mb-2">
                                                {qIdx + 1}. {q.text}
                                            </p>
                                            {surveyType === "short" ? (
                                                <Form.Control
                                                    type="text"
                                                    placeholder="답변을 입력하세요"
                                                    readOnly
                                                    className="mb-2"
                                                />
                                            ) : (
                                                <Form.Group>
                                                    {q.options.map(
                                                        (opt, idx) => (
                                                            <Form.Check
                                                                key={idx}
                                                                type={
                                                                    surveyType ===
                                                                    "single"
                                                                        ? "radio"
                                                                        : "checkbox"
                                                                }
                                                                label={
                                                                    opt ||
                                                                    `보기 ${
                                                                        idx + 1
                                                                    }`
                                                                }
                                                                name={`q-${q.id}`}
                                                                disabled
                                                                className="mb-1"
                                                            />
                                                        )
                                                    )}
                                                </Form.Group>
                                            )}
                                        </Card>
                                    ))}
                                </Card.Body>
                            </Card>
                        ))}
                    </Tab.Pane>

                    <Tab.Pane eventKey="mobile">
                        {surveyData.pages.map((page, pageIdx) => (
                            <div
                                key={page.id}
                                className="mx-auto p-3 mb-4"
                                style={{
                                    width: "375px",
                                    border: "1px solid #ccc",
                                    borderRadius: "20px",
                                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                    padding: "20px",
                                    backgroundColor: "#fff",
                                }}
                            >
                                <h5 className="mb-3 text-center">
                                    페이지 {pageIdx + 1} - {page.title}
                                </h5>
                                {page.description && (
                                    <p className="text-muted">
                                        {page.description}
                                    </p>
                                )}
                                {page.questions.map((q, qIdx) => (
                                    <Card
                                        key={q.id}
                                        className="mb-3 p-3 border-0 shadow-sm"
                                    >
                                        <p className="fw-bold mb-2">
                                            {qIdx + 1}. {q.text}
                                        </p>
                                        {surveyType === "short" ? (
                                            <Form.Control
                                                type="text"
                                                placeholder="답변을 입력하세요"
                                                readOnly
                                                className="mb-2"
                                            />
                                        ) : (
                                            <Form.Group>
                                                {q.options.map((opt, idx) => (
                                                    <Form.Check
                                                        key={idx}
                                                        type={
                                                            surveyType ===
                                                            "single"
                                                                ? "radio"
                                                                : "checkbox"
                                                        }
                                                        label={
                                                            opt ||
                                                            `보기 ${idx + 1}`
                                                        }
                                                        name={`q-${q.id}`}
                                                        disabled
                                                        className="mb-1"
                                                    />
                                                ))}
                                            </Form.Group>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

export default SurveyPreviewPage;
