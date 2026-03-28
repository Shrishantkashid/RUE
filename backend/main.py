from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
from dotenv import load_dotenv
load_dotenv()

from models import AskRequest, ExplainRequest, NodeData
from llm_service import ask_llm, explain_term_llm
from database import save_node, get_session_history

app = FastAPI(title="Recursive Understanding Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask")
async def ask_question(request: AskRequest):
    response = await ask_llm(request.query)
    
    session_id = str(uuid.uuid4())
    root_node_id = "root"
    
    node = NodeData(
        id=root_node_id,
        session_id=session_id,
        term=request.query,
        content=response.answer,
        parent_id=None,
        concepts=[c.model_dump() for c in response.concepts]
    )
    
    await save_node(node.model_dump())
    
    return {
        "session_id": session_id,
        "node": node.model_dump()
    }

@app.post("/explain")
async def explain_term(request: ExplainRequest):
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set on the server.")
        
    response = await explain_term_llm(request.term, request.context, simpler=request.simpler)
    
    new_node_id = str(uuid.uuid4())
    
    node = NodeData(
        id=new_node_id,
        session_id=request.session_id,
        term=request.term,
        content=response.answer,
        parent_id=request.parent_node_id,
        concepts=[c.model_dump() for c in response.concepts]
    )
    
    await save_node(node.model_dump())
    
    return {
        "node": node.model_dump()
    }

@app.get("/history/{session_id}")
async def get_history(session_id: str):
    history = await get_session_history(session_id)
    for item in history:
        item['_id'] = str(item['_id'])
    return {"history": history}

@app.get("/tree/{session_id}")
async def get_tree(session_id: str):
    history = await get_session_history(session_id)
    nodes = []
    edges = []
    
    for item in history:
        nodes.append({
            "id": item["id"],
            "data": {"label": item["term"]},
            "position": {"x": 0, "y": 0} # Frontend will auto-layout
        })
        if item["parent_id"]:
            edges.append({
                "id": f"e-{item['parent_id']}-{item['id']}",
                "source": item["parent_id"],
                "target": item["id"]
            })
            
    return {"nodes": nodes, "edges": edges}
