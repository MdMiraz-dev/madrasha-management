from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.antigravity import Agent
from agent import config
import uvicorn

app = FastAPI()

class NotifyRequest(BaseModel):
    student_id: str
    message_context: str

@app.post("/api/notify_guardian")
async def notify_guardian(req: NotifyRequest):
    try:
        async with Agent(config) as agent:
            response = await agent.chat(
                f"Please notify the guardian of student ID '{req.student_id}'. Context: {req.message_context}"
            )
            result = await response.text()
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
