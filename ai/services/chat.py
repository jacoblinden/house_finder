from llama_index.llms.base import ChatMessage
import dao.indexed_dao as indexed_dao
import dao.conversation as conversation

def converse(input_text,
                    conversation_id:int):
    
    query_engine = indexed_dao.load()
    chat_engine = query_engine.as_chat_engine(verbose=True)

    userConversation = conversation.get(conversation_id)
    
    response = chat_engine.chat(input_text,userConversation)

    chatMessage = ChatMessage(role="user",content=input_text)
    systemResponse = ChatMessage(role="system",content=response.response)

    conversation.add(chatMessage, conversation_id)  
    conversation.add(systemResponse , conversation_id)

    # Returning the response
    return response.response


