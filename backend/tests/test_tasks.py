import json

def test_task_crud_lifecycle(client, register_and_login):
    headers = register_and_login(username='cruduser', email='crud@example.com')
    
    # 1. Create task
    create_res = client.post('/api/tasks', headers=headers, json={
        'title': 'Test CRUD Task',
        'description': 'CRUD task description',
        'priority': 'high',
        'category': 'Engineering'
    })
    assert create_res.status_code == 201
    created_task = create_res.get_json()['task']
    task_id = created_task['id']
    assert created_task['title'] == 'Test CRUD Task'
    assert created_task['priority'] == 'high'
    assert created_task['category'] == 'Engineering'
    assert created_task['completed'] is False
    assert created_task['status'] == 'todo'

    # 2. Get tasks list
    get_res = client.get('/api/tasks', headers=headers)
    assert get_res.status_code == 200
    tasks_list = get_res.get_json()
    assert len(tasks_list) == 1
    assert tasks_list[0]['id'] == task_id

    # 3. Update task
    update_res = client.put(f'/api/tasks/{task_id}', headers=headers, json={
        'title': 'Updated CRUD Task',
        'completed': True,
        'priority': 'urgent'
    })
    assert update_res.status_code == 200
    updated_task = update_res.get_json()['task']
    assert updated_task['title'] == 'Updated CRUD Task'
    assert updated_task['completed'] is True
    assert updated_task['status'] == 'done'
    assert updated_task['priority'] == 'urgent'

    # 4. Delete task
    del_res = client.delete(f'/api/tasks/{task_id}', headers=headers)
    assert del_res.status_code == 200

    # 5. Verify deleted
    get_after_del = client.get('/api/tasks', headers=headers)
    assert len(get_after_del.get_json()) == 0

def test_multi_tenant_task_isolation(client, register_and_login):
    user_a_headers = register_and_login(username='userA', email='userA@example.com')
    user_b_headers = register_and_login(username='userB', email='userB@example.com')

    # User A creates a task
    create_res = client.post('/api/tasks', headers=user_a_headers, json={
        'title': "User A Private Task"
    })
    task_a_id = create_res.get_json()['task']['id']

    # User B lists tasks - should see 0
    b_tasks = client.get('/api/tasks', headers=user_b_headers).get_json()
    assert len(b_tasks) == 0

    # User B attempts to update User A's task - should return 404
    b_update = client.put(f'/api/tasks/{task_a_id}', headers=user_b_headers, json={
        'title': 'Hacked Title'
    })
    assert b_update.status_code == 404

    # User B attempts to delete User A's task - should return 404
    b_delete = client.delete(f'/api/tasks/{task_a_id}', headers=user_b_headers)
    assert b_delete.status_code == 404

def test_task_filters_and_search(client, register_and_login):
    headers = register_and_login(username='filteruser', email='filter@example.com')

    # Create multiple tasks
    client.post('/api/tasks', headers=headers, json={'title': 'Urgent Bugfix', 'priority': 'urgent', 'category': 'Engineering'})
    client.post('/api/tasks', headers=headers, json={'title': 'Low priority cleanup', 'priority': 'low', 'category': 'General'})
    client.post('/api/tasks', headers=headers, json={'title': 'Design review meeting', 'priority': 'medium', 'category': 'Design'})

    # Filter by priority
    urgent_res = client.get('/api/tasks?priority=urgent', headers=headers)
    assert len(urgent_res.get_json()) == 1
    assert urgent_res.get_json()[0]['title'] == 'Urgent Bugfix'

    # Filter by category
    design_res = client.get('/api/tasks?category=Design', headers=headers)
    assert len(design_res.get_json()) == 1
    assert design_res.get_json()[0]['title'] == 'Design review meeting'

    # Search text
    search_res = client.get('/api/tasks?search=cleanup', headers=headers)
    assert len(search_res.get_json()) == 1
    assert search_res.get_json()[0]['title'] == 'Low priority cleanup'

def test_task_status_decoupling_and_sync(client, register_and_login):
    headers = register_and_login(username='statususer', email='status@example.com')

    # 1. Create task with explicit status 'in_progress' and priority 'low' (decoupled)
    res = client.post('/api/tasks', headers=headers, json={
        'title': 'In Progress Task',
        'status': 'in_progress',
        'priority': 'low'
    })
    assert res.status_code == 201
    task = res.get_json()['task']
    assert task['status'] == 'in_progress'
    assert task['priority'] == 'low'
    assert task['completed'] is False
    task_id = task['id']

    # 2. Update status to 'done' -> should automatically set completed = True
    update_res = client.put(f'/api/tasks/{task_id}', headers=headers, json={
        'status': 'done'
    })
    assert update_res.status_code == 200
    updated = update_res.get_json()['task']
    assert updated['status'] == 'done'
    assert updated['completed'] is True

    # 3. Toggle completed = False -> should automatically reset status from 'done' to 'todo'
    uncheck_res = client.put(f'/api/tasks/{task_id}', headers=headers, json={
        'completed': False
    })
    assert uncheck_res.status_code == 200
    unchecked = uncheck_res.get_json()['task']
    assert unchecked['completed'] is False
    assert unchecked['status'] == 'todo'

    # 4. Drag to 'in_progress' -> should keep completed = False
    move_progress = client.put(f'/api/tasks/{task_id}', headers=headers, json={
        'status': 'in_progress'
    })
    assert move_progress.status_code == 200
    in_prog = move_progress.get_json()['task']
    assert in_prog['status'] == 'in_progress'
    assert in_prog['completed'] is False

    # 5. Conflicting payload: status='todo' and completed=True -> status takes precedence, completed reconciled to False
    conflict_res = client.put(f'/api/tasks/{task_id}', headers=headers, json={
        'status': 'todo',
        'completed': True
    })
    assert conflict_res.status_code == 200
    reconciled = conflict_res.get_json()['task']
    assert reconciled['status'] == 'todo'
    assert reconciled['completed'] is False

