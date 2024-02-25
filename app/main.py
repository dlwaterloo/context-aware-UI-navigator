import asyncio
from fastapi import FastAPI, Body, Request
from fastapi.responses import JSONResponse, HTMLResponse  # Import HTMLResponse here

from .models import Query
from .agents import initialize_chat_agent
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:8000",  # FastAPI server itself
    "chrome-extension://fgnfoohpmkjfchpjhlegjdhhbngmgaph"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


agent = initialize_chat_agent()

@app.post("/chat")
async def chat(query: Query = Body(...)):
    # Run the agent call
    response = await agent.acall(inputs={"input": query.text})

    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="localhost", port=8000, reload=True)
