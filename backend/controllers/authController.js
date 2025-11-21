const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ---------------------
// 1) 회원가입
// ---------------------
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 이메일 중복 확인
        const exists = await pool.query(`SELECT * FROM users WHERE email=$1`, [
            email,
        ]);
        if (exists.rows.length > 0) {
            return res
                .status(400)
                .json({ success: false, message: "이미 존재하는 이메일" });
        }

        // 비밀번호 해시
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (email, password, name) VALUES ($1,$2,$3) RETURNING user_id, email, name, created_at`,
            [email, hashedPassword, name]
        );

        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "회원가입 실패" });
    }
};

// ---------------------
// 2) 로그인
// ---------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userRes = await pool.query(`SELECT * FROM users WHERE email=$1`, [
            email,
        ]);
        if (userRes.rows.length === 0)
            return res
                .status(400)
                .json({ success: false, message: "사용자 없음" });

        const user = userRes.rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res
                .status(400)
                .json({ success: false, message: "비밀번호 틀림" });

        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "로그인 실패" });
    }
};

// ---------------------
// 3) 로그아웃
// ---------------------
exports.logout = async (req, res) => {
    // JWT는 stateless이므로 클라이언트에서 토큰 삭제만 하면 됩니다.
    res.json({ success: true, message: "로그아웃 완료" });
};

// ---------------------
// 4) 내 정보 조회
// ---------------------
exports.getMe = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const userRes = await pool.query(
            `SELECT user_id, email, name, created_at FROM users WHERE user_id=$1`,
            [user_id]
        );

        if (userRes.rows.length === 0)
            return res
                .status(404)
                .json({ success: false, message: "사용자 없음" });

        res.json({ success: true, user: userRes.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "사용자 조회 실패" });
    }
};
