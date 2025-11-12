import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Auth.css";
import { Eye, EyeOff } from "lucide-react";
import { registerUser, loginUser } from "../api/api.js";
import { useNavigate } from "react-router-dom"; // ✅ 추가

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // ✅ 네비게이터 생성

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && password !== repeatPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            setLoading(true);

            if (isLogin) {
                // 🔹 로그인 요청
                const res = await loginUser({ email, password });
                localStorage.setItem("token", res.token);
                localStorage.setItem("user", JSON.stringify(res.user));
                alert(`${res.user.name}님, 로그인 성공!`);
                console.log("로그인 성공:", res);

                // ✅ 로그인 성공 시 홈으로 이동
                navigate("/home");
            } else {
                // 🔹 회원가입 요청
                const res = await registerUser({ email, password, name });
                alert(`${res.message} (${res.user.name})`);
                console.log("회원가입 성공:", res);
                setIsLogin(true);
            }
        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page d-flex align-items-center justify-content-center vh-100">
            <div className="auth-card shadow-lg p-5 rounded-4 bg-white">
                <h3 className="text-center mb-4 fw-bold text-primary">
                    {isLogin ? "로그인" : "회원가입"}
                </h3>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-3">
                            <label className="form-label">이름</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="이름을 입력하세요"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label">이메일</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3 position-relative">
                        <label className="form-label">비밀번호</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control pe-5"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </span>
                    </div>

                    {!isLogin && (
                        <div className="mb-3">
                            <label className="form-label">비밀번호 확인</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="비밀번호를 다시 입력하세요"
                                value={repeatPassword}
                                onChange={(e) =>
                                    setRepeatPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 mb-3 fw-semibold"
                        disabled={loading}
                    >
                        {loading
                            ? "처리 중..."
                            : isLogin
                            ? "로그인"
                            : "회원가입"}
                    </button>
                </form>

                <p className="text-center mb-0 text-muted">
                    {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
                    <span
                        className="text-primary fw-semibold switch-btn"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "회원가입" : "로그인"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Auth;
