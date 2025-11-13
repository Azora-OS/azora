
#!/bin/bash

# Function to deploy a service
deploy_service() {
    SERVICE_DIR=$1
    SERVICE_NAME=$2

    echo "Deploying $SERVICE_NAME..."

    # Check if the service directory exists
    if [ -d "$SERVICE_DIR" ]; then
        cd "$SERVICE_DIR"

        # Check for and run start script
        if [ -f "start.sh" ]; then
            ./start.sh
        else
            echo "No start script found for $SERVICE_NAME"
        fi

        # Check for and run deploy script
        if [ -f "deploy.sh" ]; then
            ./deploy.sh
        else
            echo "No deploy script found for $SERVICE_NAME"
        fi

        # Check for and run test script
        if [ -f "test.sh" ]; then
            ./test.sh
        else
            echo "No test script found for $SERVICE_NAME"
        fi

        cd -
    else
        echo "Service directory not found: $SERVICE_DIR"
    fi
}

# Deploy knowledge-ocean service
deploy_service "services/knowledge-ocean" "knowledge-ocean"

# Deploy azllama-orchestrator service
deploy_service "services/azllama-orchestrator" "azllama-orchestrator"
