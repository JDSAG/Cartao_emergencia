const { Pool } = require("pg");
const crypto = require("crypto");

const databaseUrl = new URL(
    process.env.DATABASE_URL
);

databaseUrl.searchParams.delete("sslmode");
databaseUrl.searchParams.delete("sslcert");
databaseUrl.searchParams.delete("sslkey");
databaseUrl.searchParams.delete("sslrootcert");

const pool = new Pool({
    connectionString: databaseUrl.toString(),
    ssl: {
        rejectUnauthorized: false
    }
});

// ============================================================
// UTILITÁRIOS
// ============================================================

function hashPassword(password) {
    const salt = crypto
        .randomBytes(16)
        .toString("hex");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash) {
        return false;
    }

    const parts = storedHash.split("$");

    if (
        parts.length !== 3 ||
        parts[0] !== "scrypt"
    ) {
        return false;
    }

    const salt = parts[1];
    const savedHash = parts[2];

    const calculatedHash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    const calculatedBuffer =
        Buffer.from(
            calculatedHash,
            "hex"
        );

    const savedBuffer =
        Buffer.from(
            savedHash,
            "hex"
        );

    if (
        calculatedBuffer.length !==
        savedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        calculatedBuffer,
        savedBuffer
    );
}

function createPublicToken() {
    return crypto
        .randomBytes(32)
        .toString("hex");
}

function parseBody(req) {
    let body = req.body || {};

    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch {
            return null;
        }
    }

    return body;
}

function normalizeDate(value) {
    if (!value) {
        return null;
    }

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    return value;
}

function formatUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,

        birthDate:
            user.birth_date || "",

        bloodType:
            user.blood_type || "",

        allergies:
            user.allergies || "",

        medications:
            user.medications || "",

        conditions:
            user.conditions || "",

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

// ============================================================
// HANDLER PRINCIPAL
// ============================================================

module.exports = async function handler(req, res) {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    if (req.method === "OPTIONS") {
        return res
            .status(200)
            .end();
    }

    const action =
        req.query?.action;

    // ========================================================
    // TESTE DA CONEXÃO
    // GET /api/auth
    // ========================================================

    if (
        req.method === "GET" &&
        !action
    ) {
        try {
            const result =
                await pool.query(
                    "SELECT NOW() AS horario"
                );

            return res
                .status(200)
                .json({
                    conectado: true,
                    mensagem:
                        "JavaScript conectado ao PostgreSQL do Aiven.",
                    horario:
                        result.rows[0]
                            .horario
                });

        } catch (error) {
            console.error(
                "Erro na conexão com Aiven:",
                error
            );

            return res
                .status(500)
                .json({
                    conectado: false,
                    erro:
                        error.message,
                    code:
                        error.code ||
                        null
                });
        }
    }

    // ========================================================
    // INFORMAÇÕES MÉDICAS
    // ========================================================

    if (action === "medical") {
        return medical(
            req,
            res
        );
    }

    // ========================================================
    // CONTATOS
    // ========================================================

    if (action === "contacts") {
        return contacts(
            req,
            res
        );
    }

    // ========================================================
    // CADASTRO
    // ========================================================

    if (
        action === "register" &&
        req.method === "POST"
    ) {
        return register(
            req,
            res
        );
    }

    // ========================================================
    // LOGIN
    // ========================================================

    if (
    action === "login" &&
    req.method === "POST"
) {
    return login(
        req,
        res
    );
}

// ========================================================
// CONFIGURAÇÕES
// ========================================================

if (action === "config") {
    return config(
        req,
        res
    );
}

return res
    .status(405)
    .json({
        message:
            "Método ou ação não permitidos."
    });
};

// ============================================================
// CADASTRO
// ============================================================

