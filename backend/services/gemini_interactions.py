import json
import re
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from backend.config import settings

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
CANDIDATE_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
]


class GeminiInteractionError(RuntimeError):
    pass


def get_gemini_api_key() -> str:
    return (settings.GEMINI_API_KEY or "").strip()


def _build_contents(prompt: str, history: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    contents: List[Dict[str, Any]] = []
    if history:
        for item in history[-10:]:
            raw_content = str(item.get("content") or "").strip()
            if not raw_content:
                continue
            role = "user" if item.get("role") in ["user", "human"] or item.get("sender") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": raw_content}]
            })
    contents.append({
        "role": "user",
        "parts": [{"text": prompt.strip()}]
    })
    return contents


def _call_gemini_api(
    payload: Dict[str, Any],
    api_key: str,
    preferred_model: Optional[str] = None,
    timeout: int = 35,
    max_retries: int = 1,
) -> Dict[str, Any]:
    models_to_try: List[str] = []
    if preferred_model:
        models_to_try.append(preferred_model)
    for m in CANDIDATE_MODELS:
        if m and m not in models_to_try:
            models_to_try.append(m)

    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        url = f"{BASE_URL}/{model_name}:generateContent?key={api_key}"
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        for attempt in range(max_retries + 1):
            try:
                with urllib.request.urlopen(request, timeout=timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except urllib.error.HTTPError as exc:
                last_error = exc
                if exc.code == 429 and attempt < max_retries:
                    # Rate limit encountered: brief backoff before retry
                    time.sleep(2.0)
                    continue
                if exc.code == 404:
                    # Model not available for this key: break to next candidate model
                    break
                detail = exc.read().decode("utf-8", errors="replace")[:300]
                raise GeminiInteractionError(f"Gemini API returned error {exc.code}: {detail}") from exc
            except TimeoutError as exc:
                last_error = exc
                if attempt < max_retries:
                    time.sleep(1.0)
                    continue
                break
            except Exception as exc:
                last_error = exc
                break

    raise GeminiInteractionError(
        f"All Gemini models ({', '.join(models_to_try[:2])}) failed or timed out: {type(last_error).__name__}"
    )


def _extract_text_from_response(response: Dict[str, Any]) -> str:
    candidates = response.get("candidates") or []
    if not candidates:
        raise GeminiInteractionError("Gemini returned no candidates.")
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    chunks: List[str] = []
    for part in parts:
        if isinstance(part, dict) and part.get("text"):
            chunks.append(part["text"])
    text = "".join(chunks).strip()
    if not text:
        raise GeminiInteractionError("Gemini candidate contained no text.")
    return text


def generate_text(
    prompt: str,
    *,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    history: Optional[List[Dict[str, Any]]] = None,
    temperature: float = 0.3,
    timeout: int = 35,
) -> str:
    api_key = get_gemini_api_key()
    if not api_key:
        raise GeminiInteractionError("GEMINI_API_KEY is not configured.")

    payload: Dict[str, Any] = {
        "contents": _build_contents(prompt, history),
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 2048,
        },
    }
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction.strip()}]
        }

    result = _call_gemini_api(payload, api_key, preferred_model=model, timeout=timeout)
    return _extract_text_from_response(result)


def generate_json(
    prompt: str,
    schema: Optional[Dict[str, Any]] = None,
    *,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    history: Optional[List[Dict[str, Any]]] = None,
    temperature: float = 0.2,
    timeout: int = 35,
) -> Dict[str, Any]:
    api_key = get_gemini_api_key()
    if not api_key:
        raise GeminiInteractionError("GEMINI_API_KEY is not configured.")

    payload: Dict[str, Any] = {
        "contents": _build_contents(prompt, history),
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 3072,
            "responseMimeType": "application/json",
        },
    }
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction.strip()}]
        }

    result = _call_gemini_api(payload, api_key, preferred_model=model, timeout=timeout)
    raw = _extract_text_from_response(result)

    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise GeminiInteractionError(f"Gemini returned invalid JSON: {cleaned[:100]}") from exc

    if not isinstance(parsed, dict):
        raise GeminiInteractionError("Gemini returned non-object JSON.")
    return parsed
