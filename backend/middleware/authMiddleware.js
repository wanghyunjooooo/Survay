const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ success: false, message: "토큰 필요" });

    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ success: false, message: "토큰 필요" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ success: false, message: "유효하지 않은 토큰" });
    }
};
