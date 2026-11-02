def test_home_json_status(client):
    res = client.get('/', headers={'Accept': 'application/json'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['service'] == 'Task Manager Pro API'
    assert data['status'] == 'operational'
    assert data['version'] == '1.4.0'
    assert 'tasks_list' in data['endpoints']
    assert 'subtasks_create' in data['endpoints']

def test_home_html_dashboard(client):
    res = client.get('/', headers={'Accept': 'text/html'})
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert 'Task Manager Pro' in html
    assert 'v1.4.0' in html
    assert 'operational' in html.lower()

def test_home_query_param_format_json(client):
    res = client.get('/?format=json', headers={'Accept': 'text/html'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['version'] == '1.4.0'

def test_api_404_json_response(client):
    res = client.get('/api/nonexistent-endpoint', headers={'Accept': 'application/json'})
    assert res.status_code == 404
    data = res.get_json()
    assert data is not None
    assert 'error' in data

def test_api_405_json_response(client):
    res = client.delete('/api/auth/login')
    assert res.status_code == 405
    data = res.get_json()
    assert data is not None
    assert 'error' in data


