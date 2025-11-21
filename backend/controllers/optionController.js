// controllers/optionController.js
const pool = require("../config/db");

// ================================
// 1) 선택지 추가
// ================================
exports.createOption = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { text, order_index } = req.body;

        const result = await pool.query(
            `INSERT INTO options (question_id, text, order_index)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [questionId, text, order_index || 0]
        );

        res.status(201).json({
            success: true,
            option: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "선택지 생성 실패",
        });
    }
};

// ================================
// 2) 선택지 수정
// ================================
exports.updateOption = async (req, res) => {
    try {
        const { optionId } = req.params;
        const fields = req.body;

        const setQuery = Object.keys(fields)
            .map((key, i) => `${key}=$${i + 1}`)
            .join(", ");

        const values = Object.values(fields);

        const result = await pool.query(
            `UPDATE options SET ${setQuery}
             WHERE option_id=$${values.length + 1}
             RETURNING *`,
            [...values, optionId]
        );

        res.json({
            success: true,
            option: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "선택지 수정 실패",
        });
    }
};

// ================================
// 3) 선택지 삭제
// ================================
exports.deleteOption = async (req, res) => {
    try {
        const { optionId } = req.params;

        await pool.query(`DELETE FROM options WHERE option_id=$1`, [optionId]);

        res.json({
            success: true,
            message: "선택지 삭제 완료",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "선택지 삭제 실패",
        });
    }
};

// ================================
// 4) 선택지 순서 변경
// ================================
exports.reorderOptions = async (req, res) => {
    try {
        const { options } = req.body; // [{option_id, order_index}]

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            for (const o of options) {
                await client.query(
                    `UPDATE options SET order_index=$1
                     WHERE option_id=$2`,
                    [o.order_index, o.option_id]
                );
            }

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }

        res.json({
            success: true,
            message: "선택지 순서 변경 완료",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "선택지 순서 변경 실패",
        });
    }
};

// ================================
// 5) 질문별 선택지 조회
// ================================
exports.getOptionsByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const result = await pool.query(
            `SELECT option_id, text, order_index 
             FROM options 
             WHERE question_id = $1 
             ORDER BY order_index ASC`,
            [questionId]
        );

        res.json({
            success: true,
            options: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "질문별 선택지 조회 실패",
        });
    }
};
