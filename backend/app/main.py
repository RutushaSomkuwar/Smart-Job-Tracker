from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine, Base
from app.routers import auth, applications, resumes, analysis, dashboard

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("job_tracker")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
        
        # Auto-seed demo user if not existing
        from app.database import SessionLocal
        from app.models.user import User
        from app.utils.security import get_password_hash
        
        db = SessionLocal()
        try:
            demo_email = "demo@jobtracker.dev"
            demo_user = db.query(User).filter(User.email == demo_email).first()
            if not demo_user:
                logger.info(f"Seeding default demo user: {demo_email}")
                demo_user = User(
                    name="Alex Morgan",
                    email=demo_email,
                    hashed_password=get_password_hash("demo123456")
                )
                db.add(demo_user)
                db.commit()
                logger.info("Demo user seeded successfully.")
        except Exception as seed_err:
            logger.warning(f"Note on seeding demo user: {seed_err}")
            db.rollback()
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    yield
    # Shutdown
    logger.info("Application shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart Job Application Tracker & Resume Analyzer REST API built with FastAPI, PostgreSQL, and SQLAlchemy.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
# Allow any HTTP / HTTPS origin (Vercel, local dev, custom domains) with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Healthcheck endpoints
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to Smart Job Application Tracker & Resume Analyzer API",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy", "version": settings.VERSION}

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
