from llama_index import GPTVectorStoreIndex, SimpleDirectoryReader, LLMPredictor, ServiceContext, StorageContext, load_index_from_storage
import os
from langchain.chat_models import ChatOpenAI
from langchain.schema.messages import SystemMessage
from dotenv import load_dotenv
import os

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"]  = openai_api_key

def construct_index(directory_path):
    # set number of output tokens
    num_outputs = 500

    llm=ChatOpenAI(
            temperature=0.5, 
            model_name="gpt-3.5-turbo", 
            max_tokens=num_outputs,
            )
            
    initialPrompt(llm)

    _llm_predictor = LLMPredictor(llm)

    service_context = ServiceContext.from_defaults(llm_predictor=_llm_predictor)

    docs = SimpleDirectoryReader(directory_path).load_data()

    index = GPTVectorStoreIndex.from_documents(docs, service_context=service_context)
    
    #Directory in which the indexes will be stored
    index.storage_context.persist(persist_dir="indexes")

    return index


def initialPrompt(_llm_predictor):
    messages = [
       SystemMessage(content="You're a human giving helpful advices about houses"),    
       SystemMessage(content="You only answer questions about houses"),  
       SystemMessage(content="When you answer a question also give a link of the house"),  
    ]

    _llm_predictor.invoke(messages)

def chatbot(input_text):
    # rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="indexes")
    
    #load indexes from directory using storage_context 
    query_engne = load_index_from_storage(storage_context).as_query_engine()
    
    response = query_engne.query(input_text)
    
    #returning the response
    return response.response





index = construct_index("./trainingData")
print(chatbot("Hej, jag vill köpa ett hus i Stockholm, vilket har det billigaste kvadratmeter priset?"))

#Creating the web UIusing gradio
""" iface = gradio.Interface(fn=chatbot,
                     inputs="text",
                     outputs="text",
                     title="Custom-trained AI Chatbot")

#Constructing indexes based on the documents in trainingData folder
#This can be skipped if you have already trained your app and need to re-run it


#launching the web UI using gradio
iface.launch(share=True) """