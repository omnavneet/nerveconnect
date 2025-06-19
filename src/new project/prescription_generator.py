import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key from .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print("Loaded API key:", "✔️" if api_key else "❌ Not loaded")

# Configure Gemini API
genai.configure(api_key=api_key)

# ✅ Use the full model name
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")



def get_diagnosis_and_medicine(symptom: str) -> str:
    prompt = f"""
You are a certified medical assistant. Based only on the following symptom, provide a possible diagnosis and over-the-counter medicines if appropriate. Do not guess and do not respond if the input is unrelated to health.

Symptom: {symptom}

Response format:
Diagnosis:
Suggested Medicine:
Precautions:
"""
    response = model.generate_content(prompt)
    return response.text.strip()

if __name__ == "__main__":
    symptom = input("Enter your health symptom: ")
    print("🤖 Calling Gemini API...")
    try:
        reply = get_diagnosis_and_medicine(symptom)
        print("🩺 AI Diagnosis and Prescription:\n", reply)
    except Exception as e:
        print("❌ Error:", e)
