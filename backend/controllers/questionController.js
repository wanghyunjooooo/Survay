const pool = require("../config/db");

// 1) 질문 추가
exports.createQuestion = async (req, res) => {
    try {
        const { pageId, title, type, order_index } = req.body;

        if (!pageId || !title || !type) {
            return res.status(400).json({
                success: false,
                message: "pageId, title, type 필수",
            });
        }

        const result = await pool.query(
            `INSERT INTO questions (page_id, title, type, order_index)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [pageId, title, type, order_index || 0]
        );

        res.status(201).json({ success: true, question: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "질문 추가 실패" });
    }
};

// 2) 페이지 내 질문 리스트 조회
exports.getQuestionsByPage = async (req, res) => {
    try {
        const { pageId } = req.params;
        const result = await pool.query(
            `SELECT * FROM questions WHERE page_id=$1 ORDER BY order_index`,
            [pageId]
        );
        res.json({ success: true, questions: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "질문 조회 실패" });
    }
};

// 3) 질문 수정
exports.updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const fields = req.body;

        const setQuery = Object.keys(fields)
            .map((key, i) => `${key}=$${i + 1}`)
            .join(", ");
        const values = Object.values(fields);

        const result = await pool.query(
            `UPDATE questions SET ${setQuery} WHERE question_id=$${
                values.length + 1
            } RETURNING *`,
            [...values, questionId]
        );

        res.json({ success: true, question: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "질문 수정 실패" });
    }
};

// 4) 질문 삭제
exports.deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        await pool.query(`DELETE FROM questions WHERE question_id=$1`, [
            questionId,
        ]);
        res.json({ success: true, message: "질문 삭제 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "질문 삭제 실패" });
    }
};

// 5) 질문 순서 변경
exports.reorderQuestions = async (req, res) => {
    try {
        const { questions } = req.body; // [{question_id, order_index}, ...]

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            for (const q of questions) {
                await client.query(
                    `UPDATE questions SET order_index=$1 WHERE question_id=$2`,
                    [q.order_index, q.question_id]
                );
            }
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }

        res.json({ success: true, message: "질문 순서 변경 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "질문 순서 변경 실패",
        });
    }
};