async function register(req, res) {
    const body =
        parseBody(req);

    if (!body) {
        return res
            .status(400)
            .json({
                message:
                    "Dados inválidos."
            });
    }

    const {
        name,
        email,
        cpf,
        phone,
        password
    } = body;

    if (
        !name ||
        !email ||
        !cpf ||
        !phone ||
        !password
    ) {
        return res
            .status(400)
            .json({
                message:
                    "Preencha todos os campos obrigatórios."
            });
    }

    if (
        password.length < 6
    ) {
        return res
            .status(400)
            .json({
                message:
                    "A senha deve possuir pelo menos 6 caracteres."
            });
    }

    const emailNormalized =
        email
            .trim()
            .toLowerCase();

    const cpfNormalized =
        cpf.trim();

    const client =
        await pool.connect();

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

        if (
            existingUser.rows.length > 0
        ) {
            const existing =
                existingUser.rows[0];

            if (
                existing.email ===
                emailNormalized
            ) {
                return res
                    .status(409)
                    .json({
                        message:
                            "Já existe uma conta cadastrada com este e-mail."
                    });
            }

            return res
                .status(409)
                .json({
                    message:
                        "Já existe uma conta cadastrada com este CPF."
                });
        }

        await client.query(
            "BEGIN"
        );

        const passwordHash =
            hashPassword(
                password
            );

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

        await client.query(
            "COMMIT"
        );

        console.log(
            "Usuário criado:",
            user.id
        );

        return res
            .status(201)
            .json({
                message:
                    "Conta criada com sucesso.",
                user:
                    formatUser(user)
            });

    } catch (error) {
        await client.query(
            "ROLLBACK"
        );

        console.error(
            "Erro ao cadastrar usuário:",
            error
        );

        if (
            error.code === "23505"
        ) {
            return res
                .status(409)
                .json({
                    message:
                        "E-mail ou CPF já cadastrado."
                });
        }

        return res
            .status(500)
            .json({
                message:
                    "Erro ao criar sua conta.",
                error:
                    error.message,
                code:
                    error.code ||
                    null
            });

    } finally {
        client.release();
    }
}

// ============================================================
// LOGIN
// ============================================================

async function login(req, res) {
    const body =
        parseBody(req);

    if (!body) {
        return res
            .status(400)
            .json({
                message:
                    "Dados inválidos."
            });
    }

    const {
        email,
        password
    } = body;

    if (
        !email ||
        !password
    ) {
        return res
            .status(400)
            .json({
                message:
                    "Preencha todos os campos."
            });
    }

    const emailNormalized =
        email
            .trim()
            .toLowerCase();

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
                                    'relationship', ec.relationship,
                                    'email', ec.email
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

        if (
            result.rows.length === 0
        ) {
            return res
                .status(401)
                .json({
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
            return res
                .status(401)
                .json({
                    message:
                        "E-mail ou senha incorretos."
                });
        }

        console.log(
            "Login realizado:",
            user.id
        );

        return res
            .status(200)
            .json({
                message:
                    "Login realizado com sucesso.",
                user:
                    formatUser(user)
            });

    } catch (error) {
        console.error(
            "Erro ao fazer login:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Erro ao realizar login.",
                error:
                    error.message,
                code:
                    error.code ||
                    null
            });
    }
}

// ============================================================
// INFORMAÇÕES MÉDICAS
// ============================================================

