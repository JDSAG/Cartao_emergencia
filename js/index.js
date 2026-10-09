document.addEventListener("DOMContentLoaded", () => {
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    const renderIcons = () => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    const closeMobileMenu = () => {
        if (!mobileMenu || !mobileMenuButton) {
            return;
        }

        mobileMenu.classList.add("hidden");
        document.body.classList.remove("menu-open");
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenuButton.setAttribute("aria-label", "Abrir menu");
        mobileMenuButton.innerHTML = `<i data-lucide="menu" aria-hidden="true"></i>`;
        renderIcons();
    };

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");

            const isOpen = !mobileMenu.classList.contains("hidden");

            document.body.classList.toggle("menu-open", isOpen);
            mobileMenuButton.setAttribute("aria-expanded", isOpen.toString());
            mobileMenuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            mobileMenuButton.innerHTML = isOpen ? `<i data-lucide="x" aria-hidden="true"></i>` : `<i data-lucide="menu" aria-hidden="true"></i>`;

            renderIcons();
        });
    }

    const mobileLinks = document.querySelectorAll(".mobile-link");

    mobileLinks.forEach(link => {
        link.addEventListener("click", closeMobileMenu);
    });

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
    } else {
        animatedElements.forEach(element => {
            element.classList.add("animate-visible");
        });
    }
});
