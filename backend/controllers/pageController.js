const pool = require("../config/db");

// 1) 페이지 추가
exports.createPage = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { title, order_index } = req.body;

        const result = await pool.query(
            `INSERT INTO pages (survey_id, title, order_index)
             VALUES ($1, $2, $3) RETURNING *`,
            [surveyId, title, order_index || 0]
        );

        res.status(201).json({ success: true, page: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "페이지 추가 실패" });
    }
};

// 2) 설문 내 페이지 리스트 조회
exports.getPagesBySurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;

        const result = await pool.query(
            `SELECT * FROM pages WHERE survey_id=$1 ORDER BY order_index`,
            [surveyId]
        );

        res.json({ success: true, pages: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "페이지 조회 실패" });
    }
};

// 3) 페이지 수정
exports.updatePage = async (req, res) => {
    try {
        const { pageId } = req.params;
        const fields = req.body;

        const setQuery = Object.keys(fields)
            .map((key, i) => `${key}=$${i + 1}`)
            .join(", ");
        const values = Object.values(fields);

        const result = await pool.query(
            `UPDATE pages SET ${setQuery} WHERE page_id=$${
                values.length + 1
            } RETURNING *`,
            [...values, pageId]
        );

        res.json({ success: true, page: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "페이지 수정 실패" });
    }
};

// 4) 페이지 삭제
exports.deletePage = async (req, res) => {
    try {
        const { pageId } = req.params;

        await pool.query(`DELETE FROM pages WHERE page_id=$1`, [pageId]);

        res.json({ success: true, message: "페이지 삭제 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "페이지 삭제 실패" });
    }
};

// 5) 페이지 순서 변경
exports.reorderPages = async (req, res) => {
    try {
        // [{ "page_id": "...", "order_index": 0 }, ...]
        const pages = req.body.pages;

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            for (const p of pages) {
                await client.query(
                    `UPDATE pages SET order_index=$1 WHERE page_id=$2`,
                    [p.order_index, p.page_id]
                );
            }
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }

        res.json({ success: true, message: "페이지 순서 변경 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "페이지 순서 변경 실패",
        });
    }
};
