document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginMessage = document.getElementById("loginMessage");

    const API_URL =
        "https://cartaoemergencial.vercel.app/api/auth";

    // Mostrar / ocultar senha
    togglePassword.addEventListener("click", () => {
        const isPassword =
            passwordInput.type === "password";

        passwordInput.type = isPassword
            ? "text"
            : "password";

        togglePassword.innerHTML = isPassword
            ? `<i data-lucide="eye-off" class="w-5 h-5"></i>`
            : `<i data-lucide="eye" class="w-5 h-5"></i>`;

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    });

    // Mensagem
    function showMessage(message, type = "error") {
        loginMessage.textContent = message;

        loginMessage.classList.remove(
            "hidden",
            "bg-red-500/10",
            "border-red-500/20",
            "text-red-400",
            "bg-green-500/10",
            "border-green-500/20",
            "text-green-400"
        );

        loginMessage.classList.add("border");

        if (type === "success") {
            loginMessage.classList.add(
                "bg-green-500/10",
                "border-green-500/20",
                "text-green-400"
            );
        } else {
            loginMessage.classList.add(
                "bg-red-500/10",
                "border-red-500/20",
                "text-red-400"
            );
        }
    }

    // Login
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Preencha todos os campos.");
            return;
        }

        const submitButton =
            loginForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.disabled = true;
        submitButton.textContent = "Entrando...";

        try {
            console.log(
                "1. Enviando login para o backend..."
            );

            const response = await fetch(
                `${API_URL}?action=login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            console.log(
                "2. Resposta do backend:",
                response.status
            );

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "O servidor não retornou uma resposta válida."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "E-mail ou senha incorretos."
                );
            }

            if (!data.user) {
                throw new Error(
                    "Não foi possível carregar os dados da conta."
                );
            }

            const user = data.user;

            console.log(
                "3. Login realizado:",
                user.id
            );

            localStorage.setItem(
                "medalert_logged",
                "true"
            );

            localStorage.setItem(
                "medalert_current_user",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "medalert_user",
                JSON.stringify(user)
            );

            showMessage(
                "Login realizado com sucesso!",
                "success"
            );

            setTimeout(() => {
                window.location.href =
                    "dashboard.html";
            }, 800);

        } catch (error) {
            console.error(
                "Erro ao fazer login:",
                error
            );

            showMessage(
                error.message ||
                "E-mail ou senha incorretos."
            );

            submitButton.disabled = false;
            submitButton.textContent = "Entrar";
        }
    });
});