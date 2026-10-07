const pool = require("./database");
const { createPublicToken, formatUser, hashPassword, parseBody } = require("./utils");

module.exports = async function register(req, res) {
    const body = parseBody(req);

    if (!body) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    const { name, email, cpf, phone, password } = body;

    if (!name || !email || !cpf || !phone || !password) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "A senha deve possuir pelo menos 6 caracteres." });
    }

    const emailNormalized = email.trim().toLowerCase();
    const cpfNormalized = cpf.trim();
    const client = await pool.connect();

    try {
        const existingUser = await client.query(
            `SELECT id, email, cpf FROM users WHERE email = $1 OR cpf = $2 LIMIT 1`,
            [emailNormalized, cpfNormalized]
        );

        if (existingUser.rows.length > 0) {
            const existing = existingUser.rows[0];
            const message = existing.email === emailNormalized
                ? "Já existe uma conta cadastrada com este e-mail."
                : "Já existe uma conta cadastrada com este CPF.";

            return res.status(409).json({ message });
        }

        await client.query("BEGIN");

        const userResult = await client.query(
            `
                INSERT INTO users (name, email, cpf, phone, password_hash, public_token)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
            [
                name.trim(),
                emailNormalized,
                cpfNormalized,
                phone.trim(),
                hashPassword(password),
                createPublicToken()
            ]
        );
        const user = userResult.rows[0];

        await client.query("INSERT INTO medical_info (user_id) VALUES ($1)", [user.id]);
        await client.query("COMMIT");

        console.log("Usuário criado:", user.id);

        return res.status(201).json({
            message: "Conta criada com sucesso.",
            user: formatUser(user)
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Erro ao cadastrar usuário:", error);

        if (error.code === "23505") {
            return res.status(409).json({ message: "E-mail ou CPF já cadastrado." });
        }

        return res.status(500).json({
            message: "Erro ao criar sua conta.",
            error: error.message,
            code: error.code || null
        });
    } finally {
        client.release();
    }
};
