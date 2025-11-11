import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const signup = async (data) => {
    return axios.post(`${API_URL}/auth/signup`, data);
};

export const login = async (data) => {
    return axios.post(`${API_URL}/auth/login`, data);
};
