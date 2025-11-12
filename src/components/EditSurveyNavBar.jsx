import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function EditSurveyNavBar() {
    const navigate = useNavigate();

    const handlePreview = () => {
        // 미리보기 로직
        alert("미리보기 클릭");
    };

    const handleSaveDraft = () => {
        // 임시저장 로직
        alert("임시저장 클릭");
    };

    const handleSave = () => {
        // 최종 저장 로직
        alert("저장 클릭");
    };

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
                    <Button variant="outline-primary" onClick={handlePreview}>
                        미리보기
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={handleSaveDraft}
                    >
                        임시저장
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        저장
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
}

export default EditSurveyNavBar;
