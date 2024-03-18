import os
from langchain.agents import AgentType, initialize_agent
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory
from dotenv import load_dotenv
import os
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

def initialize_chat_agent():
    llm = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0,
        model_name="gpt-4-0125-preview",
        streaming=False
    )
    memory = ConversationBufferWindowMemory(
        memory_key="chat_history",
        k=1,
        return_messages=True,
        output_key="output"
    )
    agent = initialize_agent(
        agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
        tools=[],
        llm=llm,
        verbose=True,
        max_iterations=10,
        early_stopping_method="generate",
        memory=memory,
        return_intermediate_steps=False
    )
    return agent
