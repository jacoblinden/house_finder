
from dotenv import load_dotenv
import os
import nest_asyncio



def setUp():
    load_dotenv()
    openai_api_key = os.getenv("OPENAI_API_KEY")
    os.environ["OPENAI_API_KEY"]  = openai_api_key 
    nest_asyncio.apply()


