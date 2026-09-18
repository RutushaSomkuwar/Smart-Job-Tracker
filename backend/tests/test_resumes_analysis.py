from app.models.resume import Resume
from app.services.keyword_matcher import analyze_resume_against_job

def test_keyword_matcher_direct():
    resume_text = "Experienced in Python, FastAPI, React, PostgreSQL, Docker, and Git version control."
    job_desc = "Seeking a Full Stack Engineer with Python, FastAPI, PostgreSQL, AWS, and Kubernetes experience."
    
    result = analyze_resume_against_job(resume_text, job_desc)
    assert result["match_percentage"] > 0
    assert "Python" in result["matched_keywords"]
    assert "FastAPI" in result["matched_keywords"]
    assert "PostgreSQL" in result["matched_keywords"]
    assert "AWS" in result["missing_keywords"]
    assert "Kubernetes" in result["missing_keywords"]
    assert len(result["recommendations"]) > 0

def test_analysis_endpoints(client, db_session, user_a, auth_headers_a):
    # Manually create a resume in DB
    resume = Resume(
        user_id=user_a.id,
        filename="resume.pdf",
        extracted_text="Skills: Python, FastAPI, SQL, React, Git, REST API"
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)

    # Test analyze endpoint
    jd = "Requirements: Python, FastAPI, Docker, AWS, React, CI/CD"
    analyze_res = client.post(
        "/api/analysis/analyze",
        json={"resume_id": resume.id, "job_description": jd},
        headers=auth_headers_a
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["resume_id"] == resume.id
    assert "Python" in data["matched_keywords"]
    assert "Docker" in data["missing_keywords"]

    # Test save analysis
    save_res = client.post(
        "/api/analysis/save",
        json={
            "resume_id": resume.id,
            "job_description": jd,
            "match_percentage": data["match_percentage"],
            "matched_keywords": data["matched_keywords"],
            "missing_keywords": data["missing_keywords"],
            "recommendations": data["recommendations"]
        },
        headers=auth_headers_a
    )
    assert save_res.status_code == 201
    assert "id" in save_res.json()
