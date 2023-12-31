from llama_index import SimpleDirectoryReader, VectorStoreIndex

from llama_index.ingestion import IngestionPipeline
from llama_index.node_parser import SentenceSplitter
from llama_index.extractors import (
    SummaryExtractor,
    QuestionsAnsweredExtractor,
    TitleExtractor,
    KeywordExtractor,
    EntityExtractor,
)  
import nest_asyncio
import dao.indexed_dao as indexed_dao   

nest_asyncio.apply()

async def index():   
    transformations = [
    #SentenceSplitter(),
    #TitleExtractor(nodes=5),
    #QuestionsAnsweredExtractor(questions=3),
    SummaryExtractor(summaries=["prev", "self"]),
   # KeywordExtractor(keywords=10),
    EntityExtractor(prediction_threshold=0.5)]
    pipeline =  IngestionPipeline(transformations=transformations)
    docs =  SimpleDirectoryReader("./data/proccesed").load_data(show_progress=True)
    nodes = pipeline.run(documents=docs)
    index = VectorStoreIndex(nodes) 
    indexed_dao.persist(index)
