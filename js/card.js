document.addEventListener("DOMContentLoaded", () => {
    // Autenticação
    const loggedUser = localStorage.getItem("medalert_logged");

    if (loggedUser !== "true") {
        window.location.href = "login.html";
        
        return;
    }

    // Recuperar usuário atual
    const userData =localStorage.getItem("medalert_current_user") || localStorage.getItem("medalert_user");

    if (!userData) {
        window.location.href = "login.html";
        
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Erro ao carregar os dados do usuário:", error);
        
        window.location.href = "login.html";
        
        return;
    }

    // Elementos
    const profileName = document.getElementById("profileName");
    const profileAvatar = document.getElementById("profileAvatar");

    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    const profileBirthDate = document.getElementById("profileBirthDate");

    const cardValidationDate = document.getElementById("cardValidationDate");

    const bloodType = document.getElementById("bloodType");
    const allergies = document.getElementById("allergies");
    const medications = document.getElementById("medications");
    const conditions = document.getElementById("conditions");

    const neurologicalConditions = document.getElementById("neurologicalConditions");

    const emergencyContactName = document.getElementById("emergencyContactName");

    const emergencyContactPhone = document.getElementById("emergencyContactPhone");

    // Funções auxiliares
    function displayValue(value) {
        if (!value || value.length === 0) {
            return "Não informado";
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(", ") : "Não informado";
        }

        return value;
    }

    function getInitials(name) {
        if (!name) return "US";

        const names = name.trim().split(" ");

        if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        }

        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    function formatDate(date) {
        if (!date) {
            return "Não informado";
        }

        const parts = date.split("-");

        if (parts.length !== 3) {
            return date;
        }

        const [year, month, day] = parts;

        return `${day}/${month}/${year}`;
    }

    //Dados do usuário
    const fullName = user.fullName || user.name || "Nome não informado";

    const email = user.email || "Email não informado";

    const initials = getInitials(fullName);

    // Informações da barra lateral
    if (sidebarName) {
        sidebarName.textContent = fullName;
    }

    if (sidebarEmail) {
        sidebarEmail.textContent = email;
    }

    if (sidebarAvatar) {
        sidebarAvatar.textContent = initials;
    }

    // Nome e avatar do cartão
    if (profileName) {
        profileName.textContent = fullName;
    }

    if (profileAvatar) {
        profileAvatar.textContent = initials;
    }

    // Informações pessoais

    if (profileBirthDate) {
        profileBirthDate.textContent = formatDate(user.birthDate);
    }

    if (cardValidationDate) {
        cardValidationDate.textContent = formatDate(user.cardValidationDate);
    }

    // Informações de saúde
    if (bloodType) {
        bloodType.textContent = displayValue(user.bloodType);
    }

    if (allergies) {
        allergies.textContent = displayValue(user.allergies);
    }

    if (medications) {
        medications.textContent = displayValue(user.medications);
    }

    if (conditions) {
        conditions.textContent = displayValue(user.conditions);
    }

    if (neurologicalConditions) {
        neurologicalConditions.textContent = displayValue(user.neurologicalConditions);
    }

    // Contato de emergência
    if (emergencyContactName) {
        emergencyContactName.textContent = displayValue(user.emergencyContactName);
    }

    if (emergencyContactPhone) {
        emergencyContactPhone.textContent = user.emergencyContactPhone || "Telefone não informado";
    }

    // Logout
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            const confirmLogout = confirm("Deseja realmente sair da sua conta?");

            if (!confirmLogout) {
                return;
            }

            localStorage.removeItem("medalert_logged");
            localStorage.removeItem("medalert_current_user");

            window.location.href = "login.html";
        });
    }
});