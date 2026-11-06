import os
from pathlib import Path
from typing import List, Union, Optional

# Automatically load environment variables from backend/.env, root .env.local, or root .env
_backend_dir = Path(__file__).resolve().parent
_backend_env = _backend_dir / ".env"
_root_env_local = _backend_dir.parent / ".env.local"
_root_env = _backend_dir.parent / ".env"

try:
    from dotenv import load_dotenv
    if _backend_env.exists():
        load_dotenv(dotenv_path=_backend_env)
    if _root_env_local.exists():
        load_dotenv(dotenv_path=_root_env_local)
    if _root_env.exists():
        load_dotenv(dotenv_path=_root_env)
    load_dotenv()
except ImportError:
    pass

try:
    from pydantic_settings import BaseSettings
    from pydantic import field_validator
    _has_pydantic_validator = True
except ImportError:
    try:
        from pydantic import BaseSettings, field_validator # type: ignore
        _has_pydantic_validator = True
    except ImportError:
        _has_pydantic_validator = False
        class BaseSettings: # type: ignore
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)

class Settings(BaseSettings):
    PROJECT_NAME: str = "BrandSense AI Governance API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development"))
    
    # Supabase Configuration (Never use hardcoded secrets in production)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_LEGACY_HS256_SECRET: str = os.getenv("SUPABASE_LEGACY_HS256_SECRET", os.getenv("SUPABASE_JWT_SECRET", ""))
    SUPABASE_JWKS_URL: Optional[str] = os.getenv("SUPABASE_JWKS_URL", None)
    SUPABASE_ISSUER: Optional[str] = os.getenv("SUPABASE_ISSUER", None)
    
    # CORS Origins (Supports comma-separated string or list)
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # AI API Configuration (NVIDIA Nemotron / LLM)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-4-340b-instruct")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "nvidia/nemotron-4-340b-instruct")

    class Config:
        env_file = str(_backend_env) if _backend_env.exists() else (str(_root_env_local) if _root_env_local.exists() else ".env")
        extra = "allow"

    if _has_pydantic_validator:
        @field_validator("BACKEND_CORS_ORIGINS", mode="before")
        @classmethod
        def assemble_cors_origins(cls, v):
            if isinstance(v, str) and not v.startswith("["):
                return [i.strip() for i in v.split(",") if i.strip()]
            return v

    @property
    def jwks_url(self) -> str:
        if self.SUPABASE_JWKS_URL:
            return self.SUPABASE_JWKS_URL
        if self.SUPABASE_URL and not any(p in self.SUPABASE_URL.lower() for p in ["placeholder", "your_project_ref", "your-project-ref"]):
            return f"{self.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        return ""

    @property
    def expected_issuer(self) -> str:
        if self.SUPABASE_ISSUER:
            return self.SUPABASE_ISSUER
        if self.SUPABASE_URL and not any(p in self.SUPABASE_URL.lower() for p in ["placeholder", "your_project_ref", "your-project-ref"]):
            return f"{self.SUPABASE_URL.rstrip('/')}/auth/v1"
        return ""

    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ["production", "prod"]

    def validate_production(self) -> None:
        """Fail safely on startup when required production credentials are missing."""
        if self.is_production():
            missing = []
            if not self.SUPABASE_URL or any(p in self.SUPABASE_URL.lower() for p in ["placeholder", "your_project_ref", "your-project-ref"]):
                missing.append("SUPABASE_URL")
            if not self.SUPABASE_SERVICE_ROLE_KEY or any(p in self.SUPABASE_SERVICE_ROLE_KEY.lower() for p in ["placeholder", "your_server_only_secret_key", "your-server-only"]):
                missing.append("SUPABASE_SERVICE_ROLE_KEY")
            # In production, either JWKS endpoint is available or a JWT secret is provided
            has_jwks = bool(self.jwks_url)
            has_secret = bool(self.SUPABASE_JWT_SECRET and len(self.SUPABASE_JWT_SECRET) >= 16 and not any(p in self.SUPABASE_JWT_SECRET.lower() for p in ["placeholder", "your_jwt_secret", "your-jwt-secret"]))
            if not has_jwks and not has_secret:
                missing.append("SUPABASE_JWKS_URL (or valid SUPABASE_URL) or SUPABASE_JWT_SECRET")
            if missing:
                raise RuntimeError(
                    f"Production startup blocked. Missing required environment variables: {', '.join(missing)}"
                )

settings = Settings()

