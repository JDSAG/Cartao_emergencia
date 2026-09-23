document.addEventListener("DOMContentLoaded", () => {
    //Autenticação
    const loggedUser = localStorage.getItem("medalert_logged");

    if (loggedUser !== "true") {
        window.location.href = "login.html";
        
        return;
    }

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

    // Elementos
    const form = document.getElementById("healthForm");
    const formMessage = document.getElementById("formMessage");

    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    const bloodType = document.getElementById("bloodType");
    const birthDate = document.getElementById("birthDate");

    const allergies = document.getElementById("allergies");
    const medications = document.getElementById("medications");
    const conditions = document.getElementById("conditions");

    const neurologicalConditions = document.querySelectorAll('input[name="neurologicalConditions"]');

    const otherNeurologicalCondition = document.getElementById("otherNeurologicalCondition");

    // Funções auxiliares
    function getInitials(name) {
        if (!name) return "US";

        const names = name.trim().split(/\s+/);

        if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        }

        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    function showMessage(message, type = "success") {
        if (!formMessage) return;

        formMessage.textContent = message;

        formMessage.className = type === "success" ? "text-sm text-green-400 mb-4" : "text-sm text-red-400 mb-4";
    }

    // Dados da sidebar
    const fullName = user.fullName || user.name || "Usuário";

    const email = user.email || "Email não informado";

    if (sidebarName) {
        sidebarName.textContent = fullName;
    }

    if (sidebarEmail) {
        sidebarEmail.textContent = email;
    }

    if (sidebarAvatar) {
        sidebarAvatar.textContent = getInitials(fullName);
    }

    // Carregar dados salvos
    if (bloodType) {
        bloodType.value = user.bloodType || "";
    }

    if (birthDate) {
        birthDate.value = user.birthDate || "";
    }

    if (allergies) {
        allergies.value = user.allergies || "";
    }

    if (medications) {
        medications.value = user.medications || "";
    }

    if (conditions) {
        conditions.value = user.conditions || "";
    }

    // Condições neurológicas salvas
    if (user.neurologicalConditions) {

        const savedConditions = user.neurologicalConditions.split(",").map(condition => condition.trim());

        neurologicalConditions.forEach(checkbox => {
            if (savedConditions.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });

        // Recuperar condição personalizada
        const predefinedValues = Array.from(neurologicalConditions).map(checkbox => checkbox.value);

        const customCondition = savedConditions.find(condition => !predefinedValues.includes(condition));

        if (customCondition && otherNeurologicalCondition) {
            otherNeurologicalCondition.value = customCondition;
        }
    }

    // Opção "nenhuma"
    neurologicalConditions.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            if (checkbox.value === "Nenhuma" && checkbox.checked) {
                neurologicalConditions.forEach(otherCheckbox => {
                    if (otherCheckbox !== checkbox) {
                        otherCheckbox.checked = false;
                    }
                });

                if (otherNeurologicalCondition) {
                    otherNeurologicalCondition.value = "";
                }
            }

            if (checkbox.value !== "Nenhuma" && checkbox.checked) {
                const noneCheckbox = document.querySelector('input[name="neurologicalConditions"][value="Nenhuma"]');

                if (noneCheckbox) {
                    noneCheckbox.checked = false;
                }
            }
        });
    });

    // Salvar formulário
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const selectedConditions = [];

            neurologicalConditions.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedConditions.push(checkbox.value);
                }
            });

            // Condição personalizada
            if (otherNeurologicalCondition && otherNeurologicalCondition.value.trim() !== "") {
                selectedConditions.push(otherNeurologicalCondition.value.trim());
            }

            // Data atual de validação
            const currentDate = new Date().toISOString().split("T")[0];

            // Atualizar dados
            user.bloodType = bloodType ? bloodType.value : "";

            user.birthDate = birthDate ? birthDate.value : "";

            user.cardValidationDate = currentDate;

            user.neurologicalConditions = selectedConditions.join(", ");

            user.allergies = allergies ? allergies.value.trim() : "";

            user.medications = medications ? medications.value.trim() : "";

            user.conditions = conditions ? conditions.value.trim() : "";

            // Salvar no localStorage
            localStorage.setItem("medalert_current_user", JSON.stringify(user));

            localStorage.setItem("medalert_user", JSON.stringify(user));

            // Mensagem de sucesso
            showMessage("Informações salvas com sucesso!", "success");

            // Redirecionar
            setTimeout(() => {
                window.location.href = "card.html";
            }, 1000);
        });
    }

    // Logout
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            const confirmLogout = confirm("Deseja realmente sair da sua conta?");

            if (!confirmLogout) return;

            localStorage.removeItem("medalert_logged");
            localStorage.removeItem("medalert_current_user");

            window.location.href = "login.html";
        });
    }
});