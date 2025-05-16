class GraphService:
    def __init__(self, driver):
        self.driver = driver

    def add_task(self, title, description):
        with self.driver.session() as session:
            session.run(
                "CREATE (t:Task {title: $title, description: $description})",
                title=title, description=description
            )

    def create_relationship(self, task_id_1, task_id_2):
        with self.driver.session() as session:
            session.run("MATCH (a:Task), (b:Task) "
                        "WHERE a.id = $task_id_1 AND b.id = $task_id_2 "
                        "CREATE (a)-[:DEPENDS_ON]->(b)",
                        task_id_1=task_id_1, task_id_2=task_id_2)

    def get_task(self, task_id):
        with self.driver.session() as session:
            result = session.run("MATCH (t:Task) WHERE t.id = $task_id RETURN t",
                                 task_id=task_id)
            return result.single()

    def get_all_tasks(self):
        with self.driver.session() as session:
            result = session.run("MATCH (t:Task) RETURN t")
            return [record["t"] for record in result]

    def get_dependencies(self, task_id):
        with self.driver.session() as session:
            result = session.run("MATCH (t:Task)-[:DEPENDS_ON]->(d:Task) "
                                 "WHERE t.id = $task_id RETURN d",
                                 task_id=task_id)
            return [record["d"] for record in result]