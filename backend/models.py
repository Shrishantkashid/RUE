from pydantic import BaseModel, Field
from typing import List, Optional

class ConceptExtraction(BaseModel):
    term: str = Field(description="The extracted key conceptual term")
    context_id: str = Field(description="A generated short unique slug/ID for the term without spaces")

class AnswerResponse(BaseModel):
    answer: str = Field(description="The generated clear structured answer or explanation. Break down into paragraphs if long.")
    concepts: List[ConceptExtraction] = Field(description="List of extracted meaningful conceptual terms from the structured answer.")

class AskRequest(BaseModel):
    query: str

class ExplainRequest(BaseModel):
    session_id: str
    term: str
    parent_node_id: str
    context: str
    simpler: bool = False

class NodeData(BaseModel):
    id: str
    session_id: str
    term: str
    content: str
    parent_id: Optional[str] = None
    concepts: List[dict]
