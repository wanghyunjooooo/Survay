// src/pages/NewSurveyTypeSelect.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, LayoutList, FileText, ArrowLeft } from "lucide-react";

function NewSurveyTypeSelect() {
    const navigate = useNavigate();

    const handleSelect = (type) => {
        navigate(`/create-survey/${type}`);
    };

    const surveyTypes = [
        {
            type: "single",
            title: "객관식",
            description: "한 개 옵션만 선택할 수 있습니다.",
            color: "primary",
            icon: <CheckCircle size={40} />,
        },
        {
            type: "multiple",
            title: "객관식 (복수 선택)",
            description: "여러 옵션을 선택할 수 있습니다.",
            color: "info",
            icon: <LayoutList size={40} />,
        },
        {
            type: "short",
            title: "주관식",
            description: "자유롭게 작성할 수 있습니다.",
            color: "success",
            icon: <FileText size={40} />,
        },
    ];

    return (
        <div className="vh-100 d-flex flex-column">
            {/* 간단한 NavBar */}
            <nav className="navbar shadow-sm bg-white px-4">
                <div className="container-fluid d-flex align-items-center">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center"
                        onClick={() => navigate("/home")}
                    >
                        <ArrowLeft size={16} className="me-2" />
                        홈으로
                    </button>
                    <span className="navbar-brand mx-auto fw-bold">
                        설문 유형
                    </span>
                </div>
            </nav>

            {/* 설문 유형 선택 화면 */}
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <div className="text-center">
                    <div className="d-flex flex-column flex-md-row gap-4 justify-content-center">
                        {surveyTypes.map((survey) => (
                            <div
                                key={survey.type}
                                className="card text-center shadow-sm border-0"
                                style={{
                                    width: "220px",
                                    cursor: "pointer",
                                    transition:
                                        "transform 0.2s, box-shadow 0.2s",
                                }}
                                onClick={() => handleSelect(survey.type)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(-5px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 10px 20px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 6px rgba(0,0,0,0.1)";
                                }}
                            >
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div
                                        className={`mb-3 text-${survey.color}`}
                                    >
                                        {survey.icon}
                                    </div>
                                    <h5 className="fw-bold">{survey.title}</h5>
                                    <p className="text-muted small">
                                        {survey.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewSurveyTypeSelect;
