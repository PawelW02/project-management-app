import pytest
from src.app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

def test_topological_sort(client):
    # Tworzenie zadań
    client.post('/tasks', json={'title': 'A', 'description': ''})
    client.post('/tasks', json={'title': 'B', 'description': ''})
    client.post('/tasks', json={'title': 'C', 'description': ''})
    response = client.get('/tasks')
    ids = {t['title']: t['id'] for t in response.get_json()}
    # A -> B -> C
    client.post(f"/tasks/{ids['B']}/depends_on", json={'depends_on_id': ids['A']})
    client.post(f"/tasks/{ids['C']}/depends_on", json={'depends_on_id': ids['B']})
    # Sprawdzenie sortowania topologicznego
    response = client.get('/graph/topological_sort')
    assert response.status_code == 200
    order = response.get_json()['order']
    # Sprawdź, czy A jest przed B, a B przed C
    assert order.index(ids['A']) < order.index(ids['B']) < order.index(ids['C'])
