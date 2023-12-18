from llama_index.llms.base import ChatMessage   


conversations :dict[str,list[ChatMessage]] = {}   

def get(conversation_id:int):
    if conversations.get(conversation_id) is not None:
        return conversations[conversation_id]
    else:
        conversations[conversation_id] = [ ChatMessage(role="system",content="""Answer the question as truthfully as possible unless and if you're unsure of the answer, say "Sorry, I don't know".\n\n{context}}""")] 
        return conversations[conversation_id]

def add(message:ChatMessage ,conversation_id:int):
    conversation = get(conversation_id)
    conversation.append(message)
    return conversation


