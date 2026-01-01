import os
import google.generativeai as genai
from flask import current_app

class GeminiService:
    @staticmethod
    def get_model():
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        
        genai.configure(api_key=api_key)
        # The user has specified MODEL_NAME = gemini-2.5-flash
        model_name = current_app.config.get('GEMINI_MODEL', 'gemini-1.5-flash')
        try:
            return genai.GenerativeModel(model_name)
        except Exception as e:
            # Fallback to a known stable model if specified fails
            print(f"Failed to load model {model_name}, falling back...")
            return genai.GenerativeModel('gemini-1.5-flash')

    @staticmethod
    def generate_analysis(prompt, system_instruction=None):
        model = GeminiService.get_model()
        
        # We can pass system instructions if the model supports it or just prepend to prompt
        combined_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
        
        response = model.generate_content(
            combined_prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        return response.text
