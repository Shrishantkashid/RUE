from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi

_client = None
_db = None
_mock_db = {"nodes": []} # In-memory fallback if Atlas fails

def get_db():
    global _client, _db
    if _db is None:
        try:
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
            _client = AsyncIOMotorClient(mongo_uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
            _db = _client.rue_db
        except Exception as e:
            print(f"Database connection failed, using in-memory mock: {e}")
            _db = "MOCK"
    return _db

async def save_node(node_data: dict):
    db = get_db()
    if db == "MOCK":
        _mock_db["nodes"].append(node_data)
        return
    try:
        await db.nodes.insert_one(node_data)
    except Exception:
        _mock_db["nodes"].append(node_data)
    
async def get_node(session_id: str, node_id: str):
    db = get_db()
    if db == "MOCK":
        for n in _mock_db["nodes"]:
            if n["session_id"] == session_id and n["id"] == node_id:
                return n
        return None
    try:
        return await db.nodes.find_one({"session_id": session_id, "id": node_id})
    except Exception:
        return None

async def get_session_history(session_id: str):
    db = get_db()
    if db == "MOCK":
        return [n for n in _mock_db["nodes"] if n["session_id"] == session_id]
    try:
        cursor = db.nodes.find({"session_id": session_id})
        return await cursor.to_list(length=None)
    except Exception:
        return [n for n in _mock_db["nodes"] if n["session_id"] == session_id]


