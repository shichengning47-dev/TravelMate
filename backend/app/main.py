from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .agent import build_graph
from .amap import AMapClient
from .config import get_settings
from .models import ChatRequest, ChatResponse, NearbyRequest

settings = get_settings()
app = FastAPI(title="TravelMate API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
agent = build_graph()
amap = AMapClient()


@app.get("/health")
async def health():
    return {"status": "ok", "qwen_configured": bool(settings.dashscope_api_key), "amap_configured": bool(settings.amap_webservice_key)}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await agent.ainvoke(request.model_dump())
    configured = bool(settings.dashscope_api_key)
    return ChatResponse(reply=result["reply"], mode="live" if configured else "configuration_required")


@app.post("/api/poi/nearby")
async def nearby(request: NearbyRequest):
    try:
        return await amap.nearby(request.location, request.keywords, request.radius)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.get("/api/weather/{city}")
async def weather(city: str):
    try:
        return await amap.weather(city)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

