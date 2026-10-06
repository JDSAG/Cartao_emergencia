document.addEventListener("DOMContentLoaded", () => {
    // Autenticação
    const loggedUser =
        localStorage.getItem("medalert_logged");

    if (loggedUser !== "true") {
        window.location.href = "login.html";
        return;
    }

    const userData =
        localStorage.getItem("medalert_current_user") ||
        localStorage.getItem("medalert_user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error(
            "Erro ao carregar os dados:",
            error
        );

        window.location.href = "login.html";
        return;
    }

    const API_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
            ? "https://cartaoemergencial.vercel.app/api/auth"
            : "/api/auth";

    // Elementos
    const form =
        document.getElementById("healthForm");

    const formMessage =
        document.getElementById("formMessage");

    const sidebarName =
        document.getElementById("sidebarName");

    const sidebarEmail =
        document.getElementById("sidebarEmail");

    const sidebarAvatar =
        document.getElementById("sidebarAvatar");

    const bloodType =
        document.getElementById("bloodType");

    const birthDate =
        document.getElementById("birthDate");

    const allergies =
        document.getElementById("allergies");

    const medications =
        document.getElementById("medications");

    const conditions =
        document.getElementById("conditions");

    const neurologicalConditions =
        document.querySelectorAll(
            'input[name="neurologicalConditions"]'
        );

    const otherNeurologicalCondition =
        document.getElementById(
            "otherNeurologicalCondition"
        );

    // Funções auxiliares
    function getInitials(name) {
        if (!name) return "US";

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

    function showMessage(
        message,
        type = "success"
    ) {
        if (!formMessage) return;

        formMessage.textContent = message;

        formMessage.className =
            type === "success"
                ? "text-sm text-green-400 mb-4"
                : "text-sm text-red-400 mb-4";
    }

    function saveUserLocally(updatedUser) {
        user = {
            ...user,
            ...updatedUser
        };

        localStorage.setItem(
            "medalert_current_user",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "medalert_user",
            JSON.stringify(user)
        );
    }

    function loadFormData(data) {
        if (bloodType) {
            bloodType.value =
                data.bloodType || "";
        }

        if (birthDate) {
            birthDate.value =
                data.birthDate || "";
        }

        if (allergies) {
            allergies.value =
                data.allergies || "";
        }

        if (medications) {
            medications.value =
                data.medications || "";
        }

        if (conditions) {
            conditions.value =
                data.conditions || "";
        }

        neurologicalConditions.forEach(
            checkbox => {
                checkbox.checked = false;
            }
        );

        if (otherNeurologicalCondition) {
            otherNeurologicalCondition.value = "";
        }

        if (data.neurologicalConditions) {
            const savedConditions =
                data.neurologicalConditions
                    .split(",")
                    .map(condition =>
                        condition.trim()
                    )
                    .filter(Boolean);

            neurologicalConditions.forEach(
                checkbox => {
                    if (
                        savedConditions.includes(
                            checkbox.value
                        )
                    ) {
                        checkbox.checked = true;
                    }
                }
            );

            const predefinedValues =
                Array.from(
                    neurologicalConditions
                ).map(
                    checkbox =>
                        checkbox.value
                );

            const customCondition =
                savedConditions.find(
                    condition =>
                        !predefinedValues.includes(
                            condition
                        )
                );

            if (
                customCondition &&
                otherNeurologicalCondition
            ) {
                otherNeurologicalCondition.value =
                    customCondition;
            }
        }
    }

    // Sidebar
    const fullName =
        user.fullName ||
        user.name ||
        "Usuário";

    const email =
        user.email ||
        "Email não informado";

    if (sidebarName) {
        sidebarName.textContent =
            fullName;
    }

    if (sidebarEmail) {
        sidebarEmail.textContent =
            email;
    }

    if (sidebarAvatar) {
        sidebarAvatar.textContent =
            getInitials(fullName);
    }

    // ========================================================
    // CARREGAR INFORMAÇÕES MÉDICAS
    // ========================================================

    async function loadMedicalData() {
        try {
            if (!user.id) {
                throw new Error(
                    "Usuário sem ID."
                );
            }

            const response =
                await fetch(
                    `${API_URL}?action=medical&userId=${encodeURIComponent(
                        user.id
                    )}`
                );

            const responseText =
                await response.text();

            console.log(
                "Resposta ao carregar informações médicas:",
                response.status,
                responseText
            );

            let data = {};

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                throw new Error(
                    `O servidor retornou uma resposta inválida: ${responseText.substring(
                        0,
                        300
                    )}`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Não foi possível carregar as informações médicas."
                );
            }

            const medical =
                data.medical || {};

            loadFormData(medical);

            saveUserLocally({
                birthDate:
                    medical.birthDate || "",

                bloodType:
                    medical.bloodType || "",

                allergies:
                    medical.allergies || "",

                medications:
                    medical.medications || "",

                conditions:
                    medical.conditions || "",

                neurologicalConditions:
                    medical.neurologicalConditions ||
                    "",

                cardValidationDate:
                    medical.cardValidationDate ||
                    ""
            });

        } catch (error) {
            console.error(
                "Erro ao carregar informações médicas:",
                error
            );

            showMessage(
                error.message ||
                "Não foi possível carregar as informações médicas.",
                "error"
            );

            // Fallback para os dados locais
            loadFormData(user);
        }
    }

    loadMedicalData();

    // ========================================================
    // CONDIÇÕES NEUROLÓGICAS
    // ========================================================

    neurologicalConditions.forEach(
        checkbox => {
            checkbox.addEventListener(
                "change",
                () => {
                    if (
                        checkbox.value ===
                            "Nenhuma" &&
                        checkbox.checked
                    ) {
                        neurologicalConditions.forEach(
                            otherCheckbox => {
                                if (
                                    otherCheckbox !==
                                    checkbox
                                ) {
                                    otherCheckbox.checked =
                                        false;
                                }
                            }
                        );

                        if (
                            otherNeurologicalCondition
                        ) {
                            otherNeurologicalCondition.value =
                                "";
                        }
                    }

                    if (
                        checkbox.value !==
                            "Nenhuma" &&
                        checkbox.checked
                    ) {
                        const noneCheckbox =
                            document.querySelector(
                                'input[name="neurologicalConditions"][value="Nenhuma"]'
                            );

                        if (noneCheckbox) {
                            noneCheckbox.checked =
                                false;
                        }
                    }
                }
            );
        }
    );

    // ========================================================
    // SALVAR FORMULÁRIO
    // ========================================================

    if (form) {
        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const selectedConditions =
                    [];

                neurologicalConditions.forEach(
                    checkbox => {
                        if (
                            checkbox.checked
                        ) {
                            selectedConditions.push(
                                checkbox.value
                            );
                        }
                    }
                );

                if (
                    otherNeurologicalCondition &&
                    otherNeurologicalCondition.value
                        .trim() !== ""
                ) {
                    selectedConditions.push(
                        otherNeurologicalCondition.value
                            .trim()
                    );
                }

                const currentDate =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                const medicalData = {
                    userId: Number(user.id),

                    birthDate:
                        birthDate
                            ? birthDate.value
                            : "",

                    bloodType:
                        bloodType
                            ? bloodType.value
                            : "",

                    allergies:
                        allergies
                            ? allergies.value.trim()
                            : "",

                    medications:
                        medications
                            ? medications.value.trim()
                            : "",

                    conditions:
                        conditions
                            ? conditions.value.trim()
                            : "",

                    neurologicalConditions:
                        selectedConditions.join(
                            ", "
                        ),

                    cardValidationDate:
                        currentDate
                };

                if (
                    !Number.isInteger(
                        medicalData.userId
                    ) ||
                    medicalData.userId <= 0
                ) {
                    showMessage(
                        "Usuário inválido. Faça login novamente.",
                        "error"
                    );

                    return;
                }

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                if (submitButton) {
                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Salvando...";
                }

                try {
                    console.log(
                        "Enviando informações médicas:",
                        medicalData
                    );

                    const response =
                        await fetch(
                            `${API_URL}?action=medical`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        medicalData
                                    )
                            }
                        );

                    const responseText =
                        await response.text();

                    console.log(
                        "Resposta ao salvar informações médicas:",
                        response.status,
                        responseText
                    );

                    let data = {};

                    try {
                        data = responseText
                            ? JSON.parse(
                                  responseText
                              )
                            : {};
                    } catch {
                        throw new Error(
                            `O servidor retornou uma resposta inválida: ${responseText.substring(
                                0,
                                300
                            )}`
                        );
                    }

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            data.message ||
                            "Não foi possível salvar as informações médicas."
                        );
                    }

                    if (data.user) {
                        saveUserLocally(
                            data.user
                        );
                    } else {
                        saveUserLocally({
                            birthDate:
                                medicalData.birthDate,

                            bloodType:
                                medicalData.bloodType,

                            allergies:
                                medicalData.allergies,

                            medications:
                                medicalData.medications,

                            conditions:
                                medicalData.conditions,

                            neurologicalConditions:
                                medicalData.neurologicalConditions,

                            cardValidationDate:
                                medicalData.cardValidationDate
                        });
                    }

                    showMessage(
                        "Informações salvas com sucesso!",
                        "success"
                    );

                    setTimeout(() => {
                        window.location.href =
                            "card.html";
                    }, 1000);

                } catch (error) {
                    console.error(
                        "Erro ao salvar informações:",
                        error
                    );

                    showMessage(
                        error.message ||
                        "Não foi possível salvar as informações.",
                        "error"
                    );

                } finally {
                    if (submitButton) {
                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Salvar informações";
                    }
                }
            }
        );
    }

    // ========================================================
    // LOGOUT
    // ========================================================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            () => {
                const confirmLogout =
                    confirm(
                        "Deseja realmente sair da sua conta?"
                    );

                if (!confirmLogout) {
                    return;
                }

                localStorage.removeItem(
                    "medalert_logged"
                );

                localStorage.removeItem(
                    "medalert_current_user"
                );

                window.location.href =
                    "login.html";
            }
        );
    }
});