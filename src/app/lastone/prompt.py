# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# from dotenv import load_dotenv
# import google.generativeai as genai

# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from langchain_core.runnables import Runnable
# from langchain_community.cache import InMemoryCache
# from langchain.globals import set_llm_cache

# load_dotenv()
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel("models/gemini-1.5-flash")

# set_llm_cache(InMemoryCache())

# # ✅ Updated prompt to include history
# template = PromptTemplate.from_template("""
# You are a certified medical assistant. Use the patient's medical history and current symptoms to provide a possible diagnosis and suggested over-the-counter medicine. If the data is unrelated to health, say "Not applicable".

# Patient History: {history}
# Current Symptom: {symptom}

# Response format:
# Diagnosis:
# Suggested Medicine:
# Precautions:
# """)

# # Chain setup
# chain: Runnable = (
#     template |
#     (lambda prompt: model.generate_content(prompt).text) |
#     StrOutputParser()
# )

# app = Flask(__name__)
# CORS(app)

# @app.route("/diagnose", methods=["POST"])
# def diagnose():
#     data = request.get_json()
#     if not data or "symptom" not in data or "history" not in data:
#         return jsonify({"error": "Missing 'symptom' or 'history'"}), 400
#     try:
#         result = chain.invoke({
#             "symptom": data["symptom"],
#             "history": data["history"]
#         })
#         return jsonify({"result": result})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(debug=True)
