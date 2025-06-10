import pytest
from src.app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

def test_search_task(client):
    # Dodaj kilka zadań
    client.post('/tasks', json={'title': 'Zadanie Alfa', 'description': 'Opis 1'})
    client.post('/tasks', json={'title': 'Zadanie Beta', 'description': 'Opis 2'})
    client.post('/tasks', json={'title': 'Gamma', 'description': 'Opis 3'})
    # Pobierz zadania
    response = client.get('/tasks')
    assert response.status_code == 200
    data = response.get_json()
    # Sprawdź, czy filtracja po tytule działa (symulacja frontu)
    filtered = [t for t in data if 'alfa' in t['title'].lower()]
    assert any(t['title'] == 'Zadanie Alfa' for t in filtered)
    filtered = [t for t in data if 'beta' in t['title'].lower()]
    assert any(t['title'] == 'Zadanie Beta' for t in filtered)
    filtered = [t for t in data if 'gamma' in t['title'].lower()]
    assert any(t['title'] == 'Gamma' for t in filtered)
