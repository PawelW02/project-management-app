console.log('scripts.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('new-task-form');
    const tasksTable = document.getElementById('tasks');
    const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    const editForm = document.getElementById('edit-task-form');
    let currentEditId = null;

    // --- Obsługa projektów ---
    const projectSelect = document.getElementById('project-select-input');
    const addProjectBtn = document.getElementById('add-project-btn');
    let currentProject = '';

    async function fetchProjects() {
        const res = await fetch('/projects');
        if (!res.ok) return;
        const projects = await res.json();
        projectSelect.innerHTML = '';
        projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            projectSelect.appendChild(opt);
        });
        if (projects.length > 0) {
            currentProject = projects[0];
            projectSelect.value = currentProject;
        }
    }

    projectSelect.addEventListener('change', () => {
        currentProject = projectSelect.value;
        fetchTasks();
        fillTaskSelects();
        fillRemoveDepSelects();
    });

    addProjectBtn.addEventListener('click', async () => {
        const name = prompt('Podaj nazwę nowego projektu:');
        if (!name) return;
        // Dodaj pusty task z project_id, by utworzyć projekt
        await fetch('/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title: 'Nowe zadanie', description: '', project_id: name})
        });
        await fetchProjects();
        projectSelect.value = name;
        currentProject = name;
        fetchTasks();
        fillTaskSelects();
        fillRemoveDepSelects();
    });

    // Pobierz i wyświetl zadania
    async function fetchTasks() {
        let url = '/tasks';
        if (currentProject) url += `?project_id=${encodeURIComponent(currentProject)}`;
        const res = await fetch(url);
        if (res.ok) {
            const tasks = await res.json();
            tasksTable.innerHTML = '';
            tasks.forEach(task => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${task.title}</td>
                    <td>${task.description || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${task.id}">Edytuj</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${task.id}">Usuń</button>
                    </td>
                `;
                tasksTable.appendChild(tr);
            });
        } else {
            tasksTable.innerHTML = '<tr><td colspan="3">Błąd podczas pobierania zadań.</td></tr>';
        }
    }

    // Dodawanie zadania
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const res = await fetch('/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title, description, project_id: currentProject})
        });
        if (res.ok) {
            form.reset();
            fetchTasks();
            document.dispatchEvent(new Event('tasksChanged'));
        } else {
            alert('Błąd podczas dodawania zadania.');
        }
    });

    // Obsługa kliknięć w tabeli (edycja i usuwanie)
    tasksTable.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.getAttribute('data-id');
            // Pobierz dane zadania z wiersza
            const row = e.target.closest('tr');
            const title = row.children[0].textContent;
            const description = row.children[1].textContent;
            document.getElementById('edit-task-id').value = id;
            document.getElementById('edit-task-title').value = title;
            document.getElementById('edit-task-description').value = description;
            currentEditId = id;
            editModal.show();
        }
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
                const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchTasks();
                    document.dispatchEvent(new Event('tasksChanged'));
                } else {
                    alert('Błąd podczas usuwania zadania.');
                }
            }
        }
    });

    // Obsługa edycji zadania
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-task-id').value;
        const title = document.getElementById('edit-task-title').value;
        const description = document.getElementById('edit-task-description').value;
        const res = await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title, description})
        });
        if (res.ok) {
            editModal.hide();
            fetchTasks();
            document.dispatchEvent(new Event('tasksChanged'));
        } else {
            alert('Błąd podczas edycji zadania.');
        }
    });

    // --- Dodawanie zależności między zadaniami ---
    // Upewnij się, że formularz do dodawania zależności istnieje
    if (!document.getElementById('add-dependency-form')) {
        const addDepForm = document.createElement('form');
        addDepForm.className = 'w-100';
        addDepForm.id = 'add-dependency-form';
        addDepForm.innerHTML = `
            <div class="row g-2">
                <div class="col-12 col-md-6">
                    <select id="from-task" class="form-select w-100" required>
                        <option value="">Zadanie zależne (dziecko)</option>
                    </select>
                </div>
                <div class="col-12 col-md-6">
                    <select id="to-task" class="form-select w-100" required>
                        <option value="">Zadanie, od którego zależy (rodzic)</option>
                    </select>
                </div>
                <div class="col-12 mt-2 mb-3">
                    <button type="submit" class="btn btn-success w-100">Dodaj zależność</button>
                </div>
            </div>
        `;
        document.getElementById('dependency-form').prepend(addDepForm);
    }
    const depForm = document.getElementById('add-dependency-form');
    const fromTaskSelect = document.getElementById('from-task');
    const toTaskSelect = document.getElementById('to-task');

    async function fillTaskSelects() {
        let url = '/tasks';
        if (currentProject) url += `?project_id=${encodeURIComponent(currentProject)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const tasks = await res.json();
        fromTaskSelect.innerHTML = '<option value="">Zadanie zależne (dziecko)</option>';
        toTaskSelect.innerHTML = '<option value="">Zadanie, od którego zależy (rodzic)</option>';
        tasks.forEach(task => {
            const opt1 = document.createElement('option');
            opt1.value = task.id;
            opt1.textContent = task.title;
            fromTaskSelect.appendChild(opt1);
            const opt2 = document.createElement('option');
            opt2.value = task.id;
            opt2.textContent = task.title;
            toTaskSelect.appendChild(opt2);
        });
    }

    depForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fromId = fromTaskSelect.value;
        const toId = toTaskSelect.value;
        if (!fromId || !toId || fromId === toId) {
            alert('Wybierz dwa różne zadania!');
            return;
        }
        const res = await fetch(`/tasks/${fromId}/depends_on`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ depends_on_id: toId })
        });
        if (res.ok) {
            depForm.reset();
            document.dispatchEvent(new Event('tasksChanged'));
            fetchTasks();
            fillTaskSelects();
        } else {
            alert('Błąd podczas dodawania zależności.');
        }
    });

    // --- Usuwanie zależności między zadaniami ---
    const removeDepForm = document.createElement('form');
    removeDepForm.className = 'w-100';
    removeDepForm.id = 'remove-dependency-form';
    removeDepForm.innerHTML = `
        <div class="row g-2">
            <div class="col-12 col-md-6">
                <select id="remove-from-task" class="form-select w-100" required>
                    <option value="">Zadanie zależne (dziecko)</option>
                </select>
            </div>
            <div class="col-12 col-md-6">
                <select id="remove-to-task" class="form-select w-100" required>
                    <option value="">Zadanie, od którego zależność chcesz usunąć (rodzic)</option>
                </select>
            </div>
            <div class="col-12 mt-2">
                <button type="submit" class="btn btn-danger w-100">Usuń zależność</button>
            </div>
        </div>
    `;
    document.getElementById('dependency-form').appendChild(removeDepForm);
    const removeFromTask = document.getElementById('remove-from-task');
    const removeToTask = document.getElementById('remove-to-task');

    async function fillRemoveDepSelects() {
        let url = '/tasks';
        let graphUrl = '/graph';
        if (currentProject) {
            url += `?project_id=${encodeURIComponent(currentProject)}`;
            graphUrl += `?project_id=${encodeURIComponent(currentProject)}`;
        }
        const [tasksRes, graphRes] = await Promise.all([
            fetch(url),
            fetch(graphUrl)
        ]);
        if (!tasksRes.ok || !graphRes.ok) return;
        const tasks = await tasksRes.json();
        const edges = await graphRes.json();
        removeFromTask.innerHTML = '<option value="">Zadanie zależne (dziecko)</option>';
        removeToTask.innerHTML = '<option value="">Zadanie, od którego zależność chcesz usunąć (rodzic)</option>';
        // Dodaj tylko te pary, które mają relację
        edges.forEach(edge => {
            if (!removeFromTask.querySelector(`option[value="${edge.from}"]`)) {
                const opt = document.createElement('option');
                opt.value = edge.from;
                opt.textContent = edge.from_title;
                removeFromTask.appendChild(opt);
            }
            if (!removeToTask.querySelector(`option[value="${edge.to}"]`)) {
                const opt = document.createElement('option');
                opt.value = edge.to;
                opt.textContent = edge.to_title;
                removeToTask.appendChild(opt);
            }
        });
    }

    removeDepForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fromId = removeFromTask.value;
        const toId = removeToTask.value;
        if (!fromId || !toId || fromId === toId) {
            alert('Wybierz dwa różne zadania!');
            return;
        }
        const res = await fetch(`/tasks/${fromId}/depends_on/${toId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            removeDepForm.reset();
            document.dispatchEvent(new Event('tasksChanged'));
            fetchTasks();
            fillRemoveDepSelects();
        } else {
            alert('Błąd podczas usuwania zależności.');
        }
    });

    async function checkForCycle() {
        const res = await fetch('/graph/has_cycle');
        if (res.ok) {
            const data = await res.json();
            if (data.has_cycle) {
                alert('Uwaga! W grafie zadań wykryto cykl zależności. Sprawdź relacje między zadaniami.');
            }
        }
    }

    // Po każdej zmianie zależności sprawdź cykl
    document.addEventListener('tasksChanged', checkForCycle);
    checkForCycle();

    document.addEventListener('tasksChanged', fillRemoveDepSelects);
    fillRemoveDepSelects();

    // --- Wyszukiwarka zadań ---
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control mb-3';
    searchInput.placeholder = 'Szukaj zadania po tytule...';
    document.getElementById('task-list').insertBefore(searchInput, document.getElementById('task-list').children[1]);

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        Array.from(tasksTable.children).forEach(tr => {
            const title = tr.children[0]?.textContent?.toLowerCase() || '';
            tr.style.display = title.includes(filter) ? '' : 'none';
        });
    });

    // --- Inicjalizacja projektów ---
    (async () => {
        await fetchProjects();
        // Jeśli istnieje DemoProjekt, wybierz go automatycznie
        if ([...projectSelect.options].some(opt => opt.value === 'DemoProjekt')) {
            await window.reloadProjectsAndSelect('DemoProjekt');
        } else {
            fetchTasks();
            fillTaskSelects();
            fillRemoveDepSelects();
        }
    })();

    // Funkcja do ręcznego odświeżenia projektów i wyboru DemoProjekt (np. po imporcie demo)
    window.reloadProjectsAndSelect = async function(projectName = 'DemoProjekt') {
        await fetchProjects();
        if ([...projectSelect.options].some(opt => opt.value === projectName)) {
            projectSelect.value = projectName;
            currentProject = projectName;
        } else if (projects.length > 0) {
            projectSelect.value = projects[0];
            currentProject = projects[0];
        }
        fetchTasks();
        fillTaskSelects();
        fillRemoveDepSelects();
    }
});