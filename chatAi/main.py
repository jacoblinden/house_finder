import os
import openai
from dotenv import load_dotenv

load_dotenv()

GCP_PROJECT_ID = os.getenv('OPENAI_API_KEY')
openai.api_key = GCP_PROJECT_ID


completion = openai.ChatCompletion.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
    {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming."}
  ]
)

print(completion.choices[0].message)
