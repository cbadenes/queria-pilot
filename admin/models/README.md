# Question Generation backend Version 0.2

## Installation
- 1: Install Ollama
https://ollama.com/download

- 2: Start ollama and download llama3 8B
https://ollama.com/library/llama3

```python
ollama pull llama3
ollama serve
```
- 3: Create a Modefile

On top of llama3 we need to create a Modelfile in ollama for each task that the llm will perform. The Modelfile is a blueprint to define system parameters and set the "system instructions". Additionally, it is included in the Modelfile the difficulty of a question optimized with few shot learning, and all the examples included follow the bloom taxonomy. 

Create a Modelfile for the Multiple Choice Question generator and the Open Question generator. Importantly, run the following commands one by one before using the script ollama_client. 

```
ollama create llama3_easy -f ./modelfile/modelfile_easy
ollama create llama3_medium -f ./modelfile/modelfile_medium
ollama create llama3_hard -f ./modelfile/modelfile_hard

ollama create llama3_easy_Open -f ./modelfile/modelfile_easy_Openquestion
ollama create llama3_medium_Open -f ./modelfile/modelfile_medium_Openquestion
ollama create llama3_hard_Open -f ./modelfile/modelfile_hard_Openquestion
ollama create llama3_evaluator -f ./modelfile/modelfile_evaluator
```

Note that for chat style models is also needed human (user) instructions. The *prompt template* folder includes a specific prompt for each level and subtask.