
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA


from langchain.indexes import VectorstoreIndexCreator
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI

from api import content_parser_and_db_initializer as cp


cp.init()
vectordb = cp.get_db()

# expose this index in a retriever interface
retriever = vectordb.as_retriever(search_type="similarity", search_kwargs={"k":10}) #OPTIONS
# create a chain to answer questions

llm = OpenAI(temperature=0)
qa = RetrievalQA.from_chain_type(
    llm, chain_type="stuff", retriever=retriever, return_source_documents=True)




# For testing: 
#q="what are some important deadlines?"
#print("Question:"+q+"\n")
#result = qa({"query": q})
#print(result["result"]+"\n")
#    print(result["source_documents"])
#    print("\n\n")

