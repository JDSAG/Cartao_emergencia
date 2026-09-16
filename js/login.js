document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginMessage = document.getElementById("loginMessage");

    // Mostrar / ocultar senha
    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";

        togglePassword.innerHTML = isPassword ? `<i data-lucide="eye-off" class="w-5 h-5"></i>` : `<i data-lucide="eye" class="w-5 h-5"></i>`;

        lucide.createIcons();
    });

    //Função para exibir mensagem
    function showMessage(message, type = "error") {
        loginMessage.textContent = message;

        loginMessage.classList.remove("hidden", "bg-red-500/10", "border-red-500/20", "text-red-400", "bg-green-500/10", "border-green-500/20", "text-green-400");

        loginMessage.classList.add("border");

        if (type === "success") {
            loginMessage.classList.add("bg-green-500/10", "border-green-500/20", "text-green-400");
        } else {
            loginMessage.classList.add("bg-red-500/10", "border-red-500/20", "text-red-400");
        }
    }

    //Login
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();

        const password = passwordInput.value;

        //Validação básica
        if (!email || !password) {
            showMessage("Preencha todos os campos.");

            return;
        }

        //Recuperar usuário salvo
        const savedUser = localStorage.getItem("medalert_user");

        if (!savedUser) {
            showMessage("Nenhuma conta encontrada. Cadastre-se para continuar.");

            return;
        }

        const user = JSON.parse(savedUser);

        //Verificar credenciais
        if (email !== user.email || password !== user.password) {
            showMessage("E-mail ou senha incorretos.");

            return;
        }

        //Login realizado
        localStorage.setItem( "medalert_logged", "true");

        localStorage.setItem("medalert_current_user", JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            })
        );

        showMessage("Login realizado com sucesso!", "success");

        //Redirecionar
        setTimeout(() => {
            window.location.href ="";
        }, 800);
    });
});