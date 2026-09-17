document.addEventListener("DOMContentLoaded", () => {
    //Verificar login
    const logged = localStorage.getItem("medalert_logged");

    if (logged !== "true") {
        window.location.href ="login.html";

        return;
    }

    //Recuperar usuário
    const savedUser = localStorage.getItem("medalert_current_user");

    if (!savedUser) {
        window.location.href ="login.html";

        return;
    }

    const user = JSON.parse(savedUser);

    //Elementos
    const welcomeName = document.getElementById("welcomeName");
    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    //Nome
    if (welcomeName) {
        const firstName = user.name.split(" ")[0];

        welcomeName.textContent = firstName;
    }

    //Sidebar

    if (sidebarName) {
        sidebarName.textContent = user.name;
    }

    if (sidebarEmail) {
        sidebarEmail.textContent = user.email;
    }

    //Avatar
    if (sidebarAvatar) {
        const initials = user.name.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase();

        sidebarAvatar.textContent = initials;
    }
});