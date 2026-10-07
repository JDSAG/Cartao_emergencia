const pool = require("../auth/database");

module.exports = async function handler(req, res) {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    if (req.method !== "GET") {
        return res
            .status(405)
            .json({
                message:
                    "Método não permitido."
            });
    }

    const token =
        req.query?.token;

    if (!token) {
        return res
            .status(400)
            .json({
                message:
                    "Token do cartão não informado."
            });
    }

    try {
        const result =
            await pool.query(
                `
                SELECT
                    u.name,
                    u.birth_date,
                    u.public_card,
                    u.show_medical_info,

                    m.blood_type,
                    m.allergies,
                    m.medications,
                    m.conditions,
                    m.neurological_conditions,
                    m.card_validation_date,

                    (
                        SELECT json_build_object(
                            'name', ec.name,
                            'phone', ec.phone,
                            'relationship', ec.relationship
                        )
                        FROM emergency_contacts ec
                        WHERE ec.user_id = u.id
                        ORDER BY ec.id
                        LIMIT 1
                    ) AS emergency_contact

                FROM users u

                LEFT JOIN medical_info m
                    ON m.user_id = u.id

                WHERE u.public_token = $1

                LIMIT 1
                `,
                [token]
            );

        if (
            result.rows.length === 0
        ) {
            return res
                .status(404)
                .json({
                    message:
                        "Cartão não encontrado."
                });
        }

        const user =
            result.rows[0];

        if (
            user.public_card !== true
        ) {
            return res
                .status(403)
                .json({
                    message:
                        "Este cartão não está disponível publicamente."
                });
        }

        const response = {
            name:
                user.name,

            birthDate:
                user.birth_date
                    ? new Date(
                        user.birth_date
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            cardValidationDate:
                user.card_validation_date
                    ? new Date(
                        user.card_validation_date
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            emergencyContact:
                user.emergency_contact ||
                null
        };

        if (
            user.show_medical_info === true
        ) {
            response.medical = {
                bloodType:
                    user.blood_type || "",

                allergies:
                    user.allergies || "",

                medications:
                    user.medications || "",

                conditions:
                    user.conditions || "",

                neurologicalConditions:
                    user.neurological_conditions || ""
            };
        }

        return res
            .status(200)
            .json(response);

    } catch (error) {
        console.error(
            "Erro ao carregar cartão público:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Erro ao carregar o cartão público.",
                error:
                    error.message
            });
    }
};