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