import pytest
from flask import Flask
from src.routes.tasks import tasks_bp
from src.app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

def test_create_and_list_task(client):
    # Tworzenie zadania
    response = client.post('/tasks', json={
        'title': 'Test task',
        'description': 'Opis testowy'
    })
    assert response.status_code == 201
    # Pobieranie zadań
    response = client.get('/tasks')
    assert response.status_code == 200
    data = response.get_json()
    assert any(task['title'] == 'Test task' for task in data)

def test_update_and_delete_task(client):
    # Tworzenie zadania
    response = client.post('/tasks', json={
        'title': 'Do usunięcia',
        'description': 'Opis'
    })
    assert response.status_code == 201
    # Pobieranie id
    response = client.get('/tasks')
    task_id = [t['id'] for t in response.get_json() if t['title'] == 'Do usunięcia'][0]
    # Aktualizacja
    response = client.put(f'/tasks/{task_id}', json={
        'title': 'Zmieniony',
        'description': 'Nowy opis'
    })
    assert response.status_code == 200
    # Usuwanie
    response = client.delete(f'/tasks/{task_id}')
    assert response.status_code == 200

def test_cycle_detection(client):
    # Tworzenie dwóch zadań
    client.post('/tasks', json={'title': 'A', 'description': ''})
    client.post('/tasks', json={'title': 'B', 'description': ''})
    response = client.get('/tasks')
    ids = [t['id'] for t in response.get_json() if t['title'] in ['A', 'B']]
    # Tworzenie zależności A->B i B->A (cykl)
    client.post(f'/tasks/{ids[0]}/depends_on', json={'depends_on_id': ids[1]})
    client.post(f'/tasks/{ids[1]}/depends_on', json={'depends_on_id': ids[0]})
    # Sprawdzenie cyklu
    response = client.get('/graph/has_cycle')
    assert response.status_code == 200
    assert response.get_json()['has_cycle'] is True
