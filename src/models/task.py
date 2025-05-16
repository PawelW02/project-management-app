class Task:
    def __init__(self, id, title, description):
        self.id = id
        self.title = title
        self.description = description

    def create_task(self):
        # Logic to create a task in the database
        pass

    def update_task(self, title=None, description=None):
        # Logic to update the task details
        if title:
            self.title = title
        if description:
            self.description = description

    def delete_task(self):
        # Logic to delete the task from the database
        pass

    def __repr__(self):
        return f"Task(id={self.id}, title={self.title}, description={self.description})"