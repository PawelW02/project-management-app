from flask import Blueprint, request, jsonify
from models.task import Task
from services.graph_service import GraphService
from neo4j import GraphDatabase
from config import Config

driver = GraphDatabase.driver(
    Config.NEO4J_URI, 
    auth=(Config.NEO4J_USER, Config.NEO4J_PASSWORD)
)
graph_service = GraphService(driver)

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/projects', methods=['GET'])
def list_projects():
    projects = graph_service.get_projects()
    return jsonify(projects)

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    title = data['title']
    description = data['description']
    project_id = data.get('project_id', 'default')
    graph_service.add_task(title, description, project_id)
    return jsonify({'message': 'Task created successfully'}), 201

@tasks_bp.route('/tasks', methods=['GET'])
def list_tasks():
    project_id = request.args.get('project_id')
    tasks = graph_service.get_all_tasks(project_id)
    tasks_list = [
        {
            'id': task['id'] if 'id' in task else None,
            'title': task['title'],
            'description': task['description'],
            'project_id': task.get('project_id', 'default')
        }
        for task in tasks
    ]
    return jsonify(tasks_list)

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    graph_service.update_task(task_id, title, description)
    return jsonify({'message': 'Task updated successfully'})

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    graph_service.delete_task(task_id)
    return jsonify({'message': 'Task deleted successfully'})

@tasks_bp.route('/tasks/<int:task_id>/dependencies', methods=['GET'])
def get_dependencies(task_id):
    deps = graph_service.get_dependencies(task_id)
    return jsonify(deps)

@tasks_bp.route('/tasks/<int:task_id>/depends_on', methods=['POST'])
def add_dependency(task_id):
    data = request.json
    depends_on_id = data.get('depends_on_id')
    graph_service.create_relationship(task_id, depends_on_id)
    return jsonify({'message': 'Dependency created'})

@tasks_bp.route('/tasks/<int:from_id>/depends_on/<int:to_id>', methods=['DELETE'])
def remove_dependency(from_id, to_id):
    with driver.session() as session:
        session.run(
            "MATCH (a:Task)-[r:DEPENDS_ON]->(b:Task) WHERE id(a) = $from_id AND id(b) = $to_id DELETE r",
            from_id=from_id, to_id=to_id
        )
    return jsonify({'message': 'Dependency removed'})

@tasks_bp.route('/graph', methods=['GET'])
def get_graph():
    project_id = request.args.get('project_id')
    edges = graph_service.get_graph(project_id)
    return jsonify(edges)

@tasks_bp.route('/graph/has_cycle', methods=['GET'])
def has_cycle():
    result = graph_service.has_cycle()
    return jsonify({'has_cycle': result})

@tasks_bp.route('/graph/topological_sort', methods=['GET'])
def topological_sort():
    result = graph_service.topological_sort()
    return jsonify({'order': result})