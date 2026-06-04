import chromadb
from sentence_transformers import SentenceTransformer
import os

CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# Get or create a collection for experiences
collection = chroma_client.get_or_create_collection(name="experiences")

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

def add_experience_to_vector_db(experience_id: int, content: str, emotion_tags: list[str]):
    text_to_embed = f"Tags: {', '.join(emotion_tags)}. Content: {content}"
    embedding = model.encode(text_to_embed).tolist()
    
    collection.add(
        embeddings=[embedding],
        documents=[content],
        metadatas=[{"experience_id": experience_id, "tags": ",".join(emotion_tags)}],
        ids=[str(experience_id)]
    )

def update_experience_in_vector_db(experience_id: int, content: str, emotion_tags: list[str]):
    text_to_embed = f"Tags: {', '.join(emotion_tags)}. Content: {content}"
    embedding = model.encode(text_to_embed).tolist()
    
    collection.update(
        embeddings=[embedding],
        documents=[content],
        metadatas=[{"experience_id": experience_id, "tags": ",".join(emotion_tags)}],
        ids=[str(experience_id)]
    )
    
def delete_experience_from_vector_db(experience_id: int):
    collection.delete(ids=[str(experience_id)])

def search_similar_experiences(query: str, n_results: int = 5):
    query_embedding = model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    
    return results
