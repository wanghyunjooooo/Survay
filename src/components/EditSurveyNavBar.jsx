import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// onSave, onSaveDraft, onPreview를 props로 받아 상위에서 처리
function EditSurveyNavBar({ onPreview, onSaveDraft, onSave }) {
    const navigate = useNavigate();

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
            <Container className="d-flex justify-content-between">
                {/* 왼쪽 로고 */}
                <Navbar.Brand
                    style={{
                        color: "#0047F9",
                        fontWeight: "700",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/home")}
                >
                    SurveyApp
                </Navbar.Brand>

                {/* 오른쪽 버튼들 */}
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={onPreview}>
                        미리보기
                    </Button>
                    <Button variant="primary" onClick={onSave}>
                        임시저장
                    </Button>
                    <Button variant="primary" onClick={onSave}>
                        저장
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
}

export default EditSurveyNavBar;
