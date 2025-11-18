import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import EditSurveyNavBar from "../components/EditSurveyNavBar";
import SurveyEditorWithAPI from "../components/SurveyEditContent.jsx";
import SurveyResultsContent from "../components/SurveyResultsContent";
import SurveyPreviewResponsive from "../pages/SurveyPreview";
import SideTabs from "../components/SideTabs"; // 추가
import { getSurveyById, createSurvey, updateSurvey } from "../api/api.js";

function EditSurvey() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const realId = id ?? "new";
    const typeFromQuery = searchParams.get("type");

    const [activeTab, setActiveTab] = useState("edit");
    const [surveyData, setSurveyData] = useState(null);
    const [surveyType, setSurveyType] = useState(typeFromQuery || null);
    const [loading, setLoading] = useState(true);

    const [previewMode, setPreviewMode] = useState(false);
    const [previewTab, setPreviewTab] = useState("pc");

    const surveyRef = useRef();

    useEffect(() => {
        const fetchSurvey = async () => {
            if (realId === "new") {
                setSurveyData(null);
                setSurveyType(typeFromQuery);
                setLoading(false);
                return;
            }

            try {
                const res = await getSurveyById(realId);
                if (res.success) {
                    setSurveyData(res.survey);
                    setSurveyType(res.survey.type);
                } else {
                    alert("설문 불러오기 실패: " + res.message);
                }
            } catch (err) {
                console.error(err);
                alert("서버 오류 발생");
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [realId, typeFromQuery]);

    const handleSave = async () => {
        if (!surveyRef.current) return;

        const payload = surveyRef.current.getSurveyData();
        payload.type = surveyType;

        try {
            let res;
            if (realId === "new") res = await createSurvey(payload);
            else res = await updateSurvey(realId, payload);

            if (res.success) {
                alert("설문이 성공적으로 저장되었습니다!");
                setSurveyData(res.survey);
            } else {
                alert("설문 저장 실패: " + res.message);
            }
        } catch (err) {
            console.error(err);
            alert("서버 에러 발생");
        }
    };

    const handleSaveDraft = () => alert("임시저장 클릭 - API 연결 필요");

    const handlePreview = () => setPreviewMode(true);

    if (loading) return <div className="container py-5">로딩 중...</div>;

    if (previewMode) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3"></div>
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

            {/* 2단 레이아웃: 좌측 편집 / 우측 사이드 탭 */}
            <div
                className="container py-4"
                style={{ display: "flex", gap: "2rem" }}
            >
                {activeTab === "edit" ? (
                    <>
                        <div style={{ flex: 3, marginTop: "90px" }}>
                            <SurveyEditorWithAPI
                                ref={surveyRef}
                                surveyId={realId}
                                surveyType={surveyType}
                                onChange={(data) => setSurveyData(data)} // data = { title, description, pages }
                            />
                        </div>
                        <div style={{ flex: 1, marginTop: "50px" }}>
                            <SideTabs pages={surveyData?.pages || []} />
                        </div>
                    </>
                ) : (
                    <SurveyResultsContent surveyId={realId} />
                )}
            </div>
        </>
    );
}

export default EditSurvey;
