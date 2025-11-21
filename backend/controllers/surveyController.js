const pool = require("../config/db");

module.exports = {
    // ================================
    // 1) 설문 생성
    // ================================
    createSurvey: async (req, res) => {
        try {
            const {
                title,
                subtitle,
                description,
                cover_image,
                bg_color,
                font,
                start_date,
                end_date,
                max_participants,
                is_public,
            } = req.body;
            const user_id = req.user.user_id;

            const result = await pool.query(
                `INSERT INTO surveys (
                    user_id, title, subtitle, description, cover_image,
                    bg_color, font, start_date, end_date,
                    max_participants, is_public
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                RETURNING *;`,
                [
                    user_id,
                    title,
                    subtitle,
                    description,
                    cover_image,
                    bg_color,
                    font,
                    start_date,
                    end_date,
                    max_participants,
                    is_public,
                ]
            );

            res.status(201).json({ success: true, survey: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "설문 생성 실패" });
        }
    },

    // ================================
    // 2) 내 설문 리스트 조회
    // ================================
    getMySurveys: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const result = await pool.query(
                `SELECT s.*, COALESCE(v.question_count,0) AS question_count
                 FROM surveys s
                 LEFT JOIN vw_survey_question_counts v
                 ON v.survey_id = s.survey_id
                 WHERE s.user_id=$1
                 ORDER BY created_at DESC`,
                [user_id]
            );

            res.json({ success: true, surveys: result.rows });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "설문 조회 실패" });
        }
    },

    // ================================
    // 3) 설문 상세 조회
    // ================================
    getSurveyDetail: async (req, res) => {
        try {
            const { id } = req.params;

            const surveyRes = await pool.query(
                "SELECT * FROM surveys WHERE survey_id=$1",
                [id]
            );
            if (!surveyRes.rows.length)
                return res
                    .status(404)
                    .json({ success: false, message: "설문 없음" });

            const survey = surveyRes.rows[0];

            const pagesRes = await pool.query(
                `
                SELECT 
                    p.page_id, p.title AS page_title, p.order_index AS page_order,
                    q.question_id, q.type, q.title AS question_title, q.description,
                    q.required, q.order_index AS question_order, q.metadata,
                    o.option_id, o.text AS option_text, o.order_index AS option_order
                FROM pages p
                LEFT JOIN questions q ON q.page_id = p.page_id
                LEFT JOIN options o ON o.question_id = q.question_id
                WHERE p.survey_id = $1
                ORDER BY p.order_index, q.order_index, o.order_index
                `,
                [id]
            );

            const pagesMap = {};
            const pages = [];

            pagesRes.rows.forEach((row) => {
                if (!pagesMap[row.page_id]) {
                    pagesMap[row.page_id] = {
                        page_id: row.page_id,
                        title: row.page_title,
                        order_index: row.page_order,
                        questions: [],
                    };
                    pages.push(pagesMap[row.page_id]);
                }

                if (row.question_id) {
                    let q = pagesMap[row.page_id].questions.find(
                        (q) => q.question_id === row.question_id
                    );
                    if (!q) {
                        q = {
                            question_id: row.question_id,
                            type: row.type,
                            title: row.question_title,
                            description: row.description,
                            required: row.required,
                            order_index: row.question_order,
                            metadata: row.metadata,
                            options: [],
                        };
                        pagesMap[row.page_id].questions.push(q);
                    }

                    if (row.option_id)
                        q.options.push({
                            option_id: row.option_id,
                            text: row.option_text,
                            order_index: row.option_order,
                        });
                }
            });

            res.json({ success: true, survey, pages });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: "설문 상세 조회 실패",
            });
        }
    },

    // ================================
    // 4) 설문 수정
    // ================================
    updateSurvey: async (req, res) => {
        try {
            const { id } = req.params;
            const fields = req.body;
            const setQuery = Object.keys(fields)
                .map((k, i) => `${k}=$${i + 1}`)
                .join(", ");
            const values = Object.values(fields);

            const result = await pool.query(
                `UPDATE surveys SET ${setQuery} WHERE survey_id=$${
                    values.length + 1
                } RETURNING *`,
                [...values, id]
            );

            res.json({ success: true, survey: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "설문 수정 실패" });
        }
    },

    // ================================
    // 5) 설문 삭제
    // ================================
    deleteSurvey: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query("DELETE FROM surveys WHERE survey_id=$1", [id]);
            res.json({ success: true, message: "설문 삭제 완료" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "설문 삭제 실패" });
        }
    },

    // ================================
    // 6) 설문 설정 수정
    // ================================
    updateSurveySettings: async (req, res) => {
        try {
            const { id } = req.params;
            const { start_date, end_date, max_participants, is_public } =
                req.body;

            const result = await pool.query(
                `UPDATE surveys SET start_date=$1, end_date=$2, max_participants=$3, is_public=$4 WHERE survey_id=$5 RETURNING *`,
                [start_date, end_date, max_participants, is_public, id]
            );

            res.json({ success: true, settings: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: "설정 업데이트 실패",
            });
        }
    },

    // ================================
    // 7) 설문 복제
    // ================================
    cloneSurvey: async (req, res) => {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            await client.query("BEGIN");

            const surveyClone = await client.query(
                `INSERT INTO surveys (user_id, title, subtitle, description, cover_image, bg_color, font, start_date, end_date, max_participants, is_public)
                 SELECT user_id, title || ' (복제)', subtitle, description, cover_image, bg_color, font, start_date, end_date, max_participants, is_public
                 FROM surveys WHERE survey_id=$1 RETURNING survey_id`,
                [id]
            );

            const newSurveyId = surveyClone.rows[0].survey_id;

            const pages = await client.query(
                "SELECT * FROM pages WHERE survey_id=$1",
                [id]
            );

            for (const p of pages.rows) {
                const newPage = await client.query(
                    "INSERT INTO pages (survey_id, order_index, title) VALUES ($1,$2,$3) RETURNING page_id",
                    [newSurveyId, p.order_index, p.title]
                );
                const newPageId = newPage.rows[0].page_id;

                const questions = await client.query(
                    "SELECT * FROM questions WHERE page_id=$1",
                    [p.page_id]
                );
                for (const q of questions.rows) {
                    const newQuestion = await client.query(
                        "INSERT INTO questions (page_id,type,title,description,required,order_index,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING question_id",
                        [
                            newPageId,
                            q.type,
                            q.title,
                            q.description,
                            q.required,
                            q.order_index,
                            q.metadata,
                        ]
                    );
                    const newQid = newQuestion.rows[0].question_id;

                    await client.query(
                        "INSERT INTO options (question_id, text, order_index) SELECT $1, text, order_index FROM options WHERE question_id=$2",
                        [newQid, q.question_id]
                    );
                }
            }

            await client.query("COMMIT");
            res.json({ success: true, new_survey_id: newSurveyId });
        } catch (err) {
            await client.query("ROLLBACK");
            console.error(err);
            res.status(500).json({ success: false, message: "설문 복제 실패" });
        } finally {
            client.release();
        }
    },

    // ================================
    // 8) 전체 설문 검색
    // ================================
    searchSurveys: async (req, res) => {
        try {
            const { q } = req.query;

            if (!q || q.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "검색어(q)가 필요합니다.",
                });
            }

            const result = await pool.query(
                `
                SELECT *
                FROM surveys
                WHERE title ILIKE $1
                ORDER BY created_at DESC
                `,
                [`%${q}%`]
            );

            res.json({
                success: true,
                total: result.rows.length,
                surveys: result.rows,
            });
        } catch (err) {
            console.error("Search Error:", err);
            res.status(500).json({
                success: false,
                message: "설문 검색 실패",
            });
        }
    },
    // ================================
    // 10) 내가 참여한 설문 조회
    // ================================
    getMyParticipatedSurveys: async (req, res) => {
        try {
            const user_id = req.user.user_id;

            // responses.user_id 기준으로 참여 설문 조회
            const result = await pool.query(
                `
            SELECT DISTINCT 
                s.*, 
                r.response_id,
                r.submitted_at AS participated_at
            FROM surveys s
            JOIN responses r ON s.survey_id = r.survey_id
            WHERE r.user_id = $1
            ORDER BY r.submitted_at DESC
            `,
                [user_id]
            );

            res.json({
                success: true,
                surveys: result.rows,
            });
        } catch (err) {
            console.error("내가 참여한 설문 조회 오류:", err);
            res.status(500).json({
                success: false,
                message: "내 참여 설문 조회 실패",
            });
        }
    },

    // ================================
    // 9) 내 설문 검색
    // ================================
    searchMySurveys: async (req, res) => {
        try {
            const { q } = req.query;
            const user_id = req.user.user_id;

            if (!q || q.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "검색어(q)가 필요합니다.",
                });
            }

            const result = await pool.query(
                `
                SELECT *
                FROM surveys
                WHERE user_id = $1
                AND title ILIKE $2
                ORDER BY created_at DESC
                `,
                [user_id, `%${q}%`]
            );

            res.json({
                success: true,
                total: result.rows.length,
                surveys: result.rows,
            });
        } catch (err) {
            console.error("My Search Error:", err);
            res.status(500).json({
                success: false,
                message: "내 설문 검색 실패",
            });
        }
    },
};
