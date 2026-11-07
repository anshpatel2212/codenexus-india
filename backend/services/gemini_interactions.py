import json
import re
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from backend.config import settings

INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
DEFAULT_MODEL = "gemini-3.1-flash-lite"


class GeminiInteractionError(RuntimeError):
    pass


def get_gemini_api_key() -> str:
    return (settings.GEMINI_API_KEY or "").strip()


def _extract_output_text(payload: Dict[str, Any]) -> str:
    steps = payload.get("steps") or []
    chunks: List[str] = []
    for step in steps:
        if step.get("type") != "model_output":
            continue
        for part in step.get("content") or []:
            if part.get("type") == "text" and part.get("text"):
                chunks.append(part["text"])
    if chunks:
        return "".join(chunks).strip()
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"].strip()
    return ""


def generate_text(
    prompt: str,
    *,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.2,
    timeout: int = 30,
) -> str:
    api_key = get_gemini_api_key()
    if not api_key:
        raise GeminiInteractionError("GEMINI_API_KEY is not configured.")

    full_input = prompt
    if system_instruction:
        full_input = f"{system_instruction.strip()}\n\n{prompt.strip()}"

    payload: Dict[str, Any] = {
        "model": model or settings.GEMINI_MODEL or DEFAULT_MODEL,
        "input": full_input,
        "generation_config": {"temperature": temperature},
        "store": False,
    }

    request = urllib.request.Request(
        INTERACTIONS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
            "Api-Revision": "2026-05-20",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise GeminiInteractionError(f"Gemini interaction failed ({exc.code}): {detail}") from exc
    except Exception as exc:
        raise GeminiInteractionError(f"Gemini interaction failed: {type(exc).__name__}") from exc

    text = _extract_output_text(result)
    if not text:
        raise GeminiInteractionError("Gemini returned an empty response.")
    return text


def generate_json(
    prompt: str,
    schema: Dict[str, Any],
    *,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.1,
    timeout: int = 30,
) -> Dict[str, Any]:
    api_key = get_gemini_api_key()
    if not api_key:
        raise GeminiInteractionError("GEMINI_API_KEY is not configured.")

    full_input = prompt
    if system_instruction:
        full_input = f"{system_instruction.strip()}\n\n{prompt.strip()}"

    payload: Dict[str, Any] = {
        "model": model or settings.GEMINI_MODEL or DEFAULT_MODEL,
        "input": full_input,
        "response_format": {
            "type": "text",
            "mime_type": "application/json",
            "schema": schema,
        },
        "generation_config": {"temperature": temperature},
        "store": False,
    }

    request = urllib.request.Request(
        INTERACTIONS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
            "Api-Revision": "2026-05-20",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise GeminiInteractionError(f"Gemini interaction failed ({exc.code}): {detail}") from exc
    except Exception as exc:
        raise GeminiInteractionError(f"Gemini interaction failed: {type(exc).__name__}") from exc

    raw = _extract_output_text(result)
    if not raw:
        raise GeminiInteractionError("Gemini returned an empty JSON response.")

    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise GeminiInteractionError("Gemini returned invalid JSON.") from exc

    if not isinstance(parsed, dict):
        raise GeminiInteractionError("Gemini returned a non-object JSON response.")
    return parsed
