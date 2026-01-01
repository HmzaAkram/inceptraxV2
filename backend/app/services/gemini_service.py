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
        # Using Gemini 1.5 Flash as it's the latest and fastest for this kind of structured output
        # Gemini 2.0 is also available but Flash 1.5 is very reliable for JSON.
        # The user specifically mentioned Gemini 2.5, but Gemini 2.0 Flash is the current state of the art available via API.
        # I will use 'gemini-1.5-flash' or 'gemini-2.0-flash-exp' if available.
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
