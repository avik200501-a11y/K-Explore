
const events = [
    {
        id: "kiit-mun-2026",
        name: "KIIT International MUN 2026",
        date: "27–29 November 2026",
        description: "An international Model United Nations conference for students.",
        eligibility: "Individual delegates",
        registration: "Open",
        link: "https://kiitmun.org/"
    },
    {
        id: "kainos-2026",
        name: "KAINOS 2026–27",
        date: "November 2026 – March 2027",
        description: "A student innovation and entrepreneurship programme.",
        eligibility: "Teams of 2–4 undergraduate students",
        registration: "Dates to be announced",
        link: "https://sld.kiit.ac.in/kainos/"
    }
];

const ACCOUNT_KEY = "kExploreAccounts";
const SESSION_KEY = "kExploreLoggedInUser";
const REGISTRATION_KEY = "kExploreRegistrations";

function readStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Storage error:", error);
        return [];
    }
}

function getAccounts() {
    return readStorage(ACCOUNT_KEY);
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}

function getRegistrations() {
    return readStorage(REGISTRATION_KEY);
}

function saveRegistrations(registrations) {
    localStorage.setItem(REGISTRATION_KEY, JSON.stringify(registrations));
}

function getCurrentUser() {
    const email = localStorage.getItem(SESSION_KEY);

    if (!email) return null;

    return getAccounts().find(account =>
        account.email.toLowerCase() === email.toLowerCase()
    ) || null;
}

function getEventById(id) {
    return events.find(event => event.id === id);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN");
}

function setupSignup() {
    const form = document.getElementById("signupForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("signupMessage");

        try {
            const accounts = getAccounts();

            if (!name || !email || !password || !confirmPassword) {
                message.textContent = "Please fill in all fields.";
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                message.textContent = "Enter a valid email address.";
                return;
            }

            if (password.length < 6) {
                message.textContent = "Password must contain at least 6 characters.";
                return;
            }

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                return;
            }

            if (accounts.some(account =>
                account.email.toLowerCase() === email
            )) {
                message.textContent = "Email already registered. Please sign in.";
                return;
            }

            accounts.push({
                name: name,
                email: email,
                password: password
            });

            saveAccounts(accounts);

            message.textContent = "Account created successfully! Redirecting to Sign In...";

            form.reset();

            setTimeout(function () {
                window.location.href = "Login.html";
            }, 1200);

        } catch (error) {
            console.error("Signup error:", error);
            message.textContent = "Unable to create account. Please try again.";
        }
    });
}

function setupLogin() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            const accounts = getAccounts();

            const user = accounts.find(account =>
                account.email.toLowerCase() === email &&
                account.password === password
            );

            if (!user) {
                message.textContent = "Invalid email or password.";
                return;
            }

            localStorage.setItem(SESSION_KEY, user.email.toLowerCase());

            message.textContent = "Sign In successful! Redirecting...";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 700);

        } catch (error) {
            console.error("Login error:", error);
            message.textContent = "Unable to sign in. Please try again.";
        }
    });
}

function setupLogout() {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "Login.html";
    });
}

