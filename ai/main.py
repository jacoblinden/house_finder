import uvicorn
import config.config as cfg  
from fastapi import FastAPI
from pydantic import BaseModel
import os
import services.chat as AI
import services.data as IndexData

app = FastAPI()

class Recreate(BaseModel):
    key: str   

class Conversation(BaseModel):
    message: str
    user: str
    key: str
    conversation_id: str    

@app.post("/admin/recreate/pipeline") 
async def construct_index_pipeline(recreate: Recreate):
    if(os.getenv("SUPER_SECRET_USAGE_KEY_ADMIN") == recreate.key):
        await IndexData.index()
        return "200"
    else:
        return "401"
    
@app.post("/conversation/pipeline")
async def create_item(item: Conversation):
    if(os.getenv("SUPER_SECRET_USAGE_KEY") == item.key):
        return AI.converse(item.message, item.conversation_id)
    else:
        return "401"

cfg.setUp()

def main():
    uvicorn.run("__main__:app", host="0.0.0.0", port=8000, reload=True, workers=2)
    

if __name__ == "__main__":
    main()