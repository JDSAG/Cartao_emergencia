const pool = require("./auth/database");
const register = require("./auth/register");
const login = require("./auth/login");
const medical = require("./auth/medical");
const contacts = require("./auth/contacts");
const config = require("./auth/config");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const action = req.query?.action;

    if (req.method === "GET" && !action) {
        try {
            const result = await pool.query("SELECT NOW() AS horario");

            return res.status(200).json({
                conectado: true,
                mensagem: "JavaScript conectado ao PostgreSQL do Aiven.",
                horario: result.rows[0].horario
            });
        } catch (error) {
            console.error("Erro na conexão com Aiven:", error);

            return res.status(500).json({
                conectado: false,
                erro: error.message,
                code: error.code || null
            });
        }
    }

    if (action === "medical") {
        return medical(req, res);
    }

    if (action === "contacts") {
        return contacts(req, res);
    }

    if (action === "register" && req.method === "POST") {
        return register(req, res);
    }

    if (action === "login" && req.method === "POST") {
        return login(req, res);
    }

    if (action === "config") {
        return config(req, res);
    }

    return res.status(405).json({
        message: "Método ou ação não permitidos."
    });
};
