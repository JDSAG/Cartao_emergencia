const pool = require("./database");
const userQuery = require("./user-query");
const { formatUser, hashPassword, parseBody } = require("./utils");

module.exports = async function config(req, res) {
    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Método não permitido." });
    }

    const body = parseBody(req);

    if (!body) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    const userId = Number(body.userId);
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";
    const settings = body.settings || {};

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "Usuário inválido." });
    }

    if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Informe um e-mail válido." });
    }

    if (password && password.length < 6) {
        return res.status(400).json({ message: "A senha deve possuir pelo menos 6 caracteres." });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const existingEmail = await client.query(
            "SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1",
            [email, userId]
        );

        if (existingEmail.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "Já existe uma conta cadastrada com este e-mail."
            });
        }

        const userResult = await client.query(
            `
                UPDATE users
                SET
                    email = $1,
                    password_hash = COALESCE($2, password_hash),
                    show_medical_info = $3,
                    public_card = $4,
                    notifications = $5
                WHERE id = $6
                RETURNING id
            `,
            [
                email,
                password ? hashPassword(password) : null,
                settings.showMedicalInfo ?? true,
                settings.publicCard ?? false,
                settings.notifications ?? false,
                userId
            ]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        await client.query("COMMIT");
        const result = await pool.query(userQuery.byId, [userId]);

        return res.status(200).json({
            message: "Configurações salvas com sucesso.",
            user: formatUser(result.rows[0])
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Erro ao salvar configurações:", error);

        if (error.code === "23505") {
            return res.status(409).json({ message: "E-mail já cadastrado." });
        }

        return res.status(500).json({
            message: "Erro ao salvar as configurações.",
            error: error.message,
            code: error.code || null
        });
    } finally {
        client.release();
    }
};
