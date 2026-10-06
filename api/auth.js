const { Pool } = require("pg");
const crypto = require("crypto");

const databaseUrl = process.env.DATABASE_URL
    .replace("?sslmode=require", "")
    .replace("&sslmode=require", "");

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
    const parts = storedHash.split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt") {
        return false;
    }

    const salt = parts[1];
    const savedHash = parts[2];

    const calculatedHash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    const calculatedBuffer = Buffer.from(
        calculatedHash,
        "hex"
    );

    const savedBuffer = Buffer.from(
        savedHash,
        "hex"
    );

    if (calculatedBuffer.length !== savedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        calculatedBuffer,
        savedBuffer
    );
}

function createPublicToken() {
    return crypto.randomBytes(32).toString("hex");
}

function formatUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,

        birthDate: user.birth_date || "",
        bloodType: user.blood_type || "",
        allergies: user.allergies || "",
        medications: user.medications || "",
        conditions: user.conditions || "",
        neurologicalConditions:
            user.neurological_conditions || "",

        cardValidationDate:
            user.card_validation_date || "",

        emergencyContacts:
            user.emergency_contacts || [],

        settings: {
            showMedicalInfo:
                user.show_medical_info ?? true,

            publicCard:
                user.public_card ?? false,

            notifications:
                user.notifications ?? false,

            publicToken:
                user.public_token || null
        }
    };
}

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    // Preflight CORS
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Teste da conexão com Aiven
    if (req.method === "GET") {
        try {
            const result = await pool.query(
                "SELECT NOW() AS horario"
            );

            return res.status(200).json({
                conectado: true,
                mensagem:
                    "JavaScript conectado ao PostgreSQL do Aiven.",
                horario:
                    result.rows[0].horario
            });

        } catch (error) {
            console.error(
                "Erro na conexão com o Aiven:",
                error
            );

            return res.status(500).json({
                conectado: false,
                erro: error.message
            });
        }
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Método não permitido."
        });
    }

    const action = req.query?.action;

    if (action === "register") {
        return register(req, res);
    }

    if (action === "login") {
        return login(req, res);
    }

    return res.status(400).json({
        message: "Ação inválida."
    });
};

async function register(req, res) {
    const {
        name,
        email,
        cpf,
        phone,
        password
    } = req.body || {};

    if (
        !name ||
        !email ||
        !cpf ||
        !phone ||
        !password
    ) {
        return res.status(400).json({
            message:
                "Preencha todos os campos obrigatórios."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message:
                "A senha deve possuir pelo menos 6 caracteres."
        });
    }

    const emailNormalized =
        email.trim().toLowerCase();

    const cpfNormalized =
        cpf.trim();

    const client = await pool.connect();

    try {
        const existingUser =
            await client.query(
                `
                SELECT id, email, cpf
                FROM users
                WHERE email = $1
                   OR cpf = $2
                LIMIT 1
                `,
                [
                    emailNormalized,
                    cpfNormalized
                ]
            );

        if (existingUser.rows.length > 0) {
            const existing =
                existingUser.rows[0];

            if (
                existing.email ===
                emailNormalized
            ) {
                return res.status(409).json({
                    message:
                        "Já existe uma conta cadastrada com este e-mail."
                });
            }

            if (
                existing.cpf ===
                cpfNormalized
            ) {
                return res.status(409).json({
                    message:
                        "Já existe uma conta cadastrada com este CPF."
                });
            }
        }

        await client.query("BEGIN");

        const passwordHash =
            hashPassword(password);

        const publicToken =
            createPublicToken();

        const userResult =
            await client.query(
                `
                INSERT INTO users (
                    name,
                    email,
                    cpf,
                    phone,
                    password_hash,
                    public_token
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                RETURNING *
                `,
                [
                    name.trim(),
                    emailNormalized,
                    cpfNormalized,
                    phone.trim(),
                    passwordHash,
                    publicToken
                ]
            );

        const user =
            userResult.rows[0];

        await client.query(
            `
            INSERT INTO medical_info (
                user_id
            )
            VALUES ($1)
            `,
            [user.id]
        );

        await client.query("COMMIT");

        console.log(
            "Usuário criado:",
            user.id
        );

        return res.status(201).json({
            message:
                "Conta criada com sucesso.",
            user: formatUser(user)
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Erro ao cadastrar usuário:",
            error
        );

        if (error.code === "23505") {
            return res.status(409).json({
                message:
                    "E-mail ou CPF já cadastrado."
            });
        }

        return res.status(500).json({
            message:
                "Erro ao criar sua conta."
        });

    } finally {
        client.release();
    }
}

async function login(req, res) {
    const {
        email,
        password
    } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            message:
                "Preencha todos os campos."
        });
    }

    const emailNormalized =
        email.trim().toLowerCase();

    try {
        const result =
            await pool.query(
                `
                SELECT
                    u.*,

                    m.blood_type,
                    m.allergies,
                    m.medications,
                    m.conditions,
                    m.neurological_conditions,
                    m.card_validation_date,

                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', ec.id,
                                    'name', ec.name,
                                    'phone', ec.phone,
                                    'relationship', ec.relationship
                                )
                                ORDER BY ec.id
                            )
                            FROM emergency_contacts ec
                            WHERE ec.user_id = u.id
                        ),
                        '[]'::json
                    ) AS emergency_contacts

                FROM users u

                LEFT JOIN medical_info m
                    ON m.user_id = u.id

                WHERE u.email = $1

                LIMIT 1
                `,
                [emailNormalized]
            );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message:
                    "E-mail ou senha incorretos."
            });
        }

        const user =
            result.rows[0];

        const validPassword =
            verifyPassword(
                password,
                user.password_hash
            );

        if (!validPassword) {
            return res.status(401).json({
                message:
                    "E-mail ou senha incorretos."
            });
        }

        console.log(
            "Login realizado:",
            user.id
        );

        return res.status(200).json({
            message:
                "Login realizado com sucesso.",
            user: formatUser(user)
        });

    } catch (error) {
        console.error(
            "Erro ao fazer login:",
            error
        );

        return res.status(500).json({
            message:
                "Erro ao realizar login."
        });
    }
}