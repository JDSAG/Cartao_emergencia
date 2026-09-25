document.addEventListener("DOMContentLoaded", () => {
    //Verificar login
    const logged = localStorage.getItem("medalert_logged");

    if (logged !== "true") {
        window.location.href ="login.html";

        return;
    }

    //Recuperar usuário
    const savedUser = localStorage.getItem("medalert_current_user") || localStorage.getItem("medalert_user");

    if (!savedUser) {
        window.location.href = "login.html";
        
        return;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        console.error("Erro ao carregar os dados do usuário:", error);
       
        window.location.href = "login.html";
        
        return;
    }

    //Elementos
    const welcomeName = document.getElementById("welcomeName");
    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const sidebarAvatar = document.getElementById("sidebarAvatar");

    // INformações de emergência
    const dashboardBloodType = document.getElementById("dashboardBloodType");
    const dashboardAllergies = document.getElementById("dashboardAllergies");
    const dashboardMedications = document.getElementById("dashboardMedications");
    const dashboardEmergencyContact = document.getElementById("dashboardEmergencyContact");

    // Nome
    const fullName = user.fullName || user.name || "Nome não informado";

    if (welcomeName) {
        const firstName = user.name.split(" ")[0];

        welcomeName.textContent = firstName;
    }

    //Sidebar
    if (sidebarName) {
        sidebarName.textContent = fullName;
    }

    if (sidebarEmail) {
        sidebarEmail.textContent = user.email || "Email não informado";
    }

    //Avatar
    if (sidebarAvatar) {
        const names = fullName.trim().split(", ");

        let initials;

        if (names.length === 1) {
            initials = names[0].substring(0, 2).toUpperCase();
        } else{
            initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        sidebarAvatar.textContent = initials;
    }

    // Função para valores não informados
    function displayValue(value) {
        if (!value || value.length === 0) {
            return "Não informado";
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(", ") : "Não informado";
        }

        return value;
    }

    // Tipo sanguíneo
    if (dashboardBloodType) {
        dashboardBloodType.textContent = displayValue(user.bloodType);
    }

    //Alergias
    if (dashboardAllergies) {
        dashboardAllergies.textContent = displayValue(user.allergies);
    }

    // Medicamentos
    if (dashboardMedications) {
        dashboardMedications.textContent = displayValue(user.medications);
    }

    // Contato de emergência
    if (dashboardEmergencyContact) {
        let contactName = "";
        let contactPhone = "";

        // Novo formato: lista de contatos
        if (Array.isArray(user.emergencyContacts) && user.emergencyContacts.length > 0) {
            const primaryContact = user.emergencyContacts[0];

            contactName = primaryContact.name || "";
            contactPhone = primaryContact.phone || "";
        }

        // Compatibilidade com o formato antigo
        if (!contactName) {
            contactName = user.emergencyContactName || "";
        }

        if (!contactPhone) {
            contactPhone = user.emergencyContactPhone || "";
        }

        if (contactName && contactPhone){
            dashboardEmergencyContact.textContent = `${contactName} - ${contactPhone}`;
        } else if (contactName) {
            dashboardEmergencyContact.textContent = contactName;
        } else if (contactPhone) {
            dashboardEmergencyContact.textContent = contactPhone;
        } else {
            dashboardEmergencyContact.textContent = "Não informado";
        }
    }
});