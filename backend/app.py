from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI, RateLimitError
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)
client = OpenAI(api_key="OPEN_APIKEY")

def fetch_patent_claims(patent_id):
    try:
        prompt = (
            f"Provide the patent claims for patent ID '{patent_id}'. Return a JSON response with a 'claims' field containing a list of claims in the format 'claim_id: claim_description'."
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return data.get("claims", [])
    except RateLimitError:
        return []
    except Exception as e:
        print(f"Error fetching patent claims: {e}")
        return []

# Fetch company products dynamically using OpenAI
def fetch_company_products(company_name):
    try:
        prompt = (
            f"Provide a list of products for the company '{company_name}'. Return a JSON response with a 'products' field containing a list of objects with 'name' and 'summary' fields."
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return data.get("products", [])
    except RateLimitError:
        return []
    except Exception as e:
        print(f"Error fetching company products: {e}")
        return []

# Analyze infringement using OpenAI
def llm_analyze_infringement(patent_claims, product_name, product_summary):
    if not patent_claims:
        return {
            "infringement_likelihood": "Unknown",
            "relevant_claims": [],
            "explanation": "No patent claims available for analysis.",
            "specific_features": []
        }
    
    prompt = (
        f"Analyze whether '{product_name}' with the summary '{product_summary}' infringes on the following patent claims: "
        f"{', '.join(patent_claims)}. Provide a JSON response with the following fields: "
        f"infringement_likelihood (High, Moderate, or Low), relevant_claims (list of claim IDs), "
        f"explanation (string), and specific_features (list of features from the claims that match)."
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except RateLimitError:
        return {
            "infringement_likelihood": "Unknown",
            "relevant_claims": [],
            "explanation": "Unable to analyze due to OpenAI API rate limit. Please try again later or check your API quota.",
            "specific_features": []
        }
    except Exception as e:
        print(f"Error in LLM analysis: {e}")
        return {
            "infringement_likelihood": "Unknown",
            "relevant_claims": [],
            "explanation": "Error during infringement analysis.",
            "specific_features": []
        }

def analyze_infringement(patent_id, company_name):
    # Fetch patent claims dynamically
    patent_claims = fetch_patent_claims(patent_id)
    
    # Fetch company products dynamically
    company_products = fetch_company_products(company_name)
    
    if not patent_claims or not company_products:
        return {"error": "Could not fetch patent claims or company products"}, 404
    
    results = []
    for product in company_products[:2]:  # Top 2 products
        analysis = llm_analyze_infringement(patent_claims, product["name"], product["summary"])
        results.append({
            "product_name": product["name"],
            **analysis
        })
    
    return {
        "analysis_id": "1",
        "patent_id": patent_id,
        "company_name": company_name,
        "analysis_date": datetime.now().strftime("%Y-%m-%d"),
        "top_infringing_products": results,
        "overall_risk_assessment": "High risk" if any(p["infringement_likelihood"] == "High" for p in results) else "Moderate risk"
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    patent_id = data.get('patent_id')
    company_name = data.get('company_name')
    
    if not patent_id or not company_name:
        return jsonify({"error": "Missing patent_id or company_name"}), 400
    
    result = analyze_infringement(patent_id, company_name)
    if "error" in result:
        return jsonify(result), result.pop("error")
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
