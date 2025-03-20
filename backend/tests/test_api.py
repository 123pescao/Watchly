import json
import pytest
from app import create_app, db
from app.models import User, Website, Metric, Alert

@pytest.fixture
def client():
    """Set up a test client for Flask app"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

# ✅ AUTH TESTS
def test_register(client):
    response = client.post('/auth/register', json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepass"
    })
    assert response.status_code == 201

def test_login(client):
    client.post('/auth/register', json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepass"
    })
    response = client.post('/auth/login', json={
        "email": "test@example.com",
        "password": "securepass"
    })
    assert response.status_code == 200
    assert b"token" in response.data

def test_profile(client):
    client.post('/auth/register', json={"name": "Test User", "email": "test@example.com", "password": "securepass"})
    login_response = client.post('/auth/login', json={"email": "test@example.com", "password": "securepass"})
    token = json.loads(login_response.data)["token"]

    response = client.get('/auth/profile', headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_change_password(client):
    client.post('/auth/register', json={"name": "Test User", "email": "test@example.com", "password": "securepass"})
    login_response = client.post('/auth/login', json={"email": "test@example.com", "password": "securepass"})
    token = json.loads(login_response.data)["token"]

    response = client.put('/auth/change-password', json={"old_password": "securepass", "new_password": "newpass"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_delete_user(client):
    client.post('/auth/register', json={"name": "Test User", "email": "test@example.com", "password": "securepass"})
    login_response = client.post('/auth/login', json={"email": "test@example.com", "password": "securepass"})
    token = json.loads(login_response.data)["token"]

    response = client.delete('/auth/delete', headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

# ✅ WEBSITE TESTS
def test_add_website(client):
    client.post('/auth/register', json={"name": "Test User", "email": "test@example.com", "password": "securepass"})
    login_response = client.post('/auth/login', json={"email": "test@example.com", "password": "securepass"})
    token = json.loads(login_response.data)["token"]

    response = client.post('/websites/add', json={"url": "http://example.com", "name": "Example Site"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201

def test_get_websites(client):
    response = client.get('/websites/')
    assert response.status_code == 401  # Unauthorized

# ✅ ALERTS TESTS
def test_add_alert(client):
    client.post('/auth/register', json={"name": "Test User", "email": "test@example.com", "password": "securepass"})
    login_response = client.post('/auth/login', json={"email": "test@example.com", "password": "securepass"})
    token = json.loads(login_response.data)["token"]

    client.post('/websites/add', json={"url": "http://example.com", "name": "Example Site"}, headers={"Authorization": f"Bearer {token}"})
    response = client.post('/alerts/add', json={"website_id": 1, "alert_type": "Downtime"}, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201

def test_get_alerts(client):
    response = client.get('/alerts/')
    assert response.status_code == 401  # Unauthorized

def test_resolve_alert(client):
    client.post('/auth/register', json={"name": "Test User", "email": "test@example.com", "password": "securepass"})
    login_response = client.post('/auth/login', json={"email": "test@example.com", "password": "securepass"})
    token = json.loads(login_response.data)["token"]

    client.post('/websites/add', json={"url": "http://example.com", "name": "Example Site"}, headers={"Authorization": f"Bearer {token}"})
    client.post('/alerts/add', json={"website_id": 1, "alert_type": "Downtime"}, headers={"Authorization": f"Bearer {token}"})

    response = client.put('/alerts/resolve/1', headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

# ✅ SYSTEM TEST
def test_status(client):
    response = client.get('/status')
    print("TEST RESPONSE:", response.status_code, response.data)
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response: {response.data}"
