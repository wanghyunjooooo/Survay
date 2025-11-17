import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import EditSurveyNavBar from "../components/EditSurveyNavBar";
import SurveyEditContent from "../components/SurveyEditContent";
import SurveyResultsContent from "../components/SurveyResultsContent";
import { getSurveyById, createSurvey, updateSurvey } from "../api/api.js";

function EditSurvey() {
    const { id } = useParams(); // surveyId
    const [activeTab, setActiveTab] = useState("edit"); // "edit" 또는 "results"
    const [surveyData, setSurveyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const surveyRef = useRef();

    // 설문 불러오기
    useEffect(() => {
        const fetchSurvey = async () => {
            if (id === "new") {
                setSurveyData(null);
                setLoading(false);
                return;
            }

            try {
                const res = await getSurveyById(id);
                if (res.success) {
                    setSurveyData(res.survey);
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
    }, [id]);

    // =====================
    // 상단 버튼 핸들러
    // =====================
    const handleSave = async () => {
        if (!surveyRef.current) return;
        const payload = surveyRef.current.getSurveyData();

        try {
            let res;
            if (id === "new") {
                res = await createSurvey(payload);
            } else {
                res = await updateSurvey(id, payload);
            }

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

    const handleSaveDraft = () => {
        alert("임시저장 클릭 - API 연결 필요");
    };

    const handlePreview = () => {
        alert("미리보기 클릭 - 미리보기 기능 구현 필요");
    };

    if (loading) return <div className="container py-5">로딩 중...</div>;

    return (
        <>
            {/* 상단 NavBar */}
            <EditSurveyNavBar
                onSave={handleSave}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
            />

            {/* 탭 버튼 */}
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

            {/* 내용 */}
            <div className="container py-4">
                {activeTab === "edit" ? (
                    <SurveyEditContent
                        ref={surveyRef}
                        surveyId={id}
                        surveyData={surveyData}
                    />
                ) : (
                    <SurveyResultsContent surveyId={id} />
                )}
            </div>
        </>
    );
}

export default EditSurvey;
