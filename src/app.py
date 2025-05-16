from flask import Flask, render_template
from config import Config
from routes.tasks import tasks_bp
import atexit
from routes.tasks import driver

app = Flask(__name__)
app.config.from_object(Config)

app.register_blueprint(tasks_bp)
atexit.register(driver.close)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)