from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .app.masking import MaskingEngine, MaskingConfig, MaskingResult
import uvicorn

app = FastAPI(title="AnonymX Pipeline Engine")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MaskingEngine()

@app.get("/health")
async def health():
    return {"status": "operational", "engine": "AnonymX-v2"}

@app.post("/mask", response_model=MaskingResult)
async def mask_payload(data: dict):
    # Expected format: {"payload": {...}, "config": {...}}
    payload = data.get("payload")
    config_dict = data.get("config", {})
    
    if payload is None:
        raise HTTPException(status_code=400, detail="Payload is required")
    
    config = MaskingConfig(**config_dict)
    return engine.process_payload(payload, config)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
