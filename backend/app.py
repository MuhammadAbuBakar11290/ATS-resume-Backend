from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from PIL import Image
import fitz  # PyMuPDF
import google.generativeai as genai
import base64
import io

# Load environment variables
load_dotenv()

# Configure Google API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app)

# Function to get response from Gemini model
def get_gemini_response(input_text, pdf_content, prompt):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([input_text, pdf_content[0], prompt])
    return response.text

# Function to convert PDF to image and encode to base64
def input_pdf_setup(upload_file):
    if upload_file:
        # Open PDF file
        pdf_document = fitz.open(stream=upload_file.read(), filetype="pdf")
        # Get the first page
        first_page = pdf_document.load_page(0)
        # Convert to image
        pix = first_page.get_pixmap()
        img_byte_arr = io.BytesIO(pix.tobytes())
        first_page_image = Image.open(img_byte_arr)
        img_byte_arr = io.BytesIO()
        first_page_image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()
        pdf_parts = [
            {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(img_byte_arr).decode()  # encode to base64
            }
        ]
        return pdf_parts
    else:
        raise FileNotFoundError("No file uploaded")

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        job_description = request.form['jobDescription']
        resume = request.files['resume']
        prompt_type = request.form['promptType']

        pdf_content = input_pdf_setup(resume)

        prompts = {
            'tell_me_about_resume': """
                You are an experienced Technical Human Resource Manager, your task is to review the provided resume against the job description. 
                Please share your professional evaluation on whether the candidate's profile aligns with the role. 
                Highlight the strengths and weaknesses of the applicant in relation to the specified job requirements.
            """,
            'suggest_missing_keywords': """
                You are a skilled ATS (Applicant Tracking System) scanner, your task is to identify and suggest important keywords missing from the resume that are relevant to the job description provided.
            """,
            'percentage_match': """
                You are a skilled ATS (Applicant Tracking System) scanner with a deep understanding of data science and ATS functionality, 
                your task is to evaluate the resume against the provided job description. Give me the percentage of match if the resume matches
                the job description. First the output should come as a percentage and then keywords missing and last final thoughts.
            """,
            'improve_skills': """
                You are an experienced career coach. Please provide suggestions on how the candidate can improve their skills to better match the job description provided. Focus on both technical and soft skills.
            """,
            'overall_feedback': """
                You are an experienced Technical Human Resource Manager. Please provide an overall feedback on the candidate's resume, including formatting, clarity, and relevance to the job description provided. Suggest any general improvements that can be made.
            """
        }

        prompt = prompts.get(prompt_type)
        if not prompt:
            raise ValueError("Invalid prompt type")

        response_text = get_gemini_response(job_description, pdf_content, prompt)

        return jsonify({'result': response_text})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
