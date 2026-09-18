def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "John Doe", "email": "john@example.com", "password": "securepassword123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john@example.com"
    assert data["name"] == "John Doe"
    assert "id" in data
    assert "hashed_password" not in data

def test_register_duplicate_email(client, user_a):
    response = client.post(
        "/api/auth/register",
        json={"name": "Duplicate User", "email": user_a.email, "password": "password123"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client, user_a):
    response = client.post(
        "/api/auth/login",
        json={"email": user_a.email, "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == user_a.email

def test_login_invalid_password(client, user_a):
    response = client.post(
        "/api/auth/login",
        json={"email": user_a.email, "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_current_user(client, auth_headers_a, user_a):
    response = client.get("/api/auth/me", headers=auth_headers_a)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_a.id
    assert data["email"] == user_a.email

def test_unauthenticated_access_blocked(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
