const userDetailsQuery = `
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
    LEFT JOIN medical_info m ON m.user_id = u.id
`;

module.exports = {
    byEmail: `${userDetailsQuery} WHERE u.email = $1 LIMIT 1`,
    byId: `${userDetailsQuery} WHERE u.id = $1 LIMIT 1`
};
