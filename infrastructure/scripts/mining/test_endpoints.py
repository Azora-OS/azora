#!/usr/bin/env python3
import requests
import time
import subprocess
import signal
import sys

def test_endpoints():
    # Start orchestrator in background
    print("Starting orchestrator...")
    proc = subprocess.Popen([
        "uvicorn", "orchestrator.main:app",
        "--host", "0.0.0.0", "--port", "8000"
    ], cwd="/workspaces/azora-os/mining-engine")

    try:
        # Wait for startup
        time.sleep(3)

        # Test health
        print("Testing health endpoint...")
        response = requests.get("http://localhost:8000/health")
        print(f"Health: {response.json()}")

        # Test nodes
        print("Testing nodes endpoint...")
        response = requests.get("http://localhost:8000/nodes")
        print(f"Nodes: {response.json()}")

        # Test coins
        print("Testing coins endpoint...")
        response = requests.get("http://localhost:8000/coins")
        print(f"Coins: {response.json()}")

        print("All tests passed!")

    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    test_endpoints()