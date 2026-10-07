const crypto = require("crypto");

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");

    return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash) {
        return false;
    }

    const parts = storedHash.split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt") {
        return false;
    }

    const calculatedBuffer = Buffer.from(
        crypto.scryptSync(password, parts[1], 64).toString("hex"),
        "hex"
    );
    const savedBuffer = Buffer.from(parts[2], "hex");

    return calculatedBuffer.length === savedBuffer.length &&
        crypto.timingSafeEqual(calculatedBuffer, savedBuffer);
}

function createPublicToken() {
    return crypto.randomBytes(32).toString("hex");
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
    if (!value || typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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
        birthDate: user.birth_date || "",
        bloodType: user.blood_type || "",
        allergies: user.allergies || "",
        medications: user.medications || "",
        conditions: user.conditions || "",
        neurologicalConditions: user.neurological_conditions || "",
        cardValidationDate: user.card_validation_date || "",
        emergencyContacts: user.emergency_contacts || [],
        settings: {
            showMedicalInfo: user.show_medical_info ?? true,
            publicCard: user.public_card ?? false,
            notifications: user.notifications ?? false,
            publicToken: user.public_token || null
        }
    };
}

module.exports = {
    hashPassword,
    verifyPassword,
    createPublicToken,
    parseBody,
    normalizeDate,
    formatUser
};
