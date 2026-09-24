document.addEventListener("DOMContentLoaded", () => {
    // Autenticação
    const loggedUser = localStorage.getItem("medalert_logged");

    if (loggedUser !== "true") {
        window.location.href = "login.html";
        
        return;
    }

    // Elementos do formulário
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const showMedicalInfo = document.getElementById("showMedicalInfo");
    const publicCard = document.getElementById("publicCard");
    const notifications = document.getElementById("notifications");

    const saveSettingsButton = document.getElementById("saveSettings");
    const logoutButton = document.getElementById("logoutButton");
    const logoutButtonMobile = document.getElementById("logoutButtonMobile");

    const formMessage = document.getElementById("formMessage");

    // Recuperar dados do usuário
    const userData = localStorage.getItem("medalert_current_user") || localStorage.getItem("medalert_user");

    if (!userData) {
        window.location.href = "login.html";
        
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        
        window.location.href = "login.html";
        
        return;
    }

    // Configurações padrão
    user.settings = { 
        showMedicalInfo: true,
        publicCard: false,
        notifications: false,
        ...user.settings
    };

    // Carregar dados nos campos
    emailInput.value = user.email || "";

    showMedicalInfo.checked = user.settings.showMedicalInfo;
    publicCard.checked = user.settings.publicCard;
    notifications.checked = user.settings.notifications;

    // Exibir mensagem
    function showMessage(message, type = "success") {
        formMessage.textContent = message;

        formMessage.classList.remove("hidden", "text-green-400", "text-red-400");

        if (type === "success") {
            formMessage.classList.add("text-green-400");
        } else {
            formMessage.classList.add("text-red-400");
        }

        setTimeout(() => {
            formMessage.classList.add("hidden");
        }, 4000);
    }

    // Salvar configurações
    saveSettingsButton.addEventListener("click", () => {
        const newEmail = emailInput.value.trim();
        const newPassword = passwordInput.value.trim();

        // Validar e-mail
        if (!newEmail) {
            showMessage("Informe um e-mail válido.", "error");
            
            emailInput.focus();
            
            return;
        }

        if (!newEmail.includes("@")) {
            showMessage("Digite um e-mail válido.", "error");
            
            emailInput.focus();
            
            return;
        }

        // Atualizar e-mail
        user.email = newEmail;

        // Atualizar senha somente se preenchida
        if (newPassword !== "") {
            user.password = newPassword;
        }

        // Atualizar preferências
        user.settings = {
            showMedicalInfo: showMedicalInfo.checked,
            publicCard: publicCard.checked,
            notifications: notifications.checked
        };

        // Salvar dados atualizados
        const updatedUserData = JSON.stringify(user);

        localStorage.setItem("medalert_current_user", updatedUserData);
        localStorage.setItem("medalert_user", updatedUserData);

        // Limpar campo de senha
        passwordInput.value = "";

        showMessage("Configurações salvas com sucesso! ✅");
    });

    // Cancelar alterações
    const cancelButton = document.getElementById("cancelSettings");

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            emailInput.value = user.email || "";

            passwordInput.value = "";

            showMedicalInfo.checked = user.settings.showMedicalInfo;

            publicCard.checked = user.settings.publicCard;

            notifications.checked = user.settings.notifications;

            showMessage("Alterações canceladas.");
        });
    }

    // Função de logout
    function logout() {
        localStorage.removeItem("medalert_logged");
        localStorage.removeItem("medalert_current_user");

        window.location.href = "login.html";
    }

    // Logout desktop
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    // Logout mobile
    if (logoutButtonMobile) {
        logoutButtonMobile.addEventListener("click", logout);
    }

    // Inicializar ícones Lucide
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
});