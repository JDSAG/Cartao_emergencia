document.addEventListener("DOMContentLoaded", () => {
    // Verificar autenticação
    const logged = localStorage.getItem("medalert_logged");

    if (logged !== "true") {
        window.location.href = "login.html";
       
        return;
    }

    // Recuperar usuário
    const savedUser = localStorage.getItem("medalert_current_user");

    if (!savedUser) {
        window.location.href = "login.html";
        
        return;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        
        window.location.href = "login.html";
        
        return;
    }

    // Elementos
    const profileForm = document.getElementById("profileForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const cpfInput = document.getElementById("cpf");
    const phoneInput = document.getElementById("phone");

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");

    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");

    const profileAvatar = document.getElementById("profileAvatar");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    const formMessage = document.getElementById("formMessage");

    const logoutButton = document.getElementById("logoutButton");

    // Obter iniciais
    function getInitials(name) {
        if (!name) {
            return "US";
        }

        return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
    }

    // Preencher dados
    function loadUserData() {
        nameInput.value = user.name || "";
        emailInput.value = user.email || "";
        cpfInput.value = user.cpf || "";
        phoneInput.value = user.phone || "";

        updateUserInterface();
    }

    // Atualizar interface
    function updateUserInterface() {
        const name = user.name || "Usuário";
        const email = user.email || "E-mail não informado";
        const initials = getInitials(name);

        profileName.textContent = name;
        profileEmail.textContent = email;

        sidebarName.textContent = name;
        sidebarEmail.textContent = email;

        profileAvatar.textContent = initials;
        sidebarAvatar.textContent = initials;
    }

    // Máscara de CPF
    cpfInput.addEventListener("input", event => {
        let value = event.target.value.replace(/\D/g, "").slice(0, 11);

        value = value.replace(/(\d{3})(\d)/, "$1.$2");

        value = value.replace(/(\d{3})(\d)/, "$1.$2");

        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        event.target.value = value;
    });

    // Máscara de telefone
    phoneInput.addEventListener("input", event => {
        let value = event.target.value.replace(/\D/g, "").slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        }

        event.target.value = value;
    });

    // Exibir mensagem
    function showMessage(message, type = "success") {
        formMessage.textContent = message;

        formMessage.classList.remove("hidden", "bg-green-500/10", "text-green-400", "bg-red-500/10", "text-red-400");

        if (type === "success") {
            formMessage.classList.add( "bg-green-500/10", "text-green-400");
        } else {
            formMessage.classList.add("bg-red-500/10", "text-red-400");
        }
    }

    // Salvar alterações
    profileForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const cpf = cpfInput.value.trim();
        const phone = phoneInput.value.trim();

        if (name.length < 3) {
            showMessage("Digite um nome válido.", "error");

            nameInput.focus();
            
            return;
        }

        if (!email || !email.includes("@")) {
            showMessage("Digite um e-mail válido.", "error");

            emailInput.focus();
            
            return;
        }

        // Atualizar objeto
        user.name = name;
        user.email = email;
        user.cpf = cpf;
        user.phone = phone;

        /* Atualiza o usuário atual. Esta implementação é adequada apenas* para um protótipo local. */
        localStorage.setItem("medalert_current_user", JSON.stringify(user));

        // Atualizar também o usuário cadastrado
        localStorage.setItem("medalert_user", JSON.stringify(user));

        updateUserInterface();

        showMessage("Seus dados foram atualizados com sucesso!");
    });

    // Restaurar formulário
    profileForm.addEventListener("reset", () => {
        setTimeout(() => {
            loadUserData();
            
            formMessage.classList.add("hidden");
        }, 0);
    });

    // Logout
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

    // Carregar dados iniciais
    loadUserData();
});