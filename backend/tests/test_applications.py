from datetime import date

def test_create_application(client, auth_headers_a):
    payload = {
        "company": "Stripe",
        "job_title": "Full Stack Engineer",
        "job_url": "https://stripe.com/jobs/1",
        "location": "San Francisco, CA",
        "job_type": "Full-time",
        "applied_date": str(date.today()),
        "status": "Applied",
        "salary": "$180,000",
        "notes": "Applied via referral"
    }
    response = client.post("/api/applications", json=payload, headers=auth_headers_a)
    assert response.status_code == 201
    data = response.json()
    assert data["company"] == "Stripe"
    assert data["job_title"] == "Full Stack Engineer"
    assert data["status"] == "Applied"
    assert "id" in data

def test_list_applications_and_filter(client, auth_headers_a):
    # Create multiple applications
    client.post("/api/applications", json={"company": "Google", "job_title": "SWE", "status": "Interview"}, headers=auth_headers_a)
    client.post("/api/applications", json={"company": "Meta", "job_title": "Frontend Engineer", "status": "Applied"}, headers=auth_headers_a)
    client.post("/api/applications", json={"company": "Amazon", "job_title": "DevOps Engineer", "status": "Offer"}, headers=auth_headers_a)

    # Test list all
    res = client.get("/api/applications", headers=auth_headers_a)
    assert res.status_code == 200
    assert len(res.json()) == 3

    # Test filter by status
    res_status = client.get("/api/applications?status=Interview", headers=auth_headers_a)
    assert res_status.status_code == 200
    assert len(res_status.json()) == 1
    assert res_status.json()[0]["company"] == "Google"

    # Test search by query
    res_search = client.get("/api/applications?search=frontend", headers=auth_headers_a)
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert res_search.json()[0]["company"] == "Meta"

def test_update_application(client, auth_headers_a):
    create_res = client.post(
        "/api/applications",
        json={"company": "Netflix", "job_title": "Senior Engineer", "status": "Applied"},
        headers=auth_headers_a
    )
    app_id = create_res.json()["id"]

    # Update status to Offer
    update_res = client.put(
        f"/api/applications/{app_id}",
        json={"status": "Offer", "salary": "$210,000"},
        headers=auth_headers_a
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Offer"
    assert update_res.json()["salary"] == "$210,000"

def test_delete_application(client, auth_headers_a):
    create_res = client.post(
        "/api/applications",
        json={"company": "Spotify", "job_title": "Backend Dev", "status": "Applied"},
        headers=auth_headers_a
    )
    app_id = create_res.json()["id"]

    del_res = client.delete(f"/api/applications/{app_id}", headers=auth_headers_a)
    assert del_res.status_code == 204

    get_res = client.get(f"/api/applications/{app_id}", headers=auth_headers_a)
    assert get_res.status_code == 404