async function medical(req, res) {
    const body =
        parseBody(req);

    let userId;

    if (
        req.method === "GET"
    ) {
        userId = Number(
            req.query?.userId
        );
    } else {
        userId = Number(
            body?.userId
        );
    }

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return res
            .status(400)
            .json({
                message:
                    "Usuário inválido."
            });
    }

    // ========================================================
    // GET
    // ========================================================

    if (
        req.method === "GET"
    ) {
        try {
            const result =
                await pool.query(
                    `
                    SELECT
                        u.id,
                        u.name,
                        u.email,
                        u.phone,

                        TO_CHAR(
                            u.birth_date,
                            'YYYY-MM-DD'
                        ) AS birth_date,

                        m.blood_type,
                        m.allergies,
                        m.medications,
                        m.conditions,
                        m.neurological_conditions,

                        TO_CHAR(
                            m.card_validation_date,
                            'YYYY-MM-DD'
                        ) AS card_validation_date

                    FROM users u

                    LEFT JOIN medical_info m
                        ON m.user_id = u.id

                    WHERE u.id = $1

                    LIMIT 1
                    `,
                    [userId]
                );

            if (
                result.rows.length === 0
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Usuário não encontrado."
                    });
            }

            const data =
                result.rows[0];

            return res
                .status(200)
                .json({
                    medical: {
                        birthDate:
                            data.birth_date ||
                            "",

                        bloodType:
                            data.blood_type ||
                            "",

                        allergies:
                            data.allergies ||
                            "",

                        medications:
                            data.medications ||
                            "",

                        conditions:
                            data.conditions ||
                            "",

                        neurologicalConditions:
                            data.neurological_conditions ||
                            "",

                        cardValidationDate:
                            data.card_validation_date ||
                            ""
                    }
                });

        } catch (error) {
            console.error(
                "Erro ao carregar informações médicas:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Erro ao acessar as informações médicas.",
                    error:
                        error.message,
                    code:
                        error.code ||
                        null
                });
        }
    }

    // ========================================================
    // PUT / POST
    // ========================================================

    if (
        req.method !== "PUT" &&
        req.method !== "POST"
    ) {
        return res
            .status(405)
            .json({
                message:
                    "Método não permitido."
            });
    }

    if (!body) {
        return res
            .status(400)
            .json({
                message:
                    "Dados inválidos."
            });
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

    const client =
        await pool.connect();

    try {
        await client.query(
            "BEGIN"
        );

        const userResult =
            await client.query(
                `
                SELECT id
                FROM users
                WHERE id = $1
                LIMIT 1
                `,
                [userId]
            );

        if (
            userResult.rows.length === 0
        ) {
            await client.query(
                "ROLLBACK"
            );

            return res
                .status(404)
                .json({
                    message:
                        "Usuário não encontrado."
                });
        }

        await client.query(
            `
            UPDATE users
            SET birth_date = $1
            WHERE id = $2
            `,
            [
                normalizeDate(
                    birthDate
                ),
                userId
            ]
        );

        await client.query(
            `
            INSERT INTO medical_info (
                user_id,
                blood_type,
                allergies,
                medications,
                conditions,
                neurological_conditions,
                card_validation_date
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                blood_type =
                    EXCLUDED.blood_type,

                allergies =
                    EXCLUDED.allergies,

                medications =
                    EXCLUDED.medications,

                conditions =
                    EXCLUDED.conditions,

                neurological_conditions =
                    EXCLUDED.neurological_conditions,

                card_validation_date =
                    EXCLUDED.card_validation_date
            `,
            [
                userId,
                bloodType || "",
                allergies || "",
                medications || "",
                conditions || "",
                neurologicalConditions || "",
                normalizeDate(
                    cardValidationDate
                )
            ]
        );

        await client.query(
            "COMMIT"
        );

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
                                    'relationship', ec.relationship,
                                    'email', ec.email
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

                WHERE u.id = $1

                LIMIT 1
                `,
                [userId]
            );

        return res
            .status(200)
            .json({
                message:
                    "Informações médicas salvas com sucesso.",
                user:
                    formatUser(
                        result.rows[0]
                    )
            });

    } catch (error) {
        await client.query(
            "ROLLBACK"
        );

        console.error(
            "Erro ao salvar informações médicas:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Erro ao salvar as informações médicas.",
                error:
                    error.message,
                code:
                    error.code ||
                    null
            });

    } finally {
        client.release();
    }
}

// ============================================================
// CONTATOS DE EMERGÊNCIA
// ============================================================

async function contacts(req, res) {
    const body =
        parseBody(req);

    let userId;

    if (
        req.method === "GET" ||
        req.method === "DELETE"
    ) {
        userId = Number(
            req.query?.userId
        );

        if (!userId && body) {
            userId = Number(
                body.userId
            );
        }
    } else {
        userId = Number(
            body?.userId
        );
    }

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return res
            .status(400)
            .json({
                message:
                    "Usuário inválido."
            });
    }

    // ========================================================
    // LISTAR CONTATOS
    // GET /api/auth?action=contacts&userId=1
    // ========================================================

    if (
        req.method === "GET"
    ) {
        try {
            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        phone,
                        relationship,
                        email
                    FROM emergency_contacts
                    WHERE user_id = $1
                    ORDER BY id
                    `,
                    [userId]
                );

            return res
                .status(200)
                .json({
                    contacts:
                        result.rows
                });

        } catch (error) {
            console.error(
                "Erro ao carregar contatos:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Erro ao carregar os contatos.",
                    error:
                        error.message,
                    code:
                        error.code ||
                        null
                });
        }
    }

    if (!body) {
        return res
            .status(400)
            .json({
                message:
                    "Dados inválidos."
            });
    }

    // ========================================================
    // ADICIONAR
    // POST /api/auth?action=contacts
    // ========================================================

    if (
        req.method === "POST"
    ) {
        const {
            name,
            phone,
            relationship,
            email
        } = body;

        if (
            !name ||
            !phone ||
            !relationship
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Preencha os campos obrigatórios."
                });
        }

        try {
            const result =
                await pool.query(
                    `
                    INSERT INTO emergency_contacts (
                        user_id,
                        name,
                        phone,
                        relationship,
                        email
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
                    RETURNING
                        id,
                        name,
                        phone,
                        relationship,
                        email
                    `,
                    [
                        userId,
                        name.trim(),
                        phone.trim(),
                        relationship.trim(),
                        email
                            ? email.trim()
                            : null
                    ]
                );

            return res
                .status(201)
                .json({
                    message:
                        "Contato adicionado com sucesso.",
                    contact:
                        result.rows[0]
                });

        } catch (error) {
            console.error(
                "Erro ao adicionar contato:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Erro ao adicionar o contato.",
                    error:
                        error.message,
                    code:
                        error.code ||
                        null
                });
        }
    }

    // ========================================================
    // EDITAR
    // PUT /api/auth?action=contacts
    // ========================================================

    if (
        req.method === "PUT"
    ) {
        const contactId =
            Number(
                body.contactId
            );

        const {
            name,
            phone,
            relationship,
            email
        } = body;

        if (
            !Number.isInteger(
                contactId
            ) ||
            contactId <= 0
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Contato inválido."
                });
        }

        if (
            !name ||
            !phone ||
            !relationship
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Preencha os campos obrigatórios."
                });
        }

        try {
            const result =
                await pool.query(
                    `
                    UPDATE emergency_contacts
                    SET
                        name = $1,
                        phone = $2,
                        relationship = $3,
                        email = $4
                    WHERE id = $5
                      AND user_id = $6
                    RETURNING
                        id,
                        name,
                        phone,
                        relationship,
                        email
                    `,
                    [
                        name.trim(),
                        phone.trim(),
                        relationship.trim(),
                        email
                            ? email.trim()
                            : null,
                        contactId,
                        userId
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Contato não encontrado."
                    });
            }

            return res
                .status(200)
                .json({
                    message:
                        "Contato atualizado com sucesso.",
                    contact:
                        result.rows[0]
                });

        } catch (error) {
            console.error(
                "Erro ao atualizar contato:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Erro ao atualizar o contato.",
                    error:
                        error.message,
                    code:
                        error.code ||
                        null
                });
        }
    }

    // ========================================================
    // EXCLUIR
    // DELETE /api/auth?action=contacts&userId=1&contactId=1
    // ========================================================

    if (
        req.method === "DELETE"
    ) {
        const contactId =
            Number(
                req.query?.contactId
            );

        if (
            !Number.isInteger(
                contactId
            ) ||
            contactId <= 0
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Contato inválido."
                });
        }

        try {
            const result =
                await pool.query(
                    `
                    DELETE FROM emergency_contacts
                    WHERE id = $1
                      AND user_id = $2
                    RETURNING id
                    `,
                    [
                        contactId,
                        userId
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Contato não encontrado."
                    });
            }

            return res
                .status(200)
                .json({
                    message:
                        "Contato excluído com sucesso."
                });

        } catch (error) {
            console.error(
                "Erro ao excluir contato:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Erro ao excluir o contato.",
                    error:
                        error.message,
                    code:
                        error.code ||
                        null
                });
        }
    }

    return res
        .status(405)
        .json({
            message:
                "Método não permitido."
        });
}
// ============================================================
// CONFIGURAÇÕES
// ============================================================

