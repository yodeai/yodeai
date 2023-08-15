from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
#from api import content_parser_and_db_initializer as cp
#from api import qa_interface
import logging

logging.basicConfig(filename='app.log', level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("This is the first debug message.")


app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")
#cp.init()
#vectordb = cp.get_db()
logger.debug("DB was made")

@app.get("/api/healthchecker")
def healthchecker():
    return {"status": "success", "message": "Integrate FastAPI Framework with Next.js"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StringInput(BaseModel):
    input_string: str

@app.post("/api/echo")
def echo_string(data: StringInput):
    #logger.debug("every day I'm echoinggggg")
    return {"result": "Echo: " + data.input_string}


class QuestionInput(BaseModel):
    question: str

#@app.post("/api/answer")
#async def answer_question(data: QuestionInput):
#    result = qa_interface.qa({"query": data.question})
#    return result