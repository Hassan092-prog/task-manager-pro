import json

def test_register_success(client):
    res = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'password123'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert 'access_token' in data
    assert data['user']['username'] == 'newuser'
    assert data['user']['email'] == 'newuser@example.com'

def test_register_duplicate_email(client):
    client.post('/api/auth/register', json={
        'username': 'firstuser',
        'email': 'duplicate@example.com',
        'password': 'password123'
    })
    res = client.post('/api/auth/register', json={
        'username': 'seconduser',
        'email': 'duplicate@example.com',
        'password': 'password123'
    })
    assert res.status_code == 400
    assert 'Email already registered' in res.get_json()['error']

def test_login_success(client):
    client.post('/api/auth/register', json={
        'username': 'loginuser',
        'email': 'login@example.com',
        'password': 'password123'
    })
    res = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'password123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'access_token' in data
    assert data['user']['email'] == 'login@example.com'

def test_login_invalid_credentials(client):
    res = client.post('/api/auth/login', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
    assert 'Invalid email or password' in res.get_json()['error']

def test_protected_route_unauthorized(client):
    res = client.get('/api/auth/protected')
    assert res.status_code == 401

def test_protected_route_authorized(client, register_and_login):
    headers = register_and_login(username='protecteduser', email='protected@example.com')
    res = client.get('/api/auth/protected', headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert 'protecteduser' in data['message']

