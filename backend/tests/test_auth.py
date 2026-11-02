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

def test_register_duplicate_username(client):
    client.post('/api/auth/register', json={
        'username': 'uniqueuser',
        'email': 'unique1@example.com',
        'password': 'password123'
    })
    res = client.post('/api/auth/register', json={
        'username': 'uniqueuser',
        'email': 'unique2@example.com',
        'password': 'password123'
    })
    assert res.status_code == 400
    assert 'Username already taken' in res.get_json()['error']

def test_register_missing_fields(client):
    res = client.post('/api/auth/register', json={
        'username': 'incomplete'
    })
    assert res.status_code == 400

def test_register_validation_rules(client):
    # Short password
    res_pw = client.post('/api/auth/register', json={
        'username': 'validuser',
        'email': 'valid@example.com',
        'password': '123'
    })
    assert res_pw.status_code == 400
    assert 'Password must contain at least 6 characters' in res_pw.get_json()['error']

    # Invalid email
    res_em = client.post('/api/auth/register', json={
        'username': 'validuser',
        'email': 'not-an-email',
        'password': 'validpassword123'
    })
    assert res_em.status_code == 400
    assert 'Valid email address is required' in res_em.get_json()['error']

    # Short username
    res_un = client.post('/api/auth/register', json={
        'username': 'a',
        'email': 'valid@example.com',
        'password': 'validpassword123'
    })
    assert res_un.status_code == 400
    assert 'Username must be between 2 and 80 characters' in res_un.get_json()['error']


def test_login_wrong_password(client):
    client.post('/api/auth/register', json={
        'username': 'creduser',
        'email': 'cred@example.com',
        'password': 'correctpassword'
    })
    res = client.post('/api/auth/login', json={
        'email': 'cred@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
    assert 'Invalid email or password' in res.get_json()['error']

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

def test_protected_route_invalid_token(client):
    res = client.get('/api/auth/protected', headers={'Authorization': 'Bearer invalid.token.payload'})
    assert res.status_code in [401, 422]

def test_protected_route_authorized(client, register_and_login):
    headers = register_and_login(username='protecteduser', email='protected@example.com')
    res = client.get('/api/auth/protected', headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert 'protecteduser' in data['message']

