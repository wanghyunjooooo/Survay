import React, { useState } from "react";
import "../styles/Auth.css";
import { Eye, EyeOff } from "lucide-react";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [name, setName] = useState(""); // 이름
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLogin && password !== repeatPassword) {
            alert("Passwords do not match!");
            return;
        }
        alert(`${isLogin ? "Login" : "Sign Up"} Successful!`);
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <h1>Fast, Efficient and Productive</h1>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                </p>
            </div>

            <div className="auth-right">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2>{isLogin ? "Sign In" : "Sign Up"}</h2>

                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="password-input">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </span>
                    </div>

                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="Repeat Password"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            required
                        />
                    )}

                    {!isLogin && (
                        <div className="terms">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) =>
                                    setAcceptedTerms(e.target.checked)
                                }
                            />
                            <span>
                                I accept the <a href="/">Terms</a>
                            </span>
                        </div>
                    )}

                    <button type="submit" className="auth-submit">
                        {isLogin ? "Sign In" : "Sign Up"}
                    </button>

                    <p className="switch-auth">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}{" "}
                        <span onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? "Sign Up" : "Sign In"}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Auth;
