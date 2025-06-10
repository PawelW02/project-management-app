# Project Management App

## Description
This application is designed for managing projects using a graph database. Tasks and their dependencies are represented as a graph, allowing for efficient management and visualization of project tasks.

## Features
- Create, update, and delete tasks.
- Visualize task dependencies in a graph format.
- Interact with a Neo4j graph database to manage task relationships.

## Technologies Used
- Flask: A lightweight WSGI web application framework.
- Neo4j: A graph database management system.
- HTML/CSS: For the front-end user interface.

## Installation

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/project-management-app.git
   cd project-management-app
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and add your database credentials and any other necessary environment variables.

## Usage

1. **Run the application:**
   ```
   python src/app.py
   ```

2. **Access the application:**
   Open your web browser and navigate to `http://127.0.0.1:5000`.

3. **Managing Tasks:**
   - Use the interface to create new tasks.
   - Update existing tasks by selecting them from the list.
   - Delete tasks as needed.
   - Visualize task dependencies to understand project flow.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

# Project Management App

## Opis architektury
- **Backend:** Flask (Python), Neo4j (baza grafowa), REST API
- **Frontend:** HTML, Bootstrap, JavaScript (vis-network do wizualizacji grafu)
- **Struktura katalogów:**
  - `src/` – kod aplikacji
  - `models/`, `routes/`, `services/`, `static/`, `templates/`
  - `tests/` – testy jednostkowe (pytest)

## Uruchomienie Neo4j
### Lokalnie
1. Pobierz Neo4j Community Edition: https://neo4j.com/download/
2. Uruchom Neo4j Desktop lub serwer (`neo4j console`)
3. Ustaw hasło użytkownika `neo4j` i wpisz je do `src/config.py`

### Docker
```powershell
docker run -d --name neo4j -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/your-neo4j-password neo4j:latest
```

## Przykłady użycia API
### Tworzenie zadania
```bash
curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d '{"title": "Test", "description": "Opis"}'
```
### Dodanie zależności
```bash
curl -X POST http://localhost:5000/tasks/1/depends_on -H "Content-Type: application/json" -d '{"depends_on_id": 2}'
```
### Wykrywanie cyklu
```bash
curl http://localhost:5000/graph/has_cycle
```

## Funkcje i innowacje
- CRUD zadań
- Graficzne zarządzanie zależnościami (dodawanie/usuwanie relacji)
- Wizualizacja grafu (vis-network)
- Wykrywanie cykli, topologiczne sortowanie
- Ostrzeżenia o cyklach na froncie
- Testy backendu (pytest)
- Przykładowa obsługa wielu projektów i użytkowników (do rozbudowy)

## Testy
- Testy backendu: `pytest tests/`
- Testy frontendowe: (do rozbudowy, np. Cypress)

## Komentarze i docstringi
- Kod zawiera docstringi i komentarze przy kluczowych metodach (patrz pliki w `src/services/`)

## Rozwój
- Możliwość rozbudowy o obsługę wielu projektów, użytkowników, powiadomienia, historię zmian, tryb ciemny, paginację, walidację itp.