async function config(req, res) {
    if (req.method !== "PUT") {
        return res
            .status(405)
            .json({
                message:
                    "Método não permitido."
            });
    }

    const body =
        parseBody(req);

    if (!body) {
        return res
            .status(400)
            .json({
                message:
                    "Dados inválidos."
            });
    }

    const userId =
        Number(body.userId);

    const email =
        body.email
            ?.trim()
            .toLowerCase();

    const password =
        body.password || "";

    const settings =
        body.settings || {};

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return res
            .status(400)
            .json({
                message:
                    "Usuário inválido."
            });
    }

    if (
        !email ||
        !email.includes("@")
    ) {
        return res
            .status(400)
            .json({
                message:
                    "Informe um e-mail válido."
            });
    }

    if (
        password &&
        password.length < 6
    ) {
        return res
            .status(400)
            .json({
                message:
                    "A senha deve possuir pelo menos 6 caracteres."
            });
    }

    const client =
        await pool.connect();

    try {
        await client.query(
            "BEGIN"
        );

        const existingEmail =
            await client.query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                  AND id <> $2
                LIMIT 1
                `,
                [
                    email,
                    userId
                ]
            );

        if (
            existingEmail.rows.length > 0
        ) {
            await client.query(
                "ROLLBACK"
            );

            return res
                .status(409)
                .json({
                    message:
                        "Já existe uma conta cadastrada com este e-mail."
                });
        }

        const passwordHash =
            password
                ? hashPassword(password)
                : null;

        const userResult =
            await client.query(
                `
                UPDATE users
                SET
                    email = $1,

                    password_hash =
                        COALESCE(
                            $2,
                            password_hash
                        ),

                    show_medical_info = $3,
                    public_card = $4,
                    notifications = $5

                WHERE id = $6
                RETURNING id
                `,
                [
                    email,
                    passwordHash,

                    settings.showMedicalInfo ??
                        true,

                    settings.publicCard ??
                        false,

                    settings.notifications ??
                        false,

                    userId
                ]
            );

        if (
            userResult.rows.length === 0
        ) {
            await client.query(
                "ROLLBACK"
            );

            return res
                .status(404)
                .json({
                    message:
                        "Usuário não encontrado."
                });
        }

        await client.query(
            "COMMIT"
        );

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
                                    'relationship', ec.relationship,
                                    'email', ec.email
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

                WHERE u.id = $1

                LIMIT 1
                `,
                [userId]
            );

        return res
            .status(200)
            .json({
                message:
                    "Configurações salvas com sucesso.",

                user:
                    formatUser(
                        result.rows[0]
                    )
            });

    } catch (error) {
        await client.query(
            "ROLLBACK"
        );

        console.error(
            "Erro ao salvar configurações:",
            error
        );

        if (
            error.code === "23505"
        ) {
            return res
                .status(409)
                .json({
                    message:
                        "E-mail já cadastrado."
                });
        }

        return res
            .status(500)
            .json({
                message:
                    "Erro ao salvar as configurações.",

                error:
                    error.message,

                code:
                    error.code ||
                    null
            });

    } finally {
        client.release();
    }
}

