const pool = require("./database");
const { parseBody } = require("./utils");

function invalidUser(res) {
    return res.status(400).json({ message: "Usuário inválido." });
}

module.exports = async function contacts(req, res) {
    const body = parseBody(req);
    let userId;

    if (req.method === "GET" || req.method === "DELETE") {
        userId = Number(req.query?.userId);

        if (!userId && body) {
            userId = Number(body.userId);
        }
    } else {
        userId = Number(body?.userId);
    }

    if (!Number.isInteger(userId) || userId <= 0) {
        return invalidUser(res);
    }

    if (req.method === "GET") {
        try {
            const result = await pool.query(
                `
                    SELECT id, name, phone, relationship, email
                    FROM emergency_contacts
                    WHERE user_id = $1
                    ORDER BY id
                `,
                [userId]
            );

            return res.status(200).json({ contacts: result.rows });
        } catch (error) {
            console.error("Erro ao carregar contatos:", error);
            return res.status(500).json({
                message: "Erro ao carregar os contatos.",
                error: error.message,
                code: error.code || null
            });
        }
    }

    if (!body) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    if (req.method === "POST") {
        const { name, phone, relationship, email } = body;

        if (!name || !phone || !relationship) {
            return res.status(400).json({ message: "Preencha os campos obrigatórios." });
        }

        try {
            const result = await pool.query(
                `
                    INSERT INTO emergency_contacts (user_id, name, phone, relationship, email)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, name, phone, relationship, email
                `,
                [userId, name.trim(), phone.trim(), relationship.trim(), email ? email.trim() : null]
            );

            return res.status(201).json({
                message: "Contato adicionado com sucesso.",
                contact: result.rows[0]
            });
        } catch (error) {
            console.error("Erro ao adicionar contato:", error);
            return res.status(500).json({
                message: "Erro ao adicionar o contato.",
                error: error.message,
                code: error.code || null
            });
        }
    }

    if (req.method === "PUT") {
        const contactId = Number(body.contactId);
        const { name, phone, relationship, email } = body;

        if (!Number.isInteger(contactId) || contactId <= 0) {
            return res.status(400).json({ message: "Contato inválido." });
        }

        if (!name || !phone || !relationship) {
            return res.status(400).json({ message: "Preencha os campos obrigatórios." });
        }

        try {
            const result = await pool.query(
                `
                    UPDATE emergency_contacts
                    SET name = $1, phone = $2, relationship = $3, email = $4
                    WHERE id = $5 AND user_id = $6
                    RETURNING id, name, phone, relationship, email
                `,
                [
                    name.trim(), phone.trim(), relationship.trim(),
                    email ? email.trim() : null, contactId, userId
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Contato não encontrado." });
            }

            return res.status(200).json({
                message: "Contato atualizado com sucesso.",
                contact: result.rows[0]
            });
        } catch (error) {
            console.error("Erro ao atualizar contato:", error);
            return res.status(500).json({
                message: "Erro ao atualizar o contato.",
                error: error.message,
                code: error.code || null
            });
        }
    }

    if (req.method === "DELETE") {
        const contactId = Number(req.query?.contactId);

        if (!Number.isInteger(contactId) || contactId <= 0) {
            return res.status(400).json({ message: "Contato inválido." });
        }

        try {
            const result = await pool.query(
                `DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING id`,
                [contactId, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Contato não encontrado." });
            }

            return res.status(200).json({ message: "Contato excluído com sucesso." });
        } catch (error) {
            console.error("Erro ao excluir contato:", error);
            return res.status(500).json({
                message: "Erro ao excluir o contato.",
                error: error.message,
                code: error.code || null
            });
        }
    }

    return res.status(405).json({ message: "Método não permitido." });
};
