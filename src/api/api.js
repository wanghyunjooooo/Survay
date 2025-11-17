import axios from "axios";

// 서버 기본 URL
const baseURL = "http://localhost:8080";

// axios 인스턴스 생성
const api = axios.create({
    baseURL,
});

// 토큰 헤더 함수
const getAuthHeaders = () => {
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
        console.error(err);
        return { success: false, message: err.message };
    }
};

// 설문 상세 조회
export const getSurveyById = async (surveyId) => {
    try {
        const res = await api.get(`/api/surveys/${surveyId}`, {
            headers: getAuthHeaders(),
        });
        return res.data; // { success, survey, pages }
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
};

// 내 설문 리스트 조회
export const getMySurveys = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/surveys", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // { success, surveys: [] }
    } catch (err) {
        console.error(err);
        return { success: false, surveys: [], message: err.message };
    }
};
// 페이지 추가
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
        return res.data; // { success, pages: [] }
    } catch (err) {
        console.error("페이지 조회 오류:", err);
        return { success: false, pages: [], message: err.message };
    }
};

// 페이지 수정 (PUT)
export const updatePage = async (pageId, pageData) => {
    try {
        const res = await api.put(`/api/pages/${pageId}`, pageData, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (err) {
        console.error("페이지 수정 오류:", err);
        return { success: false };
    }
};

// 페이지 삭제 (DELETE)
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

// 페이지 순서 변경 (PATCH)
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

export default api;
