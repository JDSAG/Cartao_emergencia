document.addEventListener("DOMContentLoaded", () => {
    // Ano atual
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Menu mobile
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");

            const isOpen = !mobileMenu.classList.contains("hidden");

            mobileMenuButton.setAttribute("aria-expanded", isOpen.toString());

            // Troca o ícone do botão
            mobileMenuButton.innerHTML = isOpen ? `<i data-lucide="x" class="w-6 h-6"></i>` : `<i data-lucide="menu" class="w-6 h-6"></i>`;
        });
    }

    // Fechar menu mobile ao clicar em um link
    const mobileLinks = document.querySelectorAll(".mobile-link");

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (mobileMenu) {
                mobileMenu.classList.add("hidden");
            }

            if (mobileMenuButton) {
                mobileMenuButton.setAttribute("aria-expanded", "false");

                mobileMenuButton.innerHTML = `<i data-lucide="menu" class="w-6 h-6"></i>`;
            }
        });
    });

    //Scroll suave
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    //Verificação de Login
    const logged = localStorage.getItem("medalert_logged");
    const loginLinks = document.querySelectorAll('a[href="./pages/login.html"]');
    const registerLinks = document.querySelectorAll('a[href="./pages/register.html"]');

    /*Se o usuário já estiver autenticado, podemos alterar os links principais para
    facilitar o acesso ao dashboard. Não redirecionamos automaticamente.*/
    if (logged === "true") {
        loginLinks.forEach(link => {
            link.textContent = "Entrar";
            link.href = "./pages/login.html";
        });

        registerLinks.forEach(link => {
            link.textContent = "Meu cartão";
            link.href = "";
        });
    }

    // Animação ao entrar na tela
    const animatedElements = document.querySelectorAll("[data-animate]");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-visible");

                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1
            }
        );

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
});