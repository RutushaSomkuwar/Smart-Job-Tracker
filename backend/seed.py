"""
Seed script to populate the database with realistic demo user and job applications for testing and evaluation.
Usage:
    python seed.py
"""
import sys
from datetime import date, timedelta
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.application import JobApplication
from app.models.resume import Resume
from app.models.analysis import JobAnalysis
from app.utils.security import get_password_hash
from app.services.keyword_matcher import analyze_resume_against_job

def seed_database():
    print("Ensuring database tables are initialized...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if demo user already exists
        demo_email = "demo@jobtracker.dev"
        user = db.query(User).filter(User.email == demo_email).first()

        if not user:
            print(f"Creating demo user: {demo_email}")
            user = User(
                name="Alex Morgan",
                email=demo_email,
                hashed_password=get_password_hash("demo123456")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Demo user created with ID: {user.id}")
        else:
            print(f"Demo user already exists with ID: {user.id}")

        # Check existing applications
        existing_apps_count = db.query(JobApplication).filter(JobApplication.user_id == user.id).count()
        if existing_apps_count == 0:
            print("Creating sample job applications...")
            today = date.today()

            sample_apps = [
                {
                    "company": "Stripe",
                    "job_title": "Full Stack Software Engineer",
                    "job_url": "https://stripe.com/jobs/full-stack-engineer",
                    "location": "San Francisco, CA (Hybrid)",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=22),
                    "status": "Offer",
                    "salary": "$175,000 - $195,000",
                    "notes": "Passed system design and live coding rounds. Recruiter called with an offer for $185k base + equity!"
                },
                {
                    "company": "Spotify",
                    "job_title": "Backend Engineer - Content Platforms",
                    "job_url": "https://spotify.com/jobs/backend-engineer",
                    "location": "New York, NY (Remote)",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=15),
                    "status": "Interview",
                    "salary": "$160,000 - $180,000",
                    "notes": "Technical screening scheduled for next Tuesday. Review Kafka, Python, and microservices architecture."
                },
                {
                    "company": "Airbnb",
                    "job_title": "Senior Frontend Developer",
                    "job_url": "https://careers.airbnb.com/positions/senior-frontend",
                    "location": "Remote",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=28),
                    "status": "Interview",
                    "salary": "$170,000",
                    "notes": "Completed initial screen. Round 2 is a 90-minute React component architecture & accessibility interview."
                },
                {
                    "company": "Google",
                    "job_title": "Software Engineer II - Cloud",
                    "job_url": "https://careers.google.com/jobs/results/swe2-cloud",
                    "location": "Sunnyvale, CA",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=10),
                    "status": "Assessment",
                    "salary": "$165,000 - $185,000",
                    "notes": "Completed online technical assessment (OA) on HackerRank. Received 100% test cases passed."
                },
                {
                    "company": "Vercel",
                    "job_title": "Developer Experience Engineer",
                    "job_url": "https://vercel.com/careers/dx-engineer",
                    "location": "Remote",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=5),
                    "status": "Screening",
                    "salary": "$150,000 - $165,000",
                    "notes": "Applied via referral. Recruiter reached out for 30min intro call on Thursday."
                },
                {
                    "company": "Datadog",
                    "job_title": "Python Backend Engineer",
                    "job_url": "https://careers.datadoghq.com/detail/python-swe",
                    "location": "Boston, MA (Hybrid)",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=3),
                    "status": "Applied",
                    "salary": "$155,000",
                    "notes": "Applied on company portal with tailored resume."
                },
                {
                    "company": "Meta",
                    "job_title": "Product Software Engineer",
                    "job_url": "https://metacareers.com/swe",
                    "location": "Menlo Park, CA",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=35),
                    "status": "Rejected",
                    "salary": "$180,000",
                    "notes": "Passed OA, but position filled internally. Encouraged to reapply in 6 months."
                },
                {
                    "company": "Uber",
                    "job_title": "Software Engineer - Core Services",
                    "job_url": "https://uber.com/careers",
                    "location": "Seattle, WA",
                    "job_type": "Full-time",
                    "applied_date": today - timedelta(days=18),
                    "status": "Withdrawn",
                    "salary": "$165,000",
                    "notes": "Withdrawn due to relocation requirement."
                }
            ]

            created_apps = []
            for app_data in sample_apps:
                app = JobApplication(user_id=user.id, **app_data)
                db.add(app)
                created_apps.append(app)

            db.commit()
            print(f"Created {len(sample_apps)} sample applications.")

            # Create a sample resume and analysis
            sample_resume_text = """
            Alex Morgan
            Full Stack Software Engineer | alex.morgan@email.com | GitHub: alexmorgan-dev | LinkedIn: /in/alexmorgan
            
            SUMMARY
            Versatile Full Stack Developer with 4+ years of experience building scalable web applications, REST APIs, and responsive frontends. Experienced in Python, FastAPI, React, TypeScript, PostgreSQL, and Docker.
            
            TECHNICAL SKILLS
            - Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3
            - Frameworks & Libraries: FastAPI, React, Node.js, Express, Tailwind CSS, Next.js
            - Databases & Caching: PostgreSQL, MySQL, Redis, SQLAlchemy
            - Tools & DevOps: Git, GitHub, Docker, CI/CD, Linux, Postman, Jest, PyTest
            
            PROFESSIONAL EXPERIENCE
            Full Stack Developer | TechNova Solutions (2023 - Present)
            - Built high-performance microservices using FastAPI, Python, and PostgreSQL, cutting API response times by 35%.
            - Developed dynamic React and Tailwind CSS web dashboard used by 20,000+ monthly active users.
            - Implemented secure JWT authentication and role-based access control (RBAC).
            - Containerized services using Docker and automated test pipelines with GitHub Actions CI/CD.
            
            PROJECTS
            - Cloud Application Platform: Built with React, FastAPI, PostgreSQL, and Docker.
            - Real-Time Analytics Portal: Engineered REST APIs in Python with SQL query optimizations.
            """

            resume = Resume(
                user_id=user.id,
                filename="Alex_Morgan_FullStack_Resume.pdf",
                extracted_text=sample_resume_text
            )
            db.add(resume)
            db.commit()
            db.refresh(resume)

            # Link analysis to Stripe application
            stripe_app = next((a for a in created_apps if a.company == "Stripe"), None)
            stripe_jd = """
            We are looking for a Full Stack Software Engineer to build scalable payment infrastructure.
            Key Requirements:
            - Experience with Python, FastAPI, or Node.js backend development.
            - Strong knowledge of PostgreSQL, SQL, and database transactions.
            - Modern frontend experience in React, JavaScript/TypeScript, and CSS.
            - Familiarity with REST APIs, Git, Docker, and AWS cloud environments.
            - Experience with CI/CD and unit testing.
            """

            analysis_result = analyze_resume_against_job(sample_resume_text, stripe_jd)
            
            analysis = JobAnalysis(
                user_id=user.id,
                application_id=stripe_app.id if stripe_app else None,
                resume_id=resume.id,
                job_description=stripe_jd.strip(),
                match_percentage=analysis_result["match_percentage"],
                matched_keywords=analysis_result["matched_keywords"],
                missing_keywords=analysis_result["missing_keywords"],
                recommendations=analysis_result["recommendations"]
            )
            db.add(analysis)
            db.commit()
            print("Created sample resume and linked job analysis.")

        else:
            print(f"User already has {existing_apps_count} applications. Skipping seeding.")

        print("\n Seeding completed successfully!")
        print(f" Demo Credentials: Email: {demo_email} | Password: demo123456")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
