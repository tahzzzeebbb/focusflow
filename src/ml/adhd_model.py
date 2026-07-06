import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

class ADHDMLModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        
    def train(self, data_path):
        try:
            df = pd.read_csv(data_path)
            features = ['age', 'inattentionScore', 'hyperactivityScore', 'impulsivityScore']
            X = df[features].copy()
            y = df['adhd']
            
            if 'gender' in df.columns:
                gender_map = {'Male': 1, 'Female': 0, 'Nonbinary': 2}
                df['gender_encoded'] = df['gender'].map(gender_map).fillna(0)
                X['gender_encoded'] = df['gender_encoded']
            
            X_scaled = self.scaler.fit_transform(X)
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
            
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.model.fit(X_train, y_train)
            
            accuracy = self.model.score(X_test, y_test)
            print(f"Model accuracy: {accuracy:.2f}")
            
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.model, 'models/adhd_model.pkl')
            joblib.dump(self.scaler, 'models/scaler.pkl')
            
            return accuracy
        except Exception as e:
            print(f"Training error: {e}")
            return 0
    
    def predict(self, age, gender, inattention, hyperactivity, impulsivity):
        try:
            gender_enc = {'Male': 1, 'Female': 0, 'Nonbinary': 2}.get(gender, 0)
            features = [[age, inattention, hyperactivity, impulsivity, gender_enc]]
            
            if self.scaler is None:
                self.scaler = joblib.load('models/scaler.pkl')
            features_scaled = self.scaler.transform(features)
            
            if self.model is None:
                self.model = joblib.load('models/adhd_model.pkl')
            
            proba = self.model.predict_proba(features_scaled)[0][1]
            
            if proba >= 0.7:
                risk = "High"
                recommendation = "Immediate clinical evaluation recommended. Consult psychiatrist."
            elif proba >= 0.4:
                risk = "Moderate"
                recommendation = "Monitor symptoms. Consider screening and behavioral interventions."
            else:
                risk = "Low"
                recommendation = "Regular check-ups. Maintain healthy habits."
                
            return {
                'probability': round(proba * 100, 1),
                'risk_level': risk,
                'recommendation': recommendation
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                'probability': 0,
                'risk_level': "Unknown",
                'recommendation': "Unable to predict. Please consult a specialist."
            }

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = ADHDMLModel()

if os.path.exists('models/adhd_model.pkl'):
    try:
        model.model = joblib.load('models/adhd_model.pkl')
        model.scaler = joblib.load('models/scaler.pkl')
        print("Model loaded successfully")
    except:
        print("Could not load model")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        result = model.predict(
            age=data.get('age', 0),
            gender=data.get('gender', 'Unknown'),
            inattention=data.get('inattention', 0),
            hyperactivity=data.get('hyperactivity', 0),
            impulsivity=data.get('impulsivity', 0)
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)