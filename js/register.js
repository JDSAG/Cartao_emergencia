document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const togglePassword = document.getElementById("togglePassword");
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const cpf = document.getElementById("cpf");
    const phone = document.getElementById("phone");
    const message = document.getElementById("registerMessage");

    //Mostrar / ocultar senha
    function toggleInput(input, button) {
        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        button.innerHTML = isPassword ? `<i data-lucide="eye-off" class="w-5 h-5"></i>` : `<i data-lucide="eye" class="w-5 h-5"></i>`;

        lucide.createIcons();
    }

    togglePassword.addEventListener("click", () => {
        toggleInput(password, togglePassword);
    });

    toggleConfirmPassword.addEventListener("click", () => {
        toggleInput(confirmPassword, toggleConfirmPassword);
    });

    //Mensagem
    function showMessage(text, type = "error") {
        message.textContent = text;

        message.className ="rounded-xl px-4 py-3 text-sm border";

        if (type === "success") {
            message.classList.add("bg-green-500/10", "border-green-500/20", "text-green-400");
        } else {
            message.classList.add("bg-red-500/10", "border-red-500/20", "text-red-400");
        }
    }

    //CPF
    cpf.addEventListener("input", () => {
        let value = cpf.value.replace(/\D/g, "");

        value = value.substring(0, 11);

        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d+)/, "$1.$2");
        }

        cpf.value = value;
    });

    //Telefone
    phone.addEventListener("input", () => {
        let value = phone.value.replace(/\D/g, "");

        value = value.substring(0, 11);

        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d+)/, "($1) $2");
        }

        phone.value = value;
    });

    //Submit
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        //Pagar valores
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const cpfValue = cpf.value.trim();
        const phoneValue = phone.value.trim();
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;
        const terms = document.getElementById("terms").checked;

        //Validações
        if (name.length < 3) {
            showMessage("Digite seu nome completo.");

            return;
        }

        if (!email) {
            showMessage("Digite um e-mail válido.");

            return;
        }

        if (cpfValue.replace(/\D/g, "").length !== 11) {
            showMessage("Digite um CPF válido.");

            return;
        }

        if (phoneValue.replace(/\D/g, "").length < 10) {
            showMessage("Digite um telefone válido.");

            return;
        }

        if (passwordValue.length < 6) {
            showMessage("A senha deve possuir pelo menos 6 caracteres.");

            return;
        }

        if (passwordValue !== confirmPasswordValue) {
            showMessage("As senhas não coincidem.");

            return;
        }

        if (!terms) {
            showMessage("Você precisa aceitar os Termos de Uso.");

            return;
        }

        //Verificar conta existente
        const existingUser = localStorage.getItem("medalert_user");

        if (existingUser) {
            const user = JSON.parse(existingUser);

            if (user.email === email) {
                showMessage("Já existe uma conta cadastrada com este e-mail.");

                return;
            }
        }

        //Criar usuário
        const user = {
            id: crypto.randomUUID(),
            name,
            email,
            cpf: cpfValue,
            phone: phoneValue,
            password: passwordValue,
            createdAt: new Date().toISOString()
        };

        //Salvar
        localStorage.setItem("medalert_user", JSON.stringify(user));

        //Sucesso
        showMessage("Conta criada com sucesso! Redirecionando para o login...", "success");

        //Redirecionar
        setTimeout(() => {
            window.location.href ="login.html";
        }, 1200);
    });
});