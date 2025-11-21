const pool = require("../config/db");

// =====================
// 1) 설문 응답 제출 (로그인 필수)
// =====================
exports.submitResponse = async (req, res) => {
    const { surveyId } = req.params;
    const { answers } = req.body;

    // 로그인 유저 확인
    const user_id = req.user?.user_id;
    if (!user_id) {
        return res.status(401).json({
            success: false,
            message: "로그인 후 설문에 참여할 수 있습니다.",
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // responses 테이블에 먼저 insert
        const responseResult = await client.query(
            `INSERT INTO responses (survey_id, user_id)
             VALUES ($1, $2) RETURNING response_id`,
            [surveyId, user_id]
        );
        const responseId = responseResult.rows[0].response_id;

        // answers 테이블에 insert
        for (const ans of answers) {
            await client.query(
                `INSERT INTO answers (response_id, question_id, option_id, text_answer)
                 VALUES ($1, $2, $3, $4)`,
                [
                    responseId,
                    ans.questionId,
                    ans.optionId || null,
                    ans.answerText || null,
                ]
            );
        }

        await client.query("COMMIT");
        res.status(201).json({
            success: true,
            message: "응답 제출 완료",
            responseId,
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("submitResponse 오류:", err);
        res.status(500).json({
            success: false,
            message: "응답 저장 실패",
            error: err.message,
        });
    } finally {
        client.release();
    }
};

// 2) 응답 리스트 조회
exports.getResponses = async (req, res) => {
    const { surveyId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM responses WHERE survey_id=$1 ORDER BY submitted_at DESC`,
            [surveyId]
        );
        res.json({ success: true, responses: result.rows });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "응답 리스트 조회 실패",
        });
    }
};

// 3) 특정 응답 상세 조회
exports.getResponseDetail = async (req, res) => {
    const { responseId } = req.params;
    try {
        const response = await pool.query(
            `SELECT * FROM responses WHERE response_id=$1`,
            [responseId]
        );
        const answers = await pool.query(
            `SELECT * FROM answers WHERE response_id=$1`,
            [responseId]
        );
        res.json({
            success: true,
            response: response.rows[0],
            answers: answers.rows,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "응답 상세조회 실패" });
    }
};

// 4) 특정 응답 삭제
exports.deleteResponse = async (req, res) => {
    const { responseId } = req.params;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`DELETE FROM answers WHERE response_id=$1`, [
            responseId,
        ]);
        await client.query(`DELETE FROM responses WHERE response_id=$1`, [
            responseId,
        ]);
        await client.query("COMMIT");
        res.json({ success: true, message: "응답 삭제 완료" });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ success: false, message: "응답 삭제 실패" });
    } finally {
        client.release();
    }
};

// 5) 질문별 통계 조회
exports.getSummary = async (req, res) => {
    const { surveyId } = req.params;
    try {
        const result = await pool.query(
            `SELECT q.question_id, q.title AS question_text,
                    a.option_id,
                    o.text AS option_text,
                    COUNT(a.answer_id) AS count
             FROM answers a
             JOIN questions q ON a.question_id = q.question_id
             LEFT JOIN options o ON a.option_id = o.option_id
             JOIN responses r ON a.response_id = r.response_id
             WHERE r.survey_id=$1
             GROUP BY q.question_id, q.title, a.option_id, o.text
             ORDER BY q.question_id`,
            [surveyId]
        );
        res.json({ success: true, summary: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: "통계 조회 실패" });
    }
};

exports.getParticipants = async (req, res) => {
    const { surveyId } = req.params;
    try {
        const result = await pool.query(
            `
            SELECT 
                r.response_id,
                r.user_id AS respondent_id,
                u.name AS respondent_name,
                r.submitted_at,
                json_agg(
                    json_build_object(
                        'questionId', q.question_id,
                        'questionText', q.title,
                        'answerText', a.text_answer,
                        'optionId', o.option_id,
                        'optionText', o.text
                    )
                ) AS answers
            FROM responses r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN answers a ON a.response_id = r.response_id
            LEFT JOIN questions q ON q.question_id = a.question_id
            LEFT JOIN options o ON o.option_id = a.option_id
            WHERE r.survey_id = $1
            GROUP BY r.response_id, r.user_id, u.name
            ORDER BY r.submitted_at DESC
            `,
            [surveyId]
        );

        // 익명 참여자 이름 붙이기 & optionText JSON 처리
        let anonCounter = 1;
        const participants = result.rows.map((p) => {
            if (!p.respondent_name) {
                p.respondent_name = `익명 ${anonCounter++}`;
            }
            p.answers = p.answers.map((a) => {
                // optionText가 JSON이면 title 추출, 아니면 그대로
                if (a.optionText) {
                    try {
                        const parsed = JSON.parse(a.optionText);
                        if (parsed && parsed.title) a.optionText = parsed.title;
                    } catch (e) {
                        // 그냥 문자열이면 그대로 사용
                    }
                }
                return a;
            });
            return p;
        });

        res.json({ success: true, participants });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "참여자별 결과 조회 실패",
        });
    }
};
