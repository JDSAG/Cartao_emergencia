const pool = require("./database");
const userQuery = require("./user-query");
const { formatUser, parseBody, verifyPassword } = require("./utils");

module.exports = async function login(req, res) {
    const body = parseBody(req);

    if (!body) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    const { email, password } = body;

    if (!email || !password) {
        return res.status(400).json({ message: "Preencha todos os campos." });
    }

    try {
        const result = await pool.query(userQuery.byEmail, [email.trim().toLowerCase()]);

        if (result.rows.length === 0 || !verifyPassword(password, result.rows[0].password_hash)) {
            return res.status(401).json({ message: "E-mail ou senha incorretos." });
        }

        const user = result.rows[0];
        console.log("Login realizado:", user.id);

        return res.status(200).json({
            message: "Login realizado com sucesso.",
            user: formatUser(user)
        });
    } catch (error) {
        console.error("Erro ao fazer login:", error);

        return res.status(500).json({
            message: "Erro ao realizar login.",
            error: error.message,
            code: error.code || null
        });
    }
};
