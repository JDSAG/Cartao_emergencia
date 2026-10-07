const pool = require("./database");
const userQuery = require("./user-query");
const { formatUser, normalizeDate, parseBody } = require("./utils");

module.exports = async function medical(req, res) {
    const body = parseBody(req);
    const userId = Number(req.method === "GET" ? req.query?.userId : body?.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "Usuário inválido." });
    }

    if (req.method === "GET") {
        try {
            const result = await pool.query(
                `
                    SELECT u.id, u.name, u.email, u.phone,
                        TO_CHAR(u.birth_date, 'YYYY-MM-DD') AS birth_date,
                        m.blood_type, m.allergies, m.medications, m.conditions,
                        m.neurological_conditions,
                        TO_CHAR(m.card_validation_date, 'YYYY-MM-DD') AS card_validation_date
                    FROM users u
                    LEFT JOIN medical_info m ON m.user_id = u.id
                    WHERE u.id = $1
                    LIMIT 1
                `,
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            const data = result.rows[0];

            return res.status(200).json({
                medical: {
                    birthDate: data.birth_date || "",
                    bloodType: data.blood_type || "",
                    allergies: data.allergies || "",
                    medications: data.medications || "",
                    conditions: data.conditions || "",
                    neurologicalConditions: data.neurological_conditions || "",
                    cardValidationDate: data.card_validation_date || ""
                }
            });
        } catch (error) {
            console.error("Erro ao carregar informações médicas:", error);

            return res.status(500).json({
                message: "Erro ao acessar as informações médicas.",
                error: error.message,
                code: error.code || null
            });
        }
    }

    if (req.method !== "PUT" && req.method !== "POST") {
        return res.status(405).json({ message: "Método não permitido." });
    }

    if (!body) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    const {
        birthDate,
        bloodType,
        allergies,
        medications,
        conditions,
        neurologicalConditions,
        cardValidationDate
    } = body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const userResult = await client.query(
            "SELECT id FROM users WHERE id = $1 LIMIT 1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        await client.query(
            "UPDATE users SET birth_date = $1 WHERE id = $2",
            [normalizeDate(birthDate), userId]
        );
        await client.query(
            `
                INSERT INTO medical_info (
                    user_id, blood_type, allergies, medications, conditions,
                    neurological_conditions, card_validation_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id) DO UPDATE SET
                    blood_type = EXCLUDED.blood_type,
                    allergies = EXCLUDED.allergies,
                    medications = EXCLUDED.medications,
                    conditions = EXCLUDED.conditions,
                    neurological_conditions = EXCLUDED.neurological_conditions,
                    card_validation_date = EXCLUDED.card_validation_date
            `,
            [
                userId,
                bloodType || "",
                allergies || "",
                medications || "",
                conditions || "",
                neurologicalConditions || "",
                normalizeDate(cardValidationDate)
            ]
        );
        await client.query("COMMIT");

        const result = await pool.query(userQuery.byId, [userId]);

        return res.status(200).json({
            message: "Informações médicas salvas com sucesso.",
            user: formatUser(result.rows[0])
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Erro ao salvar informações médicas:", error);

        return res.status(500).json({
            message: "Erro ao salvar as informações médicas.",
            error: error.message,
            code: error.code || null
        });
    } finally {
        client.release();
    }
};
