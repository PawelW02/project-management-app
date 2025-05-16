console.log('scripts.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('new-task-form');
    const tasksList = document.getElementById('tasks');

    // Pobierz i wyświetl zadania
    async function fetchTasks() {
        const res = await fetch('/tasks');
        if (res.ok) {
            const tasks = await res.json();
            tasksList.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.title}: ${task.description}`;
                tasksList.appendChild(li);
            });
        } else {
            tasksList.innerHTML = '<li>Błąd podczas pobierania zadań.</li>';
        }
    }

    // Obsługa dodawania zadania
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const res = await fetch('/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title, description})
        });
        if (res.ok) {
            form.reset();
            fetchTasks();
        } else {
            alert('Błąd podczas dodawania zadania.');
        }
    });

    fetchTasks();
});