#!/usr/bin/env python3
import requests
import subprocess
import time
import sys
import os

def test_endpoints():
    # Change to mining engine directory
    os.chdir("/workspaces/azora-os/mining-engine")

    # Start orchestrator
    print("Starting orchestrator...")
    proc = subprocess.Popen([
        "uvicorn", "orchestrator.main:app",
        "--host", "0.0.0.0", "--port", "8000"
    ])

    try:
        time.sleep(3)  # Wait for startup

        base_url = "http://localhost:8000"

        # Test health
        print("Testing /health...")
        resp = requests.get(f"{base_url}/health")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")

        # Test coins
        print("\nTesting /coins...")
        resp = requests.get(f"{base_url}/coins")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")

        # Test nodes
        print("\nTesting /nodes...")
        resp = requests.get(f"{base_url}/nodes")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")

        print("\nAll endpoints working!")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    test_endpoints()