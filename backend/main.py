from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.liquidity_routes import router as liquidity_router
from api.market_routes import router as market_risk_router

app = FastAPI()

origins = [
    "https://risk.oncaworks.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(liquidity_router)
app.include_router(market_risk_router)


@app.get("/health")
def health():
    return {"status": "ok"}
