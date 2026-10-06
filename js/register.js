document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    const password = document.getElementById("password");
    const confirmPassword =
        document.getElementById("confirmPassword");

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );

    const cpf = document.getElementById("cpf");
    const phone = document.getElementById("phone");

    const message =
        document.getElementById("registerMessage");

    const API_URL =
        "https://cartaoemergencial.vercel.app/api/auth";

    // Mostrar / ocultar senha
    function toggleInput(input, button) {
        const isPassword =
            input.type === "password";

        input.type = isPassword
            ? "text"
            : "password";

        button.innerHTML = isPassword
            ? `<i data-lucide="eye-off" class="w-5 h-5"></i>`
            : `<i data-lucide="eye" class="w-5 h-5"></i>`;

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    togglePassword.addEventListener(
        "click",
        () => {
            toggleInput(
                password,
                togglePassword
            );
        }
    );

    toggleConfirmPassword.addEventListener(
        "click",
        () => {
            toggleInput(
                confirmPassword,
                toggleConfirmPassword
            );
        }
    );

    // Mensagem
    function showMessage(text, type = "error") {
        message.textContent = text;
        message.className =
            "rounded-xl px-4 py-3 text-sm border";

        if (type === "success") {
            message.classList.add(
                "bg-green-500/10",
                "border-green-500/20",
                "text-green-400"
            );
        } else {
            message.classList.add(
                "bg-red-500/10",
                "border-red-500/20",
                "text-red-400"
            );
        }
    }

    // CPF
    cpf.addEventListener("input", () => {
        let value =
            cpf.value.replace(/\D/g, "");

        value = value.substring(0, 11);

        if (value.length > 9) {
            value = value.replace(
                /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
                "$1.$2.$3-$4"
            );
        } else if (value.length > 6) {
            value = value.replace(
                /(\d{3})(\d{3})(\d+)/,
                "$1.$2.$3"
            );
        } else if (value.length > 3) {
            value = value.replace(
                /(\d{3})(\d+)/,
                "$1.$2"
            );
        }

        cpf.value = value;
    });

    // Telefone
    phone.addEventListener("input", () => {
        let value =
            phone.value.replace(/\D/g, "");

        value = value.substring(0, 11);

        if (value.length > 10) {
            value = value.replace(
                /(\d{2})(\d{5})(\d{1,4})/,
                "($1) $2-$3"
            );
        } else if (value.length > 6) {
            value = value.replace(
                /(\d{2})(\d{4})(\d+)/,
                "($1) $2-$3"
            );
        } else if (value.length > 2) {
            value = value.replace(
                /(\d{2})(\d+)/,
                "($1) $2"
            );
        }

        phone.value = value;
    });

    // Cadastro
    form.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const name = document
                .getElementById("name")
                .value
                .trim();

            const email = document
                .getElementById("email")
                .value
                .trim()
                .toLowerCase();

            const cpfValue =
                cpf.value.trim();

            const phoneValue =
                phone.value.trim();

            const passwordValue =
                password.value;

            const confirmPasswordValue =
                confirmPassword.value;

            const terms = document
                .getElementById("terms")
                .checked;

            if (name.length < 3) {
                showMessage(
                    "Digite seu nome completo."
                );
                return;
            }

            if (
                !email ||
                !email.includes("@")
            ) {
                showMessage(
                    "Digite um e-mail válido."
                );
                return;
            }

            if (
                cpfValue.replace(
                    /\D/g,
                    ""
                ).length !== 11
            ) {
                showMessage(
                    "Digite um CPF válido."
                );
                return;
            }

            if (
                phoneValue.replace(
                    /\D/g,
                    ""
                ).length < 10
            ) {
                showMessage(
                    "Digite um telefone válido."
                );
                return;
            }

            if (passwordValue.length < 6) {
                showMessage(
                    "A senha deve possuir pelo menos 6 caracteres."
                );
                return;
            }

            if (
                passwordValue !==
                confirmPasswordValue
            ) {
                showMessage(
                    "As senhas não coincidem."
                );
                return;
            }

            if (!terms) {
                showMessage(
                    "Você precisa aceitar os Termos de Uso."
                );
                return;
            }

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );

            submitButton.disabled = true;
            submitButton.textContent =
                "Criando conta...";

            try {
                console.log(
                    "1. Enviando cadastro para o backend..."
                );

                const response = await fetch(
                    `${API_URL}?action=register`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            cpf: cpfValue,
                            phone: phoneValue,
                            password:
                                passwordValue
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
                        "Não foi possível criar sua conta."
                    );
                }

                const user = data.user;

                if (!user) {
                    throw new Error(
                        "A conta foi criada, mas os dados não foram retornados."
                    );
                }

                console.log(
                    "3. Usuário criado:",
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
                    "Conta criada com sucesso! Redirecionando...",
                    "success"
                );

                setTimeout(() => {
                    window.location.href =
                        "dashboard.html";
                }, 1000);

            } catch (error) {
                console.error(
                    "Erro ao criar conta:",
                    error
                );

                showMessage(
                    error.message ||
                    "Não foi possível criar sua conta."
                );

                submitButton.disabled = false;
                submitButton.textContent =
                    "Criar minha conta";
            }
        }
    );
});