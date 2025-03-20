import os
import threading
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring

# Create the Flask app
app = create_app()

# Set up your allowed origins; adjust for your real Cloudflare domain if needed
allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")
]

CORS(
    app,
    supports_credentials=True,
    origins=allowed_origins,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "GET":
        return jsonify({"message": "Watchly API is running!"}), 200
    elif request.method == "POST":
        data = request.get_json()
        return jsonify({"received": data}), 200

@app.route("/<path:path>", methods=["OPTIONS"])
def handle_cors_preflight(path):
    """
    Manually handle OPTIONS preflight requests (if needed).
    Flask-CORS typically does this automatically, but you have extra logic here.
    """
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins:
        response = jsonify({"message": "CORS preflight OK"})
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

    response = jsonify({"error": "CORS origin not allowed"})
    return response, 403

@app.after_request
def apply_cors_headers(response):
    """Ensure CORS headers are applied to all responses."""
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

def initialize_app():
    """
    Common setup code that should run once on startup, both locally and in production.
    """
    with app.app_context():
        # If you're using migrations, you might prefer running 'flask db upgrade' here
        # instead of 'db.create_all()'. For example:
        #
        # import subprocess
        # subprocess.run(["flask", "db", "upgrade"])
        #
        db.create_all()
        print("✅ Database created successfully!")

    # Start monitoring in a separate thread
    monitoring_thread = threading.Thread(target=start_monitoring, args=(app,), daemon=True)
    monitoring_thread.start()

# ---------------------------------------------------------------------
# Only run the built-in Flask server if we run 'python main.py' directly.
# Gunicorn will just import 'app' and call it on its own, ignoring app.run().
# ---------------------------------------------------------------------
if __name__ == "__main__":
    initialize_app()

    port = int(os.environ.get("PORT", 5000))
    # For local development only, run the Flask dev server:
    app.run(host="0.0.0.0", port=port, debug=True)
else:
    # Production path (Gunicorn)
    initialize_app()
    # No app.run() here. Gunicorn will serve 'app' as defined above.
