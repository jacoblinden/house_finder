from llama_index import GPTVectorStoreIndex, load_index_from_storage

from llama_index import  StorageContext

def persist(index:GPTVectorStoreIndex):
    index.storage_context.persist(persist_dir="./data/indexes") 

def load():  
    storage_context = StorageContext.from_defaults(persist_dir="./data/indexes")
    return load_index_from_storage(storage_context)