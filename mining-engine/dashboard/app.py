from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import requests
import json
from datetime import datetime, timezone

app = FastAPI(title="Azora Mining Dashboard")
templates = Jinja2Templates(directory="templates")

# Orchestrator API URL
ORCHESTRATOR_URL = "http://localhost:8000"

@app.get("/")
async def dashboard(request: Request):
    """Main dashboard view"""
    try:
        # Get nodes from orchestrator
        nodes_response = requests.get(f"{ORCHESTRATOR_URL}/nodes")
        nodes = nodes_response.json() if nodes_response.status_code == 200 else {}

        # Get coins
        coins_response = requests.get(f"{ORCHESTRATOR_URL}/coins")
        coins = coins_response.json() if coins_response.status_code == 200 else {}

        # Calculate totals
        total_hashrate = sum(node.get('hash_rate', 0) for node in nodes.values())
        total_power = sum(node.get('power_consumption', 0) for node in nodes.values())
        active_nodes = len([n for n in nodes.values() if n.get('last_seen')])

        return templates.TemplateResponse("dashboard.html", {
            "request": request,
            "nodes": nodes,
            "coins": coins,
            "total_hashrate": total_hashrate,
            "total_power": total_power,
            "active_nodes": active_nodes,
            "timestamp": datetime.now(timezone.utc)
        })

    except Exception as e:
        return templates.TemplateResponse("error.html", {
            "request": request,
            "error": str(e)
        })

@app.post("/optimize")
async def trigger_optimization():
    """Trigger manual optimization"""
    try:
        response = requests.post(f"{ORCHESTRATOR_URL}/optimize")
        return {"status": "success" if response.status_code == 200 else "failed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)