function setupRegistration() {
    const form = document.getElementById("registrationForm");

    if (!form) return;

    const user = getCurrentUser();

    if (!user) {
        window.location.href = "Login.html";
        return;
    }

    const nameInput = document.getElementById("registrationName");
    const emailInput = document.getElementById("registrationEmail");
    const phoneInput = document.getElementById("registrationPhone");
    const eventSelect = document.getElementById("eventSelect");
    const message = document.getElementById("formMessage");

    if (nameInput) {
        nameInput.value = user.name;
        nameInput.readOnly = true;
    }

    if (emailInput) {
        emailInput.value = user.email;
        emailInput.readOnly = true;
    }

    if (eventSelect) {
        events.forEach(event => {
            const exists = Array.from(eventSelect.options).some(
                option => option.value === event.id
            );

            if (!exists) {
                const option = document.createElement("option");
                option.value = event.id;
                option.textContent = event.name;
                eventSelect.appendChild(option);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const requestedEvent = params.get("id");

        if (requestedEvent && getEventById(requestedEvent)) {
            eventSelect.value = requestedEvent;
        }
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const phone = phoneInput.value.trim();
        const eventId = eventSelect.value;
        const selectedEvent = getEventById(eventId);

        if (!/^[0-9]{10}$/.test(phone)) {
            message.textContent = "Enter a valid 10-digit phone number.";
            return;
        }

        if (!selectedEvent) {
            message.textContent = "Please select an event.";
            return;
        }

        const registrations = getRegistrations();

        const alreadyRegistered = registrations.some(registration =>
            registration.email.toLowerCase() === user.email.toLowerCase() &&
            registration.eventId === eventId
        );

        if (alreadyRegistered) {
            message.textContent = "You have already registered for this event.";
            return;
        }

        registrations.push({
            id: Date.now(),
            name: user.name,
            email: user.email,
            phone: phone,
            eventId: eventId,
            eventName: selectedEvent.name,
            eventDate: selectedEvent.date,
            registeredOn: new Date().toISOString()
        });

        saveRegistrations(registrations);

        message.textContent = "Registration successful!";

        setTimeout(function () {
            window.location.href = "my-registrations.html";
        }, 1000);
    });
}

function setupMyRegistrations() {
    const container = document.getElementById("myRegistrations");

    if (!container) return;

    const user = getCurrentUser();

    if (!user) {
        window.location.href = "Login.html";
        return;
    }

    const userDisplay = document.getElementById("userDisplay");

    if (userDisplay) {
        userDisplay.textContent = "Welcome, " + user.name;
    }

    const registrations = getRegistrations().filter(registration =>
        registration.email.toLowerCase() === user.email.toLowerCase()
    );

    if (registrations.length === 0) {
        container.innerHTML = `
            <div class="registration-empty">
                <h3>No Registrations Yet</h3>
                <p>You have not registered for any events.</p>
                <a href="Events.html" class="btn">Explore Events</a>
            </div>
        `;
        return;
    }

    container.innerHTML = registrations.map(registration => `
        <div class="event-card">
            <h3>${registration.eventName}</h3>
            <p><strong>Participant:</strong> ${registration.name}</p>
            <p><strong>Email:</strong> ${registration.email}</p>
            <p><strong>Phone:</strong> ${registration.phone}</p>
            <p><strong>Event Date:</strong> ${registration.eventDate}</p>
            <p><strong>Registered On:</strong> ${formatDate(registration.registeredOn)}</p>
            <span class="status">Registered</span>
        </div>
    `).join("");
}

function renderEvents() {
    const containers = [
        document.getElementById("eventContainer"),
        document.getElementById("eventsContainer")
    ].filter(Boolean);

    if (containers.length === 0) return;

    const eventHTML = events.map(event => `
        <div class="event-card">
            <h3>${event.name}</h3>
            <p>${event.description}</p>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Eligibility:</strong> ${event.eligibility}</p>
            <p><strong>Status:</strong> ${event.registration}</p>
            <a href="event-register.html?id=${event.id}" class="btn">
                Register
            </a>
            <a href="${event.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                Official Website
            </a>
        </div>
    `).join("");

    containers.forEach(container => {
        container.innerHTML = eventHTML;
    });
}

function showEventDetails(id) {
    const event = getEventById(id);

    if (!event) return;

    const container = document.getElementById("eventDetails");

    if (!container) return;

    const user = getCurrentUser();

    container.innerHTML = `
        <h2>${event.name}</h2>
        <p>${event.description}</p>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Eligibility:</strong> ${event.eligibility}</p>
        <p><strong>Registration:</strong> ${event.registration}</p>
        <a href="${event.link}" target="_blank" rel="noopener noreferrer" class="btn">
            Official Registration
        </a>
        <a href="${user ? `event-register.html?id=${event.id}` : "Login.html"}" class="btn">
            ${user ? "Register on K Explore" : "Sign In to Register"}
        </a>
    `;
}

function setupDetailPage() {
    const eventSelect = document.getElementById("eventSelect");

    if (!eventSelect) return;

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (eventId && getEventById(eventId)) {
        eventSelect.value = eventId;
    }
}

function setupForgotPassword() {
    const form = document.getElementById("forgotPasswordForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        document.getElementById("forgotMessage").textContent =
            "Password recovery is temporarily unavailable.";
    });
}

function setupOTP() {
    const form = document.getElementById("otpForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        document.getElementById("otpMessage").textContent =
            "OTP verification is temporarily unavailable.";
    });
}

function setupResetPassword() {
    const form = document.getElementById("resetPasswordForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        document.getElementById("resetMessage").textContent =
            "Password reset is temporarily unavailable.";
    });
}

function setupNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");

            menuToggle.textContent =
                navLinks.classList.contains("active") ? "✕" : "☰";
        });
    }

    const themeToggle = document.getElementById("themeToggle");

    if (themeToggle) {
        const savedTheme = localStorage.getItem("kExploreTheme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
        }

        themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");

            localStorage.setItem(
                "kExploreTheme",
                document.body.classList.contains("dark-mode") ? "dark" : "light"
            );
        });
    }

    const user = getCurrentUser();

    const userDisplay = document.getElementById("userDisplay");

    if (userDisplay && user) {
        userDisplay.textContent = "Welcome, " + user.name;
    }

    document.querySelectorAll("[data-auth-link]").forEach(link => {
        if (user) {
            link.textContent = "My Registrations";
            link.href = "my-registrations.html";
        } else {
            link.textContent = "Sign In";
            link.href = "Login.html";
        }
    });

    const loginLink = document.getElementById("loginLink");

    if (loginLink) {
        if (user) {
            loginLink.textContent = "My Registrations";
            loginLink.href = "my-registrations.html";
        } else {
            loginLink.textContent = "Login";
            loginLink.href = "Login.html";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setupSignup();
    setupLogin();
    setupLogout();
    setupRegistration();
    setupMyRegistrations();
    setupNavigation();
    setupDetailPage();
    setupForgotPassword();
    setupOTP();
    setupResetPassword();
    renderEvents();
});
