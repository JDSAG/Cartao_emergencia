document.addEventListener("DOMContentLoaded", () => {
    // Autenticação
    const loggedUser =
        localStorage.getItem("medalert_logged");

    if (loggedUser !== "true") {
        window.location.href = "login.html";
        return;
    }

    // API
    const API_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
            ? "https://cartaoemergencial.vercel.app/api/auth"
            : "/api/auth";

    // Elementos do formulário
    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const showMedicalInfo =
        document.getElementById(
            "showMedicalInfo"
        );

    const publicCard =
        document.getElementById(
            "publicCard"
        );

    const notifications =
        document.getElementById(
            "notifications"
        );

    const saveSettingsButton =
        document.getElementById(
            "saveSettings"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const logoutButtonMobile =
        document.getElementById(
            "logoutButtonMobile"
        );

    const formMessage =
        document.getElementById(
            "formMessage"
        );

    const cancelButton =
        document.getElementById(
            "cancelSettings"
        );

    // Recuperar usuário
    const userData =
        localStorage.getItem(
            "medalert_current_user"
        ) ||
        localStorage.getItem(
            "medalert_user"
        );

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

    if (!user.id) {
        showMessage(
            "Não foi possível identificar sua conta.",
            "error"
        );
        return;
    }

    // Configurações padrão
    user.settings = {
        showMedicalInfo: true,
        publicCard: false,
        notifications: false,
        ...user.settings
    };

    // Carregar campos
    emailInput.value =
        user.email || "";

    showMedicalInfo.checked =
        user.settings.showMedicalInfo;

    publicCard.checked =
        user.settings.publicCard;

    notifications.checked =
        user.settings.notifications;

    // Mensagem
    function showMessage(
        message,
        type = "success"
    ) {
        if (!formMessage) {
            return;
        }

        formMessage.textContent =
            message;

        formMessage.classList.remove(
            "hidden",
            "text-green-400",
            "text-red-400"
        );

        if (type === "success") {
            formMessage.classList.add(
                "text-green-400"
            );
        } else {
            formMessage.classList.add(
                "text-red-400"
            );
        }

        setTimeout(() => {
            formMessage.classList.add(
                "hidden"
            );
        }, 4000);
    }

    // Atualizar localStorage
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

    // Ler resposta
    async function readResponse(response) {
        const responseText =
            await response.text();

        let data = {};

        try {
            data = responseText
                ? JSON.parse(responseText)
                : {};
        } catch {
            throw new Error(
                `Resposta inválida do servidor: ${responseText.substring(
                    0,
                    300
                )}`
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Não foi possível atualizar as configurações."
            );
        }

        return data;
    }

    // Salvar configurações
    saveSettingsButton.addEventListener(
        "click",
        async () => {
            const newEmail =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const newPassword =
                passwordInput.value;

            if (!newEmail) {
                showMessage(
                    "Informe um e-mail válido.",
                    "error"
                );

                emailInput.focus();
                return;
            }

            if (!newEmail.includes("@")) {
                showMessage(
                    "Digite um e-mail válido.",
                    "error"
                );

                emailInput.focus();
                return;
            }

            if (
                newPassword &&
                newPassword.length < 6
            ) {
                showMessage(
                    "A senha deve possuir pelo menos 6 caracteres.",
                    "error"
                );

                passwordInput.focus();
                return;
            }

            saveSettingsButton.disabled =
                true;

            saveSettingsButton.textContent =
                "Salvando...";

            try {
                const response =
                    await fetch(
                        `${API_URL}?action=config`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify({
                                    userId:
                                        Number(
                                            user.id
                                        ),

                                    email:
                                        newEmail,

                                    password:
                                        newPassword,

                                    settings: {
                                        showMedicalInfo:
                                            showMedicalInfo.checked,

                                        publicCard:
                                            publicCard.checked,

                                        notifications:
                                            notifications.checked
                                    }
                                })
                        }
                    );

                const data =
                    await readResponse(
                        response
                    );

                if (data.user) {
                    saveUserLocally(
                        data.user
                    );
                } else {
                    saveUserLocally({
                        email: newEmail,

                        settings: {
                            showMedicalInfo:
                                showMedicalInfo.checked,

                            publicCard:
                                publicCard.checked,

                            notifications:
                                notifications.checked,

                            publicToken:
                                user.settings
                                    .publicToken ||
                                null
                        }
                    });
                }

                passwordInput.value = "";

                showMessage(
                    "Configurações salvas com sucesso! ✅",
                    "success"
                );

            } catch (error) {
                console.error(
                    "Erro ao salvar configurações:",
                    error
                );

                showMessage(
                    error.message ||
                    "Não foi possível salvar as configurações.",
                    "error"
                );

            } finally {
                saveSettingsButton.disabled =
                    false;

                saveSettingsButton.textContent =
                    "Salvar configurações";
            }
        }
    );

    // Cancelar alterações
    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            () => {
                emailInput.value =
                    user.email || "";

                passwordInput.value = "";

                showMedicalInfo.checked =
                    user.settings
                        .showMedicalInfo;

                publicCard.checked =
                    user.settings
                        .publicCard;

                notifications.checked =
                    user.settings
                        .notifications;

                showMessage(
                    "Alterações canceladas.",
                    "success"
                );
            }
        );
    }

    // Logout
    function logout() {
        localStorage.removeItem(
            "medalert_logged"
        );

        localStorage.removeItem(
            "medalert_current_user"
        );

        localStorage.removeItem(
            "medalert_user"
        );

        window.location.href =
            "login.html";
    }

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logout
        );
    }

    if (logoutButtonMobile) {
        logoutButtonMobile.addEventListener(
            "click",
            logout
        );
    }

    // Lucide
    if (
        typeof lucide !== "undefined"
    ) {
        lucide.createIcons();
    }
});