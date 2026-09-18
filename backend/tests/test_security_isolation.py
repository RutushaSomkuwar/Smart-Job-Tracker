from app.models.application import JobApplication
from app.models.resume import Resume

def test_user_cannot_access_other_user_application(client, db_session, user_a, user_b, auth_headers_a, auth_headers_b):
    # Create application owned by User B
    app_b = JobApplication(
        user_id=user_b.id,
        company="Secret Corp",
        job_title="Lead Architect",
        status="Interview"
    )
    db_session.add(app_b)
    db_session.commit()
    db_session.refresh(app_b)

    # User A tries to GET User B's application
    res_get = client.get(f"/api/applications/{app_b.id}", headers=auth_headers_a)
    assert res_get.status_code == 404

    # User A tries to UPDATE User B's application
    res_put = client.put(f"/api/applications/{app_b.id}", json={"company": "Hacked"}, headers=auth_headers_a)
    assert res_put.status_code == 404

    # User A tries to DELETE User B's application
    res_del = client.delete(f"/api/applications/{app_b.id}", headers=auth_headers_a)
    assert res_del.status_code == 404

    # Application should still exist and belong to User B
    res_b_get = client.get(f"/api/applications/{app_b.id}", headers=auth_headers_b)
    assert res_b_get.status_code == 200
    assert res_b_get.json()["company"] == "Secret Corp"

def test_user_cannot_access_other_user_resume(client, db_session, user_a, user_b, auth_headers_a, auth_headers_b):
    # Resume owned by User B
    resume_b = Resume(
        user_id=user_b.id,
        filename="user_b_resume.pdf",
        extracted_text="Secret skills of user B"
    )
    db_session.add(resume_b)
    db_session.commit()
    db_session.refresh(resume_b)

    # User A tries to read User B's resume
    res_get = client.get(f"/api/resumes/{resume_b.id}", headers=auth_headers_a)
    assert res_get.status_code == 404

    # User A tries to analyze with User B's resume
    res_analyze = client.post(
        "/api/analysis/analyze",
        json={"resume_id": resume_b.id, "job_description": "Requirements: Python"},
        headers=auth_headers_a
    )
    assert res_analyze.status_code == 404
