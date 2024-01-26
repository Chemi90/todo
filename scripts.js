// Función para mostrar el formulario de login
function showLogin() {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("tasks-section").style.display = "none";
    localStorage.setItem('currentSection', 'login');
}

// Función para mostrar el formulario de registro
function showRegister() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
    document.getElementById("tasks-section").style.display = "none";
    localStorage.setItem('currentSection', 'register');
}

// Función para mostrar la app de tareas
function showTasks() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("tasks-section").style.display = "block";
    localStorage.setItem('currentSection', 'tasks');
    updateUserNameDisplay();
}

// Este bloque se ejecuta cuando el contenido del DOM está completamente cargado.
// Añade un listener al checkbox de mostrar tareas completadas para actualizar la lista de tareas.
// Llama a restoreState para restaurar la sección que estaba siendo visualizada antes de recargar.
// Si hay un usuario logueado, muestra sus tareas.
// Añade un listener para restaurar el estado cuando se carga el contenido del DOM.
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('show-completed').addEventListener('change', displayTasks);
    document.addEventListener('DOMContentLoaded', restoreState);
    if (localStorage.getItem('loggedInUser')) {
        displayTasks();
    }
    restoreState();
    // Aquí añades los event listeners para los botones o enlaces
});

// Esta función maneja el registro de nuevos usuarios.
// Obtiene los valores de los campos del formulario de registro.
// Realiza varias validaciones: espacios en el nombre, usuario y contraseña.
// Comprueba si el usuario ya existe en localStorage.
// Si no existe, lo agrega y muestra la pantalla de login.
function registerUser() {
    let name = document.getElementById('name').value;
    let username = document.getElementById('new-username').value;
    let password = document.getElementById('new-password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    // Validar que el nombre no tenga espacios al principio o al final
    if (name.trim() !== name) {
        alert('El nombre no debe tener espacios al principio o al final.');
        return;
    }

    // Validar que el usuario y la contraseña no tengan espacios
    if (username.includes(' ') || password.includes(' ')) {
        alert('El usuario y la contraseña no deben contener espacios.');
        return;
    }

    // Verificar si las claves coinciden
    if (password !== confirmPassword) {
        alert('Las claves no coinciden.');
        return;
    }

    // Verificar si el usuario ya existe
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let userExists = users.some(function(user) {
        return user.username === username;
    });

    if (!userExists) {
        // Agregar el nuevo usuario al array de usuarios
        users.push({ name: name, username: username, password: password });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Usuario registrado exitosamente.');

        // Vaciar los campos del formulario de registro
        document.getElementById('name').value = '';
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        // Cambiar a la pantalla de login
        showLogin();

        // Rellenar el campo de usuario y poner el foco en el campo de contraseña
        document.getElementById('username').value = username;
        document.getElementById('password').focus();
    } else {
        alert('El usuario ya está registrado.');
    }
}

// Maneja el proceso de inicio de sesión.
// Obtiene el nombre de usuario y contraseña introducidos.
// Verifica si coinciden con algún usuario registrado en localStorage.
// Si es correcto, guarda este usuario como 'loggedInUser' y muestra la sección de tareas.
function loginUser() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log(users); // Verificar qué hay en users

    let userExists = users.some(user => user.username === username && user.password === password);
    console.log(userExists); // Verificar si se encontró un usuario

    if (userExists) {
        let loggedInUser = users.find(user => user.username === username);
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        displayTasks();
        updateTaskCounters();
        showTasks();
    } else {
        alert('Usuario o contraseña incorrecta.');
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    document.getElementById('taskList').innerHTML = ''; // Limpiar la lista de tareas
    showLogin(); // Mostrar la pantalla de inicio de sesión
}

function updateUserNameDisplay() {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        document.getElementById('userNameDisplay').textContent = loggedInUser.username;
    }
}

