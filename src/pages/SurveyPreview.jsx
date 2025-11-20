// src/pages/SurveyPreview.jsx
import React from "react";
import { Container, Card, Form, Nav, Tab, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SurveyPreviewPage = ({
    surveyData,
    surveyType,
    surveyId,
    defaultDevice = "pc",
    onClose, // EditSurvey에서 전달받는 prop
}) => {
    const [activeDevice, setActiveDevice] = React.useState(defaultDevice);

    if (!surveyData)
        return <div className="container py-5">설문 데이터 없음</div>;

    const questionCardStyle = {
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        backgroundColor: "#f8f9fa",
        marginBottom: "15px",
    };

    const textInputStyle = {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-end mb-3">
                <Button
                    variant="secondary"
                    onClick={() => {
                        console.log("미리보기 종료 클릭됨");
                        if (onClose) onClose(); // EditSurvey에서 previewMode false로 변경
                    }}
                >
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
                    {/* PC */}
                    <Tab.Pane eventKey="pc">
                        {surveyData.pages.map((page, pageIdx) => (
                            <Card
                                key={page.id}
                                className="mb-4 shadow-sm"
                                style={{ borderRadius: "15px" }}
                            >
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
                                        <div
                                            key={q.id}
                                            style={questionCardStyle}
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
                                                    style={textInputStyle}
                                                />
                                            ) : (
                                                <Form.Group>
                                                    {q.options.map((opt) => (
                                                        <Form.Check
                                                            key={opt.id}
                                                            type={
                                                                surveyType ===
                                                                "single"
                                                                    ? "radio"
                                                                    : "checkbox"
                                                            }
                                                            label={
                                                                opt.text ||
                                                                "보기"
                                                            }
                                                            name={`q-${q.id}`}
                                                            disabled
                                                            className="mb-2 p-2 rounded"
                                                            style={{
                                                                backgroundColor:
                                                                    "#fff",
                                                                boxShadow:
                                                                    "0 1px 3px rgba(0,0,0,0.1)",
                                                                cursor: "default",
                                                            }}
                                                        />
                                                    ))}
                                                </Form.Group>
                                            )}
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        ))}
                    </Tab.Pane>

                    {/* 모바일 */}
                    <Tab.Pane eventKey="mobile">
                        {surveyData.pages.map((page, pageIdx) => (
                            <div
                                key={page.id}
                                className="mx-auto mb-4"
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
                                    <div key={q.id} style={questionCardStyle}>
                                        <p className="fw-bold mb-2">
                                            {qIdx + 1}. {q.text}
                                        </p>

                                        {surveyType === "short" ? (
                                            <Form.Control
                                                type="text"
                                                placeholder="답변을 입력하세요"
                                                readOnly
                                                className="mb-2"
                                                style={textInputStyle}
                                            />
                                        ) : (
                                            <Form.Group>
                                                {q.options.map((opt) => (
                                                    <Form.Check
                                                        key={opt.id}
                                                        type={
                                                            surveyType ===
                                                            "single"
                                                                ? "radio"
                                                                : "checkbox"
                                                        }
                                                        label={
                                                            opt.text || "보기"
                                                        }
                                                        name={`q-${q.id}`}
                                                        disabled
                                                        className="mb-2 p-2 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                "#fff",
                                                            boxShadow:
                                                                "0 1px 3px rgba(0,0,0,0.1)",
                                                            cursor: "default",
                                                        }}
                                                    />
                                                ))}
                                            </Form.Group>
                                        )}
                                    </div>
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
