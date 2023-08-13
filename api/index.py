from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")


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

qlist = ["what are the grading options?",
    "what are some important deadlines?",
    "what types of courses do I need to take in the first year?",
    "give me some advice about the courses I need to take in the first year",
    "what are some social activities for me on campus?",
    "what credits could I transfer from high school?",
    "what types of advisors do I need?",
    "How cold is it going to be in the first semester?"
]


@app.get("/api/answer")
def get_answer():
    return qlist

class StringInput(BaseModel):
    input_string: str

@app.post("/api/echo")
def echo_string(data: StringInput):
    return {"result": data.input_string}