// Añade una nueva tarea.
// Verifica si hay un usuario logueado y si el nombre de la tarea no está vacío.
// Crea un objeto de tarea y lo añade a la lista de tareas del usuario en localStorage.
// Luego actualiza la lista de tareas en el DOM.
function addTask() {
    let taskName = document.getElementById('taskName').value.trim();
    if (!taskName) {
        alert('Por favor, ingresa el nombre de la tarea.');
        return;
    }

    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('No hay usuario logueado.');
        return;
    }

    let task = {
        id: Date.now(), // Un identificador único para la tarea
        name: taskName,
        completed: false
    };

    let userTasks = JSON.parse(localStorage.getItem(loggedInUser.username + '-tasks')) || [];
    userTasks.push(task);
    localStorage.setItem(loggedInUser.username + '-tasks', JSON.stringify(userTasks));

    // Limpiar el campo de entrada
    document.getElementById('taskName').value = '';

    // Actualizar la lista de tareas en el DOM
    displayTasks();
    updateTaskCounters();
}

// Muestra las tareas del usuario logueado.
// Comprueba si hay tareas completadas y si deben mostrarse según el estado del checkbox.
// Crea elementos del DOM para cada tarea y los añade a la lista de tareas en la página.
function displayTasks() {
    let showCompleted = document.getElementById('show-completed').checked;
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        console.log("No hay usuario logueado.");
        return; // Si no hay usuario logueado, no se hace nada.
    }

    let userTasks = JSON.parse(localStorage.getItem(loggedInUser.username + '-tasks')) || [];
    let taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Limpiar la lista actual antes de añadir nuevas tareas.

    userTasks.forEach(task => {
        // Si la tarea está completada y el checkbox de mostrar completadas no está marcado, se salta esta tarea.
        if (task.completed && !showCompleted) {
            return;
        }

        // Creación del elemento de tarea.
        let taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.innerHTML = `
            <span>${task.name}</span>
            ${!task.completed ? `<button onclick="completeTask(${task.id})">Completar</button>` : '<span class="task-completed">Completada</span>'}
            <button onclick="deleteTask(${task.id})">Eliminar</button>
        `;

        // Añadir el elemento de tarea a la lista.
        taskList.appendChild(taskElement);
    });
}

// Estas funciones manejan la finalización y eliminación de tareas.
// Buscan la tarea específica en la lista de tareas del usuario logueado y actualizan su estado o la eliminan.
// Después de realizar la acción, actualizan la visualización de las tareas en el DOM.
function completeTask(taskId) {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let userTasks = JSON.parse(localStorage.getItem(loggedInUser.username + '-tasks')) || [];
    let taskIndex = userTasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        userTasks[taskIndex].completed = true;
        localStorage.setItem(loggedInUser.username + '-tasks', JSON.stringify(userTasks));
        displayTasks();
        updateTaskCounters();
    }
}

function deleteTask(taskId) {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let userTasks = JSON.parse(localStorage.getItem(loggedInUser.username + '-tasks')) || [];
    userTasks = userTasks.filter(task => task.id !== taskId);
    localStorage.setItem(loggedInUser.username + '-tasks', JSON.stringify(userTasks));
    displayTasks();
    updateTaskCounters();
}

// Actualiza los contadores de tareas completadas y pendientes en la interfaz de usuario.
function updateTaskCounters() {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) return;

    let userTasks = JSON.parse(localStorage.getItem(loggedInUser.username + '-tasks')) || [];
    let completedTasks = userTasks.filter(task => task.completed).length;
    let pendingTasks = userTasks.length - completedTasks;

    document.getElementById('completedTasks').textContent = `Completadas: ${completedTasks}`;
    document.getElementById('pendingTasks').textContent = `Pendientes: ${pendingTasks}`;
}

// Restaura la sección visualizada antes de recargar la página.
// Lee la sección actual de localStorage y muestra la sección correspondiente.
function restoreState() {
    console.log("Restaurando estado...");
    const currentSection = localStorage.getItem('currentSection');
    console.log("Sección actual: ", currentSection);

    switch (currentSection) {
        case 'register':
            console.log("Mostrando sección de registro");
            showRegister();
            break;
        case 'tasks':
            console.log("Mostrando sección de tareas");
            if (localStorage.getItem('loggedInUser')) {
                showTasks();
            } else {
                showLogin();
            }
            break;
        case 'login':
        default:
            console.log("Mostrando sección de login");
            showLogin();
    }
    // Si el usuario está logueado y la sección actual es 'tasks', actualiza los contadores de tareas.
    if (localStorage.getItem('loggedInUser') && currentSection === 'tasks') {
        updateTaskCounters(); // Actualiza los contadores de tareas.
    }
}
