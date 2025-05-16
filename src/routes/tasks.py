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

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    title = data['title']
    description = data['description']
    graph_service.add_task(title, description)
    return jsonify({'message': 'Task created successfully'}), 201

@tasks_bp.route('/tasks', methods=['GET'])
def list_tasks():
    tasks = graph_service.get_all_tasks()
    # Zamień na listę słowników
    tasks_list = [
        {
            'id': task['id'] if 'id' in task else None,
            'title': task['title'],
            'description': task['description']
        }
        for task in tasks
    ]
    return jsonify(tasks_list)