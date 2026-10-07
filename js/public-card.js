document.addEventListener("DOMContentLoaded", () => {
    const loading =
        document.getElementById("loading");

    const error =
        document.getElementById("error");

    const errorMessage =
        document.getElementById("errorMessage");

    const cardContent =
        document.getElementById("cardContent");

    const profileName =
        document.getElementById("profileName");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const birthDate =
        document.getElementById("birthDate");

    const cardValidationDate =
        document.getElementById(
            "cardValidationDate"
        );

    const medicalSection =
        document.getElementById(
            "medicalSection"
        );

    const bloodType =
        document.getElementById("bloodType");

    const allergies =
        document.getElementById("allergies");

    const medications =
        document.getElementById("medications");

    const conditions =
        document.getElementById("conditions");

    const neurologicalConditions =
        document.getElementById(
            "neurologicalConditions"
        );

    const emergencyContactName =
        document.getElementById(
            "emergencyContactName"
        );

    const emergencyContactRelationship =
        document.getElementById(
            "emergencyContactRelationship"
        );

    const emergencyContactPhone =
        document.getElementById(
            "emergencyContactPhone"
        );

    function displayValue(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Não informado";
        }

        return value;
    }

    function getInitials(name) {
        if (!name) {
            return "US";
        }

        const names =
            name.trim().split(/\s+/);

        if (names.length === 1) {
            return names[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            names[0].charAt(0) +
            names[names.length - 1].charAt(0)
        ).toUpperCase();
    }

    function formatDate(date) {
        if (!date) {
            return "Não informado";
        }

        const parts =
            date.split("-");

        if (parts.length !== 3) {
            return date;
        }

        const [year, month, day] =
            parts;

        return `${day}/${month}/${year}`;
    }

    function showError(message) {
        loading.classList.add("hidden");

        cardContent.classList.add(
            "hidden"
        );

        errorMessage.textContent =
            message;

        error.classList.remove(
            "hidden"
        );

        if (
            typeof lucide !== "undefined"
        ) {
            lucide.createIcons();
        }
    }

    // Recuperar token da URL
    const params =
        new URLSearchParams(
            window.location.search
        );

    const token =
        params.get("token");

    if (!token) {
        showError(
            "Token do cartão não informado."
        );

        return;
    }

    async function carregarCartao() {
        try {
            const response =
                await fetch(
                    `/api/public/token?token=${encodeURIComponent(
                        token
                    )}`
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Cartão indisponível."
                );
            }

            // Nome
            profileName.textContent =
                displayValue(
                    data.name
                );

            // Avatar
            profileAvatar.textContent =
                getInitials(
                    data.name
                );

            // Datas
            birthDate.textContent =
                formatDate(
                    data.birthDate
                );

            cardValidationDate.textContent =
                formatDate(
                    data.cardValidationDate
                );

            // Informações médicas
            if (data.medical) {
                bloodType.textContent =
                    displayValue(
                        data.medical.bloodType
                    );

                allergies.textContent =
                    displayValue(
                        data.medical.allergies
                    );

                medications.textContent =
                    displayValue(
                        data.medical.medications
                    );

                conditions.textContent =
                    displayValue(
                        data.medical.conditions
                    );

                neurologicalConditions.textContent =
                    displayValue(
                        data.medical
                            .neurologicalConditions
                    );
            } else {
                medicalSection.style.display =
                    "none";
            }

            // Contato de emergência
            const contact =
                data.emergencyContact;

            if (contact) {
                emergencyContactName.textContent =
                    displayValue(
                        contact.name
                    );

                emergencyContactRelationship.textContent =
                    displayValue(
                        contact.relationship
                    );

                emergencyContactPhone.textContent =
                    displayValue(
                        contact.phone
                    );
            } else {
                emergencyContactName.textContent =
                    "Não informado";

                emergencyContactRelationship.textContent =
                    "Não informado";

                emergencyContactPhone.textContent =
                    "Telefone não informado";
            }

            // Mostrar cartão
            loading.classList.add(
                "hidden"
            );

            cardContent.classList.remove(
                "hidden"
            );

            if (
                typeof lucide !== "undefined"
            ) {
                lucide.createIcons();
            }

        } catch (err) {
            console.error(
                "Erro ao carregar cartão público:",
                err
            );

            showError(
                err.message ||
                "Não foi possível carregar o cartão."
            );
        }
    }

    carregarCartao();
});