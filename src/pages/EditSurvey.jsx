// src/pages/EditSurvey.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import EditSurveyNavBar from "../components/EditSurveyNavBar";
import SurveyEditorWithAPI from "../components/SurveyEditContent.jsx";
import SurveyResultsContent from "../components/SurveyResultsContent";
import SurveyPreviewResponsive from "../pages/SurveyPreview";
import { getSurveyById } from "../api/api.js";

function EditSurvey() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const realId = id ?? "new";

    // query에서 surveyType 받아오기
    const typeFromQuery = searchParams.get("type");

    const [activeTab, setActiveTab] = useState("edit");
    const [surveyData, setSurveyData] = useState(null);
    const [surveyType, setSurveyType] = useState(typeFromQuery || null);
    const [loading, setLoading] = useState(true);

    const [previewMode, setPreviewMode] = useState(false);
    const [previewTab, setPreviewTab] = useState("pc");

    const surveyRef = useRef();

    // 설문 불러오기
    useEffect(() => {
        const fetchSurvey = async () => {
            if (realId === "new") {
                setSurveyData(null);
                setSurveyType(typeFromQuery || "single"); // 새 설문이면 query값 또는 기본 single
                setLoading(false);
                return;
            }

            try {
                const res = await getSurveyById(realId);
                if (res.success && res.survey) {
                    setSurveyData(res.survey);
                    setSurveyType(typeFromQuery || res.survey.type || "single"); // query 우선
                } else {
                    alert(
                        "설문 불러오기 실패: " +
                            (res.message || "알 수 없는 오류")
                    );
                    setSurveyData(null);
                }
            } catch (err) {
                console.error("설문 상세 조회 오류:", err);
                alert("서버 오류로 설문을 불러올 수 없습니다.");
                setSurveyData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [realId, typeFromQuery]);

    // 저장
    const handleSave = async () => {
        if (!surveyRef.current) return;
        await surveyRef.current.saveSurvey();
    };

    const handleSaveDraft = () => alert("임시저장 클릭 - API 연결 필요");
    const handlePreview = () => setPreviewMode(true);

    if (loading) return <div className="container py-5">로딩 중...</div>;
    if (!surveyData && realId !== "new")
        return (
            <div className="container py-5">
                설문 정보를 불러올 수 없습니다.
            </div>
        );

    if (previewMode) {
        return (
            <div className="container py-4">
                <SurveyPreviewResponsive
                    surveyData={surveyData}
                    surveyType={surveyType}
                    device={previewTab}
                />
            </div>
        );
    }

    return (
        <>
            <EditSurveyNavBar
                onSave={handleSave}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "2rem",
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                    position: "sticky",
                    top: 70,
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
                className="container py-4"
                style={{ display: "flex", gap: "2rem" }}
            >
                {activeTab === "edit" ? (
                    <div style={{ flex: 1, marginTop: "20px" }}>
                        <SurveyEditorWithAPI
                            ref={surveyRef}
                            surveyId={realId}
                            surveyType={surveyType}
                            surveyData={surveyData}
                            onChange={(data) => setSurveyData(data)}
                        />
                    </div>
                ) : (
                    <SurveyResultsContent surveyId={realId} />
                )}
            </div>
        </>
    );
}

export default EditSurvey;
