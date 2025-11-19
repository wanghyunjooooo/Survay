// src/api/api.js
import axios from "axios";

// 서버 기본 URL
const baseURL = "http://localhost:8080";

// axios 인스턴스 생성
const api = axios.create({ baseURL });

// ============================
// 인증 헤더
// ============================
export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================
// 회원 관련 API
// ============================

// 회원가입
export const registerUser = async (data) => {
    const res = await api.post("/api/auth/register", data);
    return res.data;
};

// 로그인
export const loginUser = async (data) => {
    const res = await api.post("/api/auth/login", data);
    return res.data;
};

// ============================
// 설문 관련 API
// ============================

// 설문 생성
export const createSurvey = async (surveyData) => {
    const res = await api.post("/api/surveys", surveyData, {
        headers: getAuthHeaders(),
    });
    return res.data;
};

// 설문 수정
export const updateSurvey = async (surveyId, surveyData) => {
    try {
        const res = await api.put(`/api/surveys/${surveyId}`, surveyData, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("설문 수정 오류:", err);
        return { success: false, message: err.message };
    }
};

// 설문 상세 조회 (ID로)
export const getSurveyById = async (surveyId) => {
    try {
        const res = await api.get(`/api/surveys/${surveyId}`, {
            headers: getAuthHeaders(),
        });
        return res.data; // { success, survey, pages }
    } catch (err) {
        console.error("설문 조회 오류:", err);
        return { success: false, message: err.message };
    }
};

// 내 설문 리스트 조회
export const getMySurveys = async () => {
    try {
        const res = await api.get("/api/surveys", {
            headers: getAuthHeaders(),
        });
        return res.data; // { success, surveys: [] }
    } catch (err) {
        console.error("내 설문 조회 오류:", err);
        return { success: false, surveys: [], message: err.message };
    }
};
export const deleteSurvey = async (surveyId) => {
    const token = localStorage.getItem("token"); // 로그인 시 저장한 JWT
    return axios
        .delete(`${baseURL}/api/surveys/${surveyId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // 헤더에 토큰 추가
            },
        })
        .then((res) => res.data)
        .catch((err) => {
            console.error(err);
            return { success: false, message: err.message };
        });
};
// ============================
// 페이지 관련 API
// ============================

// 페이지 생성
export const createPage = async (surveyId, pageData) => {
    try {
        const res = await api.post(`/api/surveys/${surveyId}/pages`, pageData, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("페이지 생성 오류:", err);
        return { success: false, message: err.message };
    }
};

// 페이지 목록 조회
export const getPages = async (surveyId) => {
    try {
        const res = await api.get(`/api/surveys/${surveyId}/pages`, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("페이지 조회 오류:", err);
        return { success: false, pages: [], message: err.message };
    }
};

// 페이지 수정
export const updatePage = async (pageId, pageData) => {
    console.log("updatePage 호출", pageId, pageData, getAuthHeaders());
    try {
        const res = await api.put(`/api/pages/${pageId}`, pageData, {
            headers: getAuthHeaders(),
        });
        console.log("updatePage 성공 응답:", res.data);
        return res.data;
    } catch (err) {
        console.error("페이지 수정 오류:", err.response?.data || err);
        return { success: false };
    }
};

// 페이지 삭제
export const deletePage = async (pageId) => {
    try {
        const res = await api.delete(`/api/pages/${pageId}`, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("페이지 삭제 오류:", err);
        return { success: false };
    }
};

// 페이지 순서 변경
export const reorderPages = async (surveyId, orderedPageIds) => {
    try {
        const res = await api.patch(
            `/api/pages/reorder/${surveyId}`,
            { orderedPageIds },
            { headers: getAuthHeaders() }
        );
        return res.data;
    } catch (err) {
        console.error("페이지 순서 변경 오류:", err);
        return { success: false };
    }
};

// ============================
// 질문 관련 API
// ============================

// ================================
// 질문 생성
// ================================
export const createQuestion = async (questionData) => {
    try {
        const res = await api.post(`/api/questions`, questionData, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("질문 생성 오류:", err);
        return { success: false, message: err.message };
    }
};

// ================================
// 질문 수정 (updateQuestion 이름으로 통일)
// ================================
export const updateQuestion = async (questionId, questionData) => {
    try {
        const res = await api.put(
            `/api/questions/${questionId}/edit`, // /edit 추가
            questionData,
            {
                headers: getAuthHeaders(),
            }
        );
        console.log(
            `[updateQuestion] 성공! questionId: ${questionId}`,
            res.data
        );
        return res.data;
    } catch (err) {
        console.error(
            `[updateQuestion] 실패! questionId: ${questionId}`,
            err.response?.data || err.message
        );
        return { success: false, message: err.message };
    }
};

// ================================
// 질문 삭제 (deleteQuestion 이름으로 통일)
// ================================
export const deleteQuestion = async (questionId) => {
    try {
        const res = await api.delete(`/api/questions/${questionId}`, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("질문 삭제 오류:", err);
        return { success: false };
    }
};

// ============================
// 설문 응답 관련 API
// ============================

// 설문 응답 제출
export const submitSurveyResponse = async (surveyId, answers = []) => {
    try {
        const res = await api.post(
            `/api/surveys/${surveyId}/responses`,
            { answers },
            { headers: getAuthHeaders() } // ← 여기 추가
        );
        return res.data;
    } catch (err) {
        console.error("응답 제출 오류:", err);
        return {
            success: false,
            message: "응답 제출 실패",
            error: err.message,
        };
    }
};

// ============================
// 설문 공유 API
// ============================

// 공유 링크 생성 / 이메일 공유
export const createShare = async (surveyId, emails = []) => {
    try {
        const res = await api.post(
            `/api/surveys/${surveyId}/share`,
            { emails },
            { headers: getAuthHeaders() }
        );
        return res.data;
    } catch (err) {
        console.error(
            "공유 링크 생성 오류:",
            err.response?.data || err.message
        );
        return {
            success: false,
            message: err.response?.data?.message || err.message,
        };
    }
};

// 공유 링크로 설문 조회
export const getSurveyByShareLink = async (shareLink) => {
    try {
        const res = await api.get(`/api/surveys/share/${shareLink}`, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("공유 설문 조회 오류:", err);
        return { success: false, message: err.message };
    }
};

export default api;
