import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

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

export default api;
