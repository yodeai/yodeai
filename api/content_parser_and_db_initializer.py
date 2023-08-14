import os
import openai
import sys
import subprocess
from dotenv import load_dotenv

# Explicitly provide path to '.env.local'
load_dotenv(dotenv_path='.env.local')


sys.path.append('../..')


############################## BEGIN: Parsers
import requests
from bs4 import BeautifulSoup

from urllib.parse import urlparse


from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv()) # read local .env file

from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings

import re


def extract_website_address(url):
    parsed_url = urlparse(url)
    return parsed_url.netloc


def extract_links(url):
    linkmap={}
    website=extract_website_address(url)

    try:
        # Fetch the webpage content
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception if there's an error

        # Parse the HTML using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find all anchor tags (links) in the page
        links = soup.find_all('a')

        # Extract and print the href attribute from each anchor tag
        for link in links:
            href = link["href"]
            if (href.isspace()==False and len(href)>0):
                if (href[0]=="/"):
                    link["href"]=website+href
                linktext=link.text.strip()
                if (linktext.isspace()==False and len(linktext)>0):
                    linkmap[linktext]=link["href"]
                #print(link["href"]+"\n"+link.text.strip()+"\n\n")
                #print(link.text.strip())

    except requests.exceptions.RequestException as e:
        print("Error fetching the webpage:", e)
    return linkmap


def replace_two_whitespace(input_string):
    result_string = re.sub(r'(\s)\1+', r'\1', input_string)
    return result_string

############################## END: Parsers

from langchain.document_loaders import WebBaseLoader
from langchain.document_loaders import PyPDFLoader
from langchain.chains import LLMChain
from langchain.text_splitter import CharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter, CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings

urls=[
    "https://lsadvising.berkeley.edu/progress-planning/new-student-guides/new-freshman-student-guide",
    "https://lsadvising.berkeley.edu/home",
    "https://lsadvising.berkeley.edu/appointments-advice",
    "https://lsadvising.berkeley.edu/connect-through-mentorship",
    "https://lsadvising.berkeley.edu/community",
    "https://lsadvising.berkeley.edu/connect-academic-support",
    "https://lsadvising.berkeley.edu/progress-planning/schedule-planning-and-enrollment/semester-schedule-planning",
    "https://lsadvising.berkeley.edu/progress-planning/schedule-planning-and-enrollment/enrollment-add-or-drop-course",
    "https://lsadvising.berkeley.edu/policies/unit-ceiling-and-semester-limit"
]

pdfs=['https://registrar.berkeley.edu/wp-content/uploads/2021/03/050714_Campus-Policies-and-Guidelines-Concerning-the-Academic-Calendar.pdf']

docs=[]

import shutil
import os




def init():
    openai.api_key  =  os.getenv('OPENAI_API_KEY')


from langchain.embeddings.openai import OpenAIEmbeddings

made_db=0
vectordb=Chroma()

def make_db():
    for url in urls:
        loader = WebBaseLoader(url)
        docs.extend((loader.load()))

    for pdf in pdfs:
        loader = PyPDFLoader(pdf)
        docs.extend((loader.load()))

    for i in  range(0,len(docs)):
        docs[i].page_content=replace_two_whitespace(docs[i].page_content)
        text_splitter = CharacterTextSplitter(
            separator= " ",
            chunk_size=800,
            chunk_overlap=200,
            length_function=len
        )
    splits=text_splitter.split_documents(docs)

    embedding = OpenAIEmbeddings()

    vectordb = Chroma.from_documents(
        documents=splits,
        embedding=embedding,
    )

    made_db=1
    return vectordb

def get_db():
    if made_db==1:
        return vectordb
    else:
        return make_db()
