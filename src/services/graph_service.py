class GraphService:
    """
    Serwis do obsługi operacji na grafie zadań w Neo4j, z obsługą wielu projektów i logowaniem zmian.
    """
    def __init__(self, driver):
        self.driver = driver

    def log_action(self, action, details):
        with open('history.log', 'a', encoding='utf-8') as f:
            from datetime import datetime
            f.write(f"[{datetime.now()}] {action}: {details}\n")

    def add_task(self, title, description, project_id):
        """Dodaje nowe zadanie do grafu w ramach projektu."""
        with self.driver.session() as session:
            session.run(
                "CREATE (t:Task {title: $title, description: $description, project_id: $project_id})",
                title=title, description=description, project_id=project_id
            )
        self.log_action('add_task', f'{title} (project {project_id})')

    def create_relationship(self, task_id_1, task_id_2):
        """Tworzy relację zależności między dwoma zadaniami."""
        with self.driver.session() as session:
            session.run("MATCH (a:Task), (b:Task) WHERE id(a) = $task_id_1 AND id(b) = $task_id_2 CREATE (a)-[:DEPENDS_ON]->(b)",
                        task_id_1=int(task_id_1), task_id_2=int(task_id_2))
        self.log_action('create_relationship', f'{task_id_1} -> {task_id_2}')

    def get_task(self, task_id):
        """Pobiera zadanie po id."""
        with self.driver.session() as session:
            result = session.run("MATCH (t:Task) WHERE id(t) = $task_id RETURN t",
                                 task_id=int(task_id))
            return result.single()

    def get_all_tasks(self, project_id=None):
        """Zwraca listę wszystkich zadań z id, tytułem i opisem dla danego projektu."""
        with self.driver.session() as session:
            if project_id is not None:
                result = session.run("MATCH (t:Task) WHERE t.project_id = $project_id RETURN id(t) as id, t.title as title, t.description as description, t.project_id as project_id",
                                     project_id=project_id)
            else:
                result = session.run("MATCH (t:Task) RETURN id(t) as id, t.title as title, t.description as description, t.project_id as project_id")
            return [{"id": record["id"], "title": record["title"], "description": record["description"], "project_id": record["project_id"]} for record in result]

    def get_projects(self):
        """Zwraca listę projektów (unikalne project_id)."""
        with self.driver.session() as session:
            result = session.run("MATCH (t:Task) RETURN DISTINCT t.project_id as project_id")
            return [record["project_id"] for record in result if record["project_id"]]

    def get_dependencies(self, task_id):
        """Zwraca listę zadań, od których zależy podane zadanie."""
        with self.driver.session() as session:
            result = session.run("MATCH (t:Task)-[:DEPENDS_ON]->(d:Task) WHERE id(t) = $task_id RETURN id(d) as id, d.title as title, d.description as description",
                                 task_id=int(task_id))
            return [{"id": record["id"], "title": record["title"], "description": record["description"]} for record in result]

    def get_graph(self, project_id=None):
        """Zwraca krawędzie grafu zależności do wizualizacji, opcjonalnie tylko dla danego projektu."""
        with self.driver.session() as session:
            if project_id is not None:
                result = session.run(
                    """
                    MATCH (a:Task)-[r:DEPENDS_ON]->(b:Task)
                    WHERE a.project_id = $project_id AND b.project_id = $project_id
                    RETURN id(a) as from_id, a.title as from_title, id(b) as to_id, b.title as to_title
                    """,
                    project_id=project_id
                )
            else:
                result = session.run(
                    "MATCH (a:Task)-[r:DEPENDS_ON]->(b:Task) RETURN id(a) as from_id, a.title as from_title, id(b) as to_id, b.title as to_title"
                )
            edges = [{
                "from": record["from_id"],
                "to": record["to_id"],
                "from_title": record["from_title"],
                "to_title": record["to_title"]
            } for record in result]
            return edges

    def has_cycle(self):
        """Wykrywa cykl w grafie zadań."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH p=(n:Task)-[:DEPENDS_ON*]->(n)
                RETURN count(p) > 0 as has_cycle
            """)
            return result.single()["has_cycle"]

    def topological_sort(self):
        """Zwraca listę id zadań w kolejności topologicznej (jeśli nie ma cyklu)."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (n:Task)
                OPTIONAL MATCH (n)-[:DEPENDS_ON]->(m:Task)
                WITH n, collect(id(m)) as deps
                RETURN id(n) as id, deps
            """)
            from collections import defaultdict, deque
            graph = defaultdict(list)
            in_degree = defaultdict(int)
            nodes = set()
            for record in result:
                nid = record["id"]
                deps = record["deps"]
                nodes.add(nid)
                for dep in deps:
                    if dep is not None:
                        graph[dep].append(nid)
                        in_degree[nid] += 1
                        nodes.add(dep)
            queue = deque([n for n in nodes if in_degree[n] == 0])
            order = []
            while queue:
                node = queue.popleft()
                order.append(node)
                for neighbor in graph[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)
            if len(order) != len(nodes):
                return None  # Cykl
            return order

    def update_task(self, task_id, title, description):
        """Aktualizuje tytuł i opis zadania."""
        with self.driver.session() as session:
            session.run(
                "MATCH (t:Task) WHERE id(t) = $task_id SET t.title = $title, t.description = $description",
                task_id=int(task_id), title=title, description=description
            )
        self.log_action('update_task', f'{task_id}: {title}')

    def delete_task(self, task_id):
        """Usuwa zadanie i jego relacje z grafu."""
        with self.driver.session() as session:
            session.run(
                "MATCH (t:Task) WHERE id(t) = $task_id DETACH DELETE t",
                task_id=int(task_id)
            )
        self.log_action('delete_task', f'id: {task_id}')