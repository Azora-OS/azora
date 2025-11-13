# AI Family Service

This service implements the AI Family for Azora OS. It provides a set of AI personalities that can be interacted with via a chat interface.

## Running the Service

To run the service, you can use the following commands:

```bash
npm install
npm start
```

The service will start on port 3000 by default.

## API Endpoints

*   `GET /personalities`: Get all available AI personalities.
*   `GET /personalities/:name`: Get a specific AI personality.
*   `POST /chat/personality`: Switch the current chat personality.
*   `POST /chat/message`: Send a message to the current chat personality.
