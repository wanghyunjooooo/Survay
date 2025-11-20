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

    // query에서 surveyType과 탭 받아오기
    const typeFromQuery = searchParams.get("type"); // 전페이지에서 선택한 타입 (single/multiple/short)
    const tabFromQuery = searchParams.get("tab"); // "results" 읽기

    const [activeTab, setActiveTab] = useState(tabFromQuery || "edit");
    const [surveyData, setSurveyData] = useState(null);

    // surveyType: 가능한 경우 전페이지 선택(typeFromQuery)을 우선 사용.
    // null이면 SurveyEditor 또는 유저가 명시적으로 정하도록 둡니다.
    const [surveyType, setSurveyType] = useState(typeFromQuery ?? null);

    const [loading, setLoading] = useState(true);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewTab, setPreviewTab] = useState("pc");

    const surveyRef = useRef();

    // meta 상태 추가
    const [meta, setMeta] = useState({
        subtitle: "",
        cover_image: "",
        bg_color: "#ffffff",
        font: "",
        start_date: "",
        end_date: "",
        max_participants: 0,
        is_public: false,
    });
    const [preview, setPreview] = useState(null);

    const handleMetaChange = (key, value) => {
        setMeta((prev) => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            handleMetaChange("cover_image", reader.result); // base64 저장
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // 설문 불러오기
    useEffect(() => {
        const fetchSurvey = async () => {
            // 새로운 설문인 경우: 전페이지에서 타입 지정했으면 사용, 없으면 null(편집 화면에서 선택)
            if (realId === "new") {
                setSurveyData(null);
                // 이미 typeFromQuery가 있으면 유지, 없으면 null으로 두어 Editor에서 기본 처리하게 함
                setSurveyType(typeFromQuery ?? null);
                setLoading(false);
                return;
            }

            try {
                const res = await getSurveyById(realId);
                if (res.success && res.survey) {
                    setSurveyData(res.survey);

                    /**
                     * 핵심: typeFromQuery가 있으면 그것을 우선으로 사용.
                     * 그렇지 않으면 res.survey.type이 명확히 존재할 때만 사용.
                     * (undefined이면 null로 두어 하위 컴포넌트가 기본값을 정하도록 함)
                     */
                    const resolvedType =
                        typeFromQuery ?? res.survey.type ?? null;
                    setSurveyType(resolvedType);

                    // meta 기본값 초기화
                    setMeta({
                        subtitle: res.survey.subtitle || "",
                        cover_image: res.survey.cover_image || "",
                        bg_color: res.survey.bg_color || "#ffffff",
                        font: res.survey.font || "",
                        start_date: res.survey.start_date || "",
                        end_date: res.survey.end_date || "",
                        max_participants: res.survey.max_participants || 0,
                        is_public: res.survey.is_public || false,
                    });
                    setPreview(res.survey.cover_image || null);
                } else {
                    alert(
                        "설문 불러오기 실패: " +
                            (res.message || "알 수 없는 오류")
                    );
                    setSurveyData(null);
                    // surveyType는 typeFromQuery가 있으면 유지, 없으면 null
                    setSurveyType(typeFromQuery ?? null);
                }
            } catch (err) {
                console.error("설문 상세 조회 오류:", err);
                alert("서버 오류로 설문을 불러올 수 없습니다.");
                setSurveyData(null);
                setSurveyType(typeFromQuery ?? null);
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
        // realId와 typeFromQuery가 바뀌면 재실행
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
                    surveyId={realId}
                    onClose={() => setPreviewMode(false)}
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
                            // 하위 컴포넌트가 필요하면 surveyType을 바꿀 수 있게 setter 전달
                            setSurveyType={setSurveyType}
                            surveyData={surveyData}
                            onChange={(data) => setSurveyData(data)}
                            meta={meta}
                            handleMetaChange={handleMetaChange}
                            preview={preview}
                            handleFileChange={handleFileChange}
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
