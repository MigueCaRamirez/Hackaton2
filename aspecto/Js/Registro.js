// Muestra el formulario de registro
function showRegister() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
}

// Muestra el formulario de inicio de sesión
function showLogin() {
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

// Guarda los datos de registro en localStorage
function registerAccount(event) {
    event.preventDefault(); // Evita el comportamiento por defecto del formulario

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;

    if (fullname && email && password) {
        const user = {
            fullname,
            email,
            password
        };

        // Guarda el usuario en localStorage
        localStorage.setItem('user-' + email, JSON.stringify(user));
        alert('Cuenta registrada exitosamente');
        showLogin();
    } else {
        alert('Por favor, completa todos los campos.');
    }
}

// Valida el inicio de sesión
function login(event) {
    event.preventDefault(); // Evita el comportamiento por defecto del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = localStorage.getItem('user-' + email);

    if (user) {
        const parsedUser = JSON.parse(user);

        if (parsedUser.password === password) {
            alert(`Bienvenido, ${parsedUser.fullname}`);
            
            // Mantén la sesión activa
            localStorage.setItem('session', JSON.stringify(parsedUser));
            window.location.reload(); // Refresca la página para mantener la sesión activa
        } else {
            alert('Contraseña incorrecta.');
        }
    } else {
        alert('No se encontró una cuenta con este correo electrónico.');
    }
}

// Comprueba si hay una sesión activa
function checkSession() {
    const session = localStorage.getItem('session');
    if (session) {
        const user = JSON.parse(session);
        alert(`Sesión activa: Bienvenido, ${user.fullname}`);
        
        window.location.href = 'index.html';

    }
}

// Cierra la sesión
function logout() {
    localStorage.removeItem('session');
    alert('Sesión cerrada.');
    window.location.reload();
}

// Asigna los eventos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Comprueba si hay una sesión activa
    checkSession();

    // Asigna los eventos a los formularios
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', registerAccount);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
});