def test_task_status_filtering(client, register_and_login):
    headers = register_and_login(username='statusfilteruser', email='statusfilter@example.com')

    client.post('/api/tasks', headers=headers, json={'title': 'Todo Item 1', 'status': 'todo'})
    client.post('/api/tasks', headers=headers, json={'title': 'Todo Item 2', 'status': 'todo'})
    client.post('/api/tasks', headers=headers, json={'title': 'WIP Item', 'status': 'in_progress'})
    client.post('/api/tasks', headers=headers, json={'title': 'Done Item', 'status': 'done'})

    todo_res = client.get('/api/tasks?status=todo', headers=headers)
    assert len(todo_res.get_json()) == 2

    wip_res = client.get('/api/tasks?status=in_progress', headers=headers)
    assert len(wip_res.get_json()) == 1
    assert wip_res.get_json()[0]['title'] == 'WIP Item'

    done_res = client.get('/api/tasks?status=done', headers=headers)
    assert len(done_res.get_json()) == 1
    assert done_res.get_json()[0]['title'] == 'Done Item'

def test_subtasks_lifecycle(client, register_and_login):
    headers = register_and_login(username='subtaskuser', email='subtask@example.com')

    # 1. Create task with initial subtasks
    create_res = client.post('/api/tasks', headers=headers, json={
        'title': 'Task with Checklists',
        'subtasks': [
            {'title': 'Subtask Alpha', 'completed': False}
        ]
    })
    assert create_res.status_code == 201
    task = create_res.get_json()['task']
    task_id = task['id']
    assert len(task['subtasks']) == 1
    assert task['subtasks'][0]['title'] == 'Subtask Alpha'
    assert task['subtasks'][0]['completed'] is False
    initial_subtask_id = task['subtasks'][0]['id']

    # 2. Add second subtask via dedicated endpoint
    add_res = client.post(f'/api/tasks/{task_id}/subtasks', headers=headers, json={
        'title': 'Subtask Beta'
    })
    assert add_res.status_code == 201
    added_subtask = add_res.get_json()['subtask']
    beta_id = added_subtask['id']
    assert added_subtask['title'] == 'Subtask Beta'
    assert len(add_res.get_json()['task']['subtasks']) == 2

    # 3. Toggle subtask completion
    toggle_res = client.put(f'/api/tasks/{task_id}/subtasks/{beta_id}', headers=headers, json={
        'completed': True
    })
    assert toggle_res.status_code == 200
    updated_subtasks = toggle_res.get_json()['task']['subtasks']
    beta_item = next(s for s in updated_subtasks if s['id'] == beta_id)
    assert beta_item['completed'] is True

    # 4. Batch update subtasks via parent task PUT
    batch_res = client.put(f'/api/tasks/{task_id}', headers=headers, json={
        'subtasks': [
            {'id': initial_subtask_id, 'title': 'Subtask Alpha Renamed', 'completed': True}
        ]
    })
    assert batch_res.status_code == 200
    assert len(batch_res.get_json()['task']['subtasks']) == 1
    assert batch_res.get_json()['task']['subtasks'][0]['title'] == 'Subtask Alpha Renamed'

    # 5. Delete remaining subtask
    del_res = client.delete(f'/api/tasks/{task_id}/subtasks/{initial_subtask_id}', headers=headers)
    assert del_res.status_code == 200
    assert len(del_res.get_json()['task']['subtasks']) == 0

def test_subtasks_multi_tenant_isolation(client, register_and_login):
    user_a = register_and_login(username='subA', email='suba@example.com')
    user_b = register_and_login(username='subB', email='subb@example.com')

    # User A creates a task with a subtask
    create_res = client.post('/api/tasks', headers=user_a, json={
        'title': "User A Task",
        'subtasks': [{'id': 'sub-secret', 'title': 'Private Subtask', 'completed': False}]
    })
    task_id = create_res.get_json()['task']['id']

    # User B attempts to add a subtask to User A's task -> 404
    b_add = client.post(f'/api/tasks/{task_id}/subtasks', headers=user_b, json={
        'title': 'Hacked Subtask'
    })
    assert b_add.status_code == 404

    # User B attempts to update User A's subtask -> 404
    b_update = client.put(f'/api/tasks/{task_id}/subtasks/sub-secret', headers=user_b, json={
        'completed': True
    })
    assert b_update.status_code == 404

    # User B attempts to delete User A's subtask -> 404
    b_del = client.delete(f'/api/tasks/{task_id}/subtasks/sub-secret', headers=user_b)
    assert b_del.status_code == 404
