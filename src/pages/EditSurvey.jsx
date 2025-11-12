import React, { useState } from "react";
import { useParams } from "react-router-dom";
import EditSurveyNavBar from "../components/EditSurveyNavBar";
import SurveyEditContent from "../components/SurveyEditContent";
import SurveyResultsContent from "../components/SurveyResultsContent";

function EditSurvey() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("edit"); // "edit" 또는 "results"

    return (
        <>
            {/* 상단 NavBar */}
            <EditSurveyNavBar />

            {/* 항상 보이는 탭 버튼 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "2rem",
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                    position: "sticky",
                    top: 70, // NavBar 높이만큼 내려줌
                    zIndex: 1000,
                    padding: "1rem 0",
                }}
            >
                <button
                    onClick={() => setActiveTab("edit")}
                    style={{
                        border: "none",
                        background: "none",
                        fontWeight: activeTab === "edit" ? 600 : 400,
                        color: activeTab === "edit" ? "#0047F9" : "#6c757d",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                    }}
                >
                    설문 편집
                </button>
                <button
                    onClick={() => setActiveTab("results")}
                    style={{
                        border: "none",
                        background: "none",
                        fontWeight: activeTab === "results" ? 600 : 400,
                        color: activeTab === "results" ? "#0047F9" : "#6c757d",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                    }}
                >
                    설문 결과
                </button>
            </div>
            <div
                className="edit-survey-wrapper"
                style={{
                    paddingTop: "30px", // NavBar(70) + TabBar(60)
                }}
            ></div>
            {/* 내용 영역 */}
            <div className="container py-4">
                {activeTab === "edit" ? (
                    <SurveyEditContent surveyId={id} />
                ) : (
                    <SurveyResultsContent surveyId={id} />
                )}
            </div>
        </>
    );
}

export default EditSurvey;
