import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import reviews, approvals, knowledge, sensa, onboarding, auth, super_admin

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI Brand Governance Platform API backed by persistent SQLite / Supabase PostgreSQL and pgvector",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(super_admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews.router, prefix=settings.API_V1_PREFIX)
app.include_router(approvals.router, prefix=settings.API_V1_PREFIX)
app.include_router(knowledge.router, prefix=settings.API_V1_PREFIX)
app.include_router(sensa.router, prefix=settings.API_V1_PREFIX)
app.include_router(onboarding.router, prefix=settings.API_V1_PREFIX)

@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "supabase_connected": not ("placeholder" in settings.SUPABASE_URL),
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

