
import shutil
import os

src = r"C:/Users/HP/.gemini/antigravity/brain/3cddefbf-bcaf-4f85-ba25-3cb7aa8b7099/uploaded_media_1769803540139.png"
dst = r"c:/Users/HP/Documents/GitHub/inceptraxV2/frontend/public/inceptrax-logo.png"

try:
    shutil.copy2(src, dst)
    print(f"Copied {src} to {dst}")
except Exception as e:
    print(f"Error copying: {e}")
