from app.services.vector_db import search_similar_experiences

def generate_insight_for_query(query: str):
    """
    Generates an AI insight summary based on the query and similar experiences.
    For MVP, we will aggregate common emotional themes from similar experiences.
    """
    search_results = search_similar_experiences(query, n_results=3)
    
    if not search_results['documents'] or len(search_results['documents'][0]) == 0:
        return "You are the first to share this kind of experience. Your story will help others."
        
    metadatas = search_results['metadatas'][0]
    all_tags = []
    for meta in metadatas:
        if "tags" in meta and meta["tags"]:
            all_tags.extend(meta["tags"].split(","))
            
    # Count tags
    tag_counts = {}
    for tag in all_tags:
        tag = tag.strip()
        if tag:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
    top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    top_tag_names = [t[0] for t in top_tags]
    
    if top_tag_names:
        return f"Many people who felt this way also experienced {', '.join(top_tag_names)}. You are not alone in this journey."
    else:
        return "Others have gone through similar situations and found their way forward. Your resilience is key."
