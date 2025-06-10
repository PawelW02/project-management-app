import pytest
from src.app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

def test_remove_dependency(client):
    # Dodaj dwa zadania
    client.post('/tasks', json={'title': 'DepA', 'description': ''})
    client.post('/tasks', json={'title': 'DepB', 'description': ''})
    response = client.get('/tasks')
    ids = {t['title']: t['id'] for t in response.get_json() if t['title'] in ['DepA', 'DepB']}
    # Dodaj zależność DepA -> DepB
    resp = client.post(f"/tasks/{ids['DepA']}/depends_on", json={'depends_on_id': ids['DepB']})
    assert resp.status_code == 200
    # Sprawdź, że zależność istnieje w grafie
    response = client.get('/graph')
    edges = response.get_json()
    assert any(e['from'] == ids['DepA'] and e['to'] == ids['DepB'] for e in edges)
    # Usuń zależność
    resp = client.delete(f"/tasks/{ids['DepA']}/depends_on/{ids['DepB']}")
    assert resp.status_code == 200
    # Sprawdź, że zależność została usunięta
    response = client.get('/graph')
    edges = response.get_json()
    assert not any(e['from'] == ids['DepA'] and e['to'] == ids['DepB'] for e in edges)
