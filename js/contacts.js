document.addEventListener("DOMContentLoaded", () => {
    // Autenticação
    const loggedUser =
        localStorage.getItem(
            "medalert_logged"
        );

    if (loggedUser !== "true") {
        window.location.href = "login.html";
        return;
    }

    // Elementos do usuário
    const sidebarAvatar =
        document.getElementById(
            "sidebarAvatar"
        );

    const sidebarName =
        document.getElementById(
            "sidebarName"
        );

    const sidebarEmail =
        document.getElementById(
            "sidebarEmail"
        );

    // Elementos dos contatos
    const contactForm =
        document.getElementById(
            "contactForm"
        );

    const contactId =
        document.getElementById(
            "contactId"
        );

    const contactName =
        document.getElementById(
            "contactName"
        );

    const contactPhone =
        document.getElementById(
            "contactPhone"
        );

    const contactRelationship =
        document.getElementById(
            "contactRelationship"
        );

    const contactEmail =
        document.getElementById(
            "contactEmail"
        );

    const contactsList =
        document.getElementById(
            "contactsList"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    const formMessage =
        document.getElementById(
            "formMessage"
        );

    const cancelEdit =
        document.getElementById(
            "cancelEdit"
        );

    // API
    const API_URL =
        window.location.hostname ===
            "localhost" ||
        window.location.hostname ===
            "127.0.0.1"
            ? "https://cartaoemergencial.vercel.app/api/auth"
            : "/api/auth";

    // Usuário
    const userData =
        localStorage.getItem(
            "medalert_current_user"
        ) ||
        localStorage.getItem(
            "medalert_user"
        );

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(
            userData
        );
    } catch (error) {
        console.error(
            "Erro ao carregar os dados do usuário:",
            error
        );

        window.location.href = "login.html";
        return;
    }

    // Sidebar
    if (sidebarName) {
        sidebarName.textContent =
            user.fullName ||
            user.name ||
            "Usuário";
    }

    if (sidebarEmail) {
        sidebarEmail.textContent =
            user.email ||
            "usuário@email.com";
    }

    if (sidebarAvatar) {
        const name =
            user.fullName ||
            user.name ||
            "Usuário";

        sidebarAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }

    // ========================================================
    // AUXILIARES
    // ========================================================

    function saveUser() {
        const updatedUser =
            JSON.stringify(user);

        localStorage.setItem(
            "medalert_current_user",
            updatedUser
        );

        localStorage.setItem(
            "medalert_user",
            updatedUser
        );
    }

    function showMessage(
        message,
        type = "success"
    ) {
        if (!formMessage) {
            return;
        }

        formMessage.textContent =
            message;

        formMessage.classList.remove(
            "hidden",
            "text-green-400",
            "text-red-400"
        );

        if (type === "success") {
            formMessage.classList.add(
                "text-green-400"
            );
        } else {
            formMessage.classList.add(
                "text-red-400"
            );
        }

        setTimeout(() => {
            formMessage.classList.add(
                "hidden"
            );
        }, 3500);
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    function resetForm() {
        contactForm.reset();

        contactId.value = "";

        cancelEdit.classList.add(
            "hidden"
        );
    }

    // ========================================================
    // RENDERIZAÇÃO
    // ========================================================

    function renderContacts() {
        contactsList.innerHTML = "";

        if (
            user.emergencyContacts.length ===
            0
        ) {
            emptyMessage.classList.remove(
                "hidden"
            );

            return;
        }

        emptyMessage.classList.add(
            "hidden"
        );

        user.emergencyContacts.forEach(
            contact => {
                const contactCard =
                    document.createElement(
                        "div"
                    );

                contactCard.className =
                    "bg-gray-900 border border-gray-800 rounded-2xl p-5";

                contactCard.innerHTML = `
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-semibold">
                                ${escapeHTML(
                                    contact.name
                                )}
                            </h3>

                            <p class="text-gray-400 text-sm mt-1">
                                ${escapeHTML(
                                    contact.relationship ||
                                    ""
                                )}
                            </p>

                            <p class="text-gray-300 text-sm mt-3">
                                ${escapeHTML(
                                    contact.phone ||
                                    ""
                                )}
                            </p>

                            ${
                                contact.email
                                    ? `
                                        <p class="text-gray-400 text-sm mt-1">
                                            ${escapeHTML(
                                                contact.email
                                            )}
                                        </p>
                                    `
                                    : ""
                            }
                        </div>

                        <div class="flex gap-2">
                            <button
                                type="button"
                                data-action="edit"
                                data-id="${contact.id}"
                                class="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                            >
                                <i
                                    data-lucide="edit"
                                    class="w-4 h-4"
                                ></i>
                            </button>

                            <button
                                type="button"
                                data-action="delete"
                                data-id="${contact.id}"
                                class="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                            >
                                <i
                                    data-lucide="trash-2"
                                    class="w-4 h-4"
                                ></i>
                            </button>
                        </div>
                    </div>
                `;

                contactsList.appendChild(
                    contactCard
                );
            }
        );

        if (
            typeof lucide !== "undefined"
        ) {
            lucide.createIcons();
        }
    }

    // ========================================================
    // CARREGAR CONTATOS
    // ========================================================

    async function loadContacts() {
        try {
            const response =
                await fetch(
                    `${API_URL}?action=contacts&userId=${encodeURIComponent(
                        user.id
                    )}`
                );

            const responseText =
                await response.text();

            console.log(
                "Resposta ao carregar contatos:",
                response.status,
                responseText
            );

            let data = {};

            try {
                data = responseText
                    ? JSON.parse(
                          responseText
                      )
                    : {};
            } catch {
                throw new Error(
                    `Resposta inválida do servidor: ${responseText.substring(
                        0,
                        300
                    )}`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Não foi possível carregar os contatos."
                );
            }

            user.emergencyContacts =
                Array.isArray(
                    data.contacts
                )
                    ? data.contacts
                    : [];

            saveUser();
            renderContacts();

        } catch (error) {
            console.error(
                "Erro ao carregar contatos:",
                error
            );

            // Mantém os contatos locais como fallback
            renderContacts();
        }
    }

    // ========================================================
    // ADICIONAR / EDITAR
    // ========================================================

    contactForm.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const name =
                contactName.value.trim();

            const phone =
                contactPhone.value.trim();

            const relationship =
                contactRelationship.value.trim();

            const email =
                contactEmail.value.trim();

            if (
                !name ||
                !phone ||
                !relationship
            ) {
                showMessage(
                    "Preencha os campos obrigatórios.",
                    "error"
                );

                return;
            }

            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {
                submitButton.disabled =
                    true;

                submitButton.textContent =
                    contactId.value
                        ? "Atualizando..."
                        : "Salvando...";
            }

            try {
                // ====================================================
                // EDITAR
                // ====================================================

                if (contactId.value) {
                    const response =
                        await fetch(
                            `${API_URL}?action=contacts`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body:
                                    JSON.stringify({
                                        userId:
                                            Number(
                                                user.id
                                            ),

                                        contactId:
                                            Number(
                                                contactId.value
                                            ),

                                        name,
                                        phone,
                                        relationship,
                                        email
                                    })
                            }
                        );

                    const responseText =
                        await response.text();

                    let data = {};

                    try {
                        data =
                            responseText
                                ? JSON.parse(
                                      responseText
                                  )
                                : {};
                    } catch {
                        throw new Error(
                            `Resposta inválida do servidor: ${responseText.substring(
                                0,
                                300
                            )}`
                        );
                    }

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            data.message ||
                            "Não foi possível atualizar o contato."
                        );
                    }

                    const index =
                        user.emergencyContacts.findIndex(
                            item =>
                                Number(
                                    item.id
                                ) ===
                                Number(
                                    contactId.value
                                )
                        );

                    if (index !== -1) {
                        user.emergencyContacts[
                            index
                        ] =
                            data.contact;
                    }

                    saveUser();
                    renderContacts();
                    resetForm();

                    showMessage(
                        "Contato atualizado com sucesso!"
                    );

                    return;
                }

                // ====================================================
                // NOVO CONTATO
                // ====================================================

                const response =
                    await fetch(
                        `${API_URL}?action=contacts`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify({
                                    userId:
                                        Number(
                                            user.id
                                        ),
                                    name,
                                    phone,
                                    relationship,
                                    email
                                })
                        }
                    );

                const responseText =
                    await response.text();

                let data = {};

                try {
                    data =
                        responseText
                            ? JSON.parse(
                                  responseText
                              )
                            : {};
                } catch {
                    throw new Error(
                        `Resposta inválida do servidor: ${responseText.substring(
                            0,
                            300
                        )}`
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        data.message ||
                        "Não foi possível adicionar o contato."
                    );
                }

                user.emergencyContacts.push(
                    data.contact
                );

                saveUser();
                renderContacts();
                resetForm();

                showMessage(
                    "Contato adicionado com sucesso!"
                );

            } catch (error) {
                console.error(
                    "Erro ao salvar contato:",
                    error
                );

                showMessage(
                    error.message ||
                    "Não foi possível salvar o contato.",
                    "error"
                );

            } finally {
                if (submitButton) {
                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Salvar contato";
                }
            }
        }
    );

    // ========================================================
    // EDITAR / EXCLUIR
    // ========================================================

    contactsList.addEventListener(
        "click",
        async event => {
            const button =
                event.target.closest(
                    "button"
                );

            if (!button) {
                return;
            }

            const id =
                button.dataset.id;

            const action =
                button.dataset.action;

            const contact =
                user.emergencyContacts.find(
                    item =>
                        Number(item.id) ===
                        Number(id)
                );

            if (!contact) {
                return;
            }

            // ====================================================
            // EDITAR
            // ====================================================

            if (
                action === "edit"
            ) {
                contactId.value =
                    contact.id;

                contactName.value =
                    contact.name || "";

                contactPhone.value =
                    contact.phone || "";

                contactRelationship.value =
                    contact.relationship ||
                    "";

                contactEmail.value =
                    contact.email || "";

                cancelEdit.classList.remove(
                    "hidden"
                );

                contactName.focus();

                return;
            }

            // ====================================================
            // EXCLUIR
            // ====================================================

            if (
                action === "delete"
            ) {
                const confirmed =
                    confirm(
                        "Deseja realmente excluir este contato?"
                    );

                if (!confirmed) {
                    return;
                }

                try {
                    const response =
                        await fetch(
                            `${API_URL}?action=contacts&userId=${encodeURIComponent(
                                user.id
                            )}&contactId=${encodeURIComponent(
                                id
                            )}`,
                            {
                                method: "DELETE"
                            }
                        );

                    const responseText =
                        await response.text();

                    let data = {};

                    try {
                        data =
                            responseText
                                ? JSON.parse(
                                      responseText
                                  )
                                : {};
                    } catch {
                        throw new Error(
                            `Resposta inválida do servidor: ${responseText.substring(
                                0,
                                300
                            )}`
                        );
                    }

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            data.message ||
                            "Não foi possível excluir o contato."
                        );
                    }

                    user.emergencyContacts =
                        user.emergencyContacts.filter(
                            item =>
                                Number(
                                    item.id
                                ) !==
                                Number(id)
                        );

                    saveUser();
                    renderContacts();

                    showMessage(
                        "Contato excluído com sucesso!"
                    );

                } catch (error) {
                    console.error(
                        "Erro ao excluir contato:",
                        error
                    );

                    showMessage(
                        error.message ||
                        "Não foi possível excluir o contato.",
                        "error"
                    );
                }
            }
        }
    );

    // ========================================================
    // CANCELAR EDIÇÃO
    // ========================================================

    cancelEdit.addEventListener(
        "click",
        () => {
            resetForm();
        }
    );

    // ========================================================
    // INICIAR
    // ========================================================

    if (
        !Array.isArray(
            user.emergencyContacts
        )
    ) {
        user.emergencyContacts = [];
    }

    renderContacts();
    loadContacts();
});