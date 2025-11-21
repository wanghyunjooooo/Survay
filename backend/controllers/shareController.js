const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// =====================
// 1) 공유 링크 생성 / 이메일 공유
// =====================
exports.createShare = async (req, res) => {
    const { surveyId } = req.params;
    const { emails = [] } = req.body; // 여러 이메일 배열

    try {
        if (!surveyId) {
            return res
                .status(400)
                .json({ success: false, message: "surveyId 필요" });
        }

        // 이메일별 공유 링크 생성
        const results = [];
        for (const email of emails.length ? emails : [null]) {
            const shareLink = uuidv4();
            await pool.query(
                `
        INSERT INTO survey_shares (survey_id, share_link, email)
        VALUES ($1, $2, $3)
        ON CONFLICT (survey_id, email)
        DO UPDATE SET share_link = EXCLUDED.share_link
        `,
                [surveyId, shareLink, email]
            );
            results.push({ email, shareLink });
        }

        // 단일 링크 반환 (첫 이메일 또는 null)
        const shareLink = results[0]?.shareLink || uuidv4();

        res.json({
            success: true,
            shareLink,
        });
    } catch (err) {
        console.error("createShare 오류:", err);
        res.status(500).json({
            success: false,
            message: "공유 링크 생성 실패",
        });
    }
};

// =====================
// 2) 공유 링크로 설문 조회
// =====================
exports.getSurveyByShareLink = async (req, res) => {
    const { shareLink } = req.params;

    try {
        // 공유 링크로 surveyId 조회
        const shareRes = await pool.query(
            `SELECT survey_id FROM survey_shares WHERE share_link = $1`,
            [shareLink]
        );

        if (shareRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "유효하지 않은 공유 링크입니다.",
            });
        }

        const surveyId = shareRes.rows[0].survey_id;

        // 설문 기본 정보
        const surveyRes = await pool.query(
            `SELECT survey_id AS id, title, subtitle, description, start_date, end_date 
       FROM surveys WHERE survey_id = $1`,
            [surveyId]
        );

        if (surveyRes.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "설문을 찾을 수 없습니다." });
        }

        const survey = surveyRes.rows[0];

        // 페이지 조회
        const pagesRes = await pool.query(
            `SELECT page_id AS id, title, order_index FROM pages WHERE survey_id = $1 ORDER BY order_index ASC`,
            [surveyId]
        );

        const pages = [];
        for (const page of pagesRes.rows) {
            // 질문 조회
            const questionsRes = await pool.query(
                `SELECT question_id AS id, type, title, description, required, order_index 
         FROM questions WHERE page_id = $1 ORDER BY order_index ASC`,
                [page.id]
            );

            const questions = [];
            for (const q of questionsRes.rows) {
                // 옵션 조회 (선택형 질문만)
                const optionsRes = await pool.query(
                    `SELECT option_id AS id, text, order_index 
           FROM options WHERE question_id = $1 ORDER BY order_index ASC`,
                    [q.id]
                );
                questions.push({ ...q, options: optionsRes.rows });
            }

            pages.push({ ...page, questions });
        }

        res.json({ success: true, survey: { ...survey, pages } });
    } catch (err) {
        console.error("getSurveyByShareLink 오류:", err);
        res.status(500).json({
            success: false,
            message: "설문 상세 조회 실패",
        });
    }
};

// =====================
// 3) 공유 링크 삭제
// =====================
exports.deleteShare = async (req, res) => {
    const { surveyId, email } = req.params;

    try {
        if (email) {
            await pool.query(
                `DELETE FROM survey_shares WHERE survey_id = $1 AND email = $2`,
                [surveyId, email]
            );
        } else {
            await pool.query(`DELETE FROM survey_shares WHERE survey_id = $1`, [
                surveyId,
            ]);
        }
        res.json({ success: true, message: "공유 링크 삭제 완료" });
    } catch (err) {
        console.error("deleteShare 오류:", err);
        res.status(500).json({
            success: false,
            message: "공유 링크 삭제 실패",
        });
    }
};
