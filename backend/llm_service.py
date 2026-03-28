import os
import asyncio
import json
from groq import Groq
from dotenv import load_dotenv
load_dotenv()
from models import AnswerResponse

_client = None

def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            _client = Groq(api_key=api_key)
    return _client

async def ask_llm(query: str) -> AnswerResponse:
    client = get_client()
    if not client:
        return AnswerResponse(answer="GROQ_API_KEY is not set. Please set it in backend/.env then restart.", concepts=[])

    def do_call():
        prompt = f"""You are the core intelligence of the Recursive Understanding Engine (RUE).
Your goal is to answer questions while identifying and extracting key conceptual terms that the user might need to explore further for deeper understanding.

User Question: {query}

INSTRUCTIONS:
1. Provide a clear, structured, and insightful answer to the question.
2. Automatically extract meaningful conceptual terms from your generated answer.
3. **CRITICAL**: Focus on "conceptual building blocks" — terms that are foundational, domain-specific, or potentially confusing.
4. **AVOID**: Common English words, simple verbs, or non-essential adjectives.
5. Ensure the extracted terms exactly match the phrasing used in your answer.
6. **JSON FORMAT**: You MUST return a JSON object with the following structure:
{{
  "answer": "Your detailed explanation here...",
  "concepts": [
    {{ "term": "Concept Name", "context_id": "concept-slug" }},
    ...
  ]
}}
"""
        return client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3
        )
    
    try:
        response = await asyncio.to_thread(do_call)
        data = json.loads(response.choices[0].message.content)
        return AnswerResponse(**data)
    except Exception as e:
        print(f"Error calling Groq: {e}")
        return AnswerResponse(answer=f"An error occurred with Groq: {str(e)}", concepts=[])

async def explain_term_llm(term: str, context: str, simpler: bool = False) -> AnswerResponse:
    client = get_client()
    if not client:
        return AnswerResponse(answer="GROQ_API_KEY is not set.", concepts=[])

    def do_call():
        mode = "a very beginner-friendly, simpler explanation that removes jargon" if simpler else "a detailed, insightful explanation"
        prompt = f"""You are the core intelligence of the Recursive Understanding Engine (RUE).
The user is exploring a concept recursively. 
They encountered the term '{term}' in the core context: "{context}".

INSTRUCTIONS:
1. Provide {mode} for the term '{term}'.
2. **JARGON REMOVAL**: If the term is complex, break it down into simpler components.
3. **CONCEPT SELECTION**: Pick terms that are "building blocks" for the current term's understanding.
4. **JSON FORMAT**: You MUST return a JSON object with the following structure:
{{
  "answer": "Your detailed explanation here...",
  "concepts": [
    {{ "term": "Concept Name", "context_id": "concept-slug" }},
    ...
  ]
}}
"""
        return client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3
        )

    try:
        response = await asyncio.to_thread(do_call)
        data = json.loads(response.choices[0].message.content)
        return AnswerResponse(**data)
    except Exception as e:
        print(f"Error calling Groq: {e}")
        return AnswerResponse(answer=f"An error occurred with Groq: {str(e)}", concepts=[])
