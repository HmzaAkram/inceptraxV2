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
        model_name = current_app.config.get('GEMINI_MODEL', 'gemini-3-flash-preview')
        try:
            return genai.GenerativeModel(model_name)
        except Exception as e:
            # Fallback to a known stable model if specified fails
            print(f"Failed to load model {model_name}, falling back...")
            return genai.GenerativeModel('gemini-3-flash-preview')

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

    @staticmethod
    def extract_idea_from_media(mime_type, data, prompt="Extract the startup idea details", system_instruction=None):
        model = GeminiService.get_model()
        
        # Create a content part for the media
        # Note: newer genai versions support dictionary format or direct Part objects
        # We will use the dictionary format which is generally stable
        content_part = {
            "mime_type": mime_type,
            "data": data
        }
        
        # System instruction for extraction
        if not system_instruction:
            system_instruction = """
            You are an expert startup analyst. Your job is to extract structured idea details from the provided input (Audio, Image, or PDF).
            
            Output JSON format:
            {
                "title": "Short catchy title",
                "description": "2-3 sentence summary",
                "problem": "What problem does it solve?",
                "solution": "How does it solve it?",
                "audience": "Who is it for?",
                "market": "Which market industry?"
            }
            """
        
        combined_prompt = [system_instruction, prompt, content_part]
        
        response = model.generate_content(
            combined_prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        return response.text

