#!/usr/bin/env python3
"""
Enhanced Placement Prediction ML Model Trainer
Uses optimized Logistic Regression with advanced feature engineering
Exports model coefficients for JavaScript integration
"""

import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder, PolynomialFeatures
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import SelectKBest, f_classif
import warnings
warnings.filterwarnings('ignore')

class PlacementMLTrainer:
    def __init__(self):
        # Enhanced model with optimized hyperparameters
        self.model = None  # Will be set after hyperparameter tuning
        self.scaler = StandardScaler()
        self.degree_encoder = LabelEncoder()
        self.skills_vectorizer = TfidfVectorizer(
            max_features=100,  # Increased for better skill representation
            stop_words='english',
            ngram_range=(1, 2),  # Include bigrams for better context
            min_df=2,  # Minimum document frequency
            max_df=0.95  # Maximum document frequency
        )
        self.poly_features = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
        self.feature_selector = SelectKBest(f_classif, k=150)  # Feature selection
        self.feature_names = []
        self.best_params = {}
        
    def load_and_preprocess_data(self, csv_path):
        """Load and preprocess the placement dataset"""
        print("📊 Loading dataset...")
        df = pd.read_csv(csv_path)
        print(f"Dataset loaded: {len(df)} records")
        
        # Handle missing values
        df = df.dropna()
        
        # Create target variable (1 for Placed=Yes, 0 for Placed=No)
        df['Placed_Binary'] = (df['Placed'] == 'Yes').astype(int)
        
        print(f"Placement Rate: {df['Placed_Binary'].mean():.2%}")
        
        return df
    
    def feature_engineering(self, df):
        """Create and engineer advanced features for the model"""
        print("🔧 Engineering enhanced features...")
        
        # Base numerical features
        numerical_features = ['CGPA', 'WorkExp', 'Internships', 'Projects', 'ResumeScore', 'SoftSkills']
        
        # Create derived features for better predictions
        df['CGPA_Squared'] = df['CGPA'] ** 2
        df['Total_Experience'] = df['WorkExp'] + (df['Internships'] * 0.5)  # Weight internships as half experience
        df['Project_Intensity'] = df['Projects'] / (df['WorkExp'] + 1)  # Projects per year of experience
        df['Skill_Resume_Ratio'] = df['ResumeScore'] / (df['SoftSkills'] + 1)
        df['Excellence_Score'] = (df['CGPA'] * 0.4 + df['ResumeScore'] * 0.3 + df['SoftSkills'] * 0.3) / 100
        
        # Enhanced numerical features
        enhanced_numerical = numerical_features + [
            'CGPA_Squared', 'Total_Experience', 'Project_Intensity', 
            'Skill_Resume_Ratio', 'Excellence_Score'
        ]
        
        # Encode degree/branch with better handling
        df['Degree_Encoded'] = self.degree_encoder.fit_transform(df['Degree'])
        
        # Create degree category features
        cs_branches = ['Computer Science Engineering', 'Information Technology', 'Computer Science']
        df['Is_CS_Branch'] = df['Degree'].isin(cs_branches).astype(int)
        
        # Process skills using enhanced TF-IDF
        skills_features = self.skills_vectorizer.fit_transform(df['Skills']).toarray()
        skills_feature_names = [f'Skill_{name}' for name in self.skills_vectorizer.get_feature_names_out()]
        
        # Combine all base features
        X_numerical = df[enhanced_numerical + ['Degree_Encoded', 'Is_CS_Branch']].values
        X_skills = skills_features
        X_base = np.hstack([X_numerical, X_skills])
        
        # Create polynomial features for interactions
        print("🔗 Creating feature interactions...")
        X_poly = self.poly_features.fit_transform(X_numerical)  # Only on numerical features to avoid explosion
        
        # Combine all features
        X_combined = np.hstack([X_base, X_poly])
        
        # Feature selection to reduce overfitting
        print("🎯 Selecting best features...")
        X_selected = self.feature_selector.fit_transform(X_combined, df['Placed_Binary'])
        
        # Store feature names (approximation for selected features)
        base_feature_names = enhanced_numerical + ['Degree_Encoded', 'Is_CS_Branch'] + skills_feature_names
        poly_feature_names = [f'Poly_{i}' for i in range(X_poly.shape[1])]
        all_feature_names = base_feature_names + poly_feature_names
        
        # Get selected feature indices
        selected_features = self.feature_selector.get_support()
        self.feature_names = [name for name, selected in zip(all_feature_names, selected_features) if selected]
        
        print(f"Total features after engineering: {X_combined.shape[1]}")
        print(f"Selected features: {X_selected.shape[1]}")
        
        return X_selected, df['Placed_Binary'].values
    
    def hyperparameter_tuning(self, X, y):
        """Perform hyperparameter tuning to find best model"""
        print("🔍 Performing hyperparameter tuning...")
        
        # Define parameter grid
        param_grid = {
            'C': [0.01, 0.1, 1, 10, 100],
            'penalty': ['l1', 'l2'],
            'solver': ['liblinear', 'saga'],
            'class_weight': [None, 'balanced']
        }
        
        # Create base model
        base_model = LogisticRegression(random_state=42, max_iter=2000)
        
        # Perform grid search with cross-validation
        grid_search = GridSearchCV(
            base_model, param_grid, cv=5, 
            scoring='accuracy', n_jobs=-1, verbose=1
        )
        
        # Fit on a sample for faster tuning
        sample_size = min(5000, len(X))
        sample_indices = np.random.choice(len(X), sample_size, replace=False)
        X_sample, y_sample = X[sample_indices], y[sample_indices]
        
        # Scale sample data
        X_sample_scaled = self.scaler.fit_transform(X_sample)
        grid_search.fit(X_sample_scaled, y_sample)
        
        self.best_params = grid_search.best_params_
        print(f"🏆 Best parameters: {self.best_params}")
        print(f"🎯 Best cross-validation score: {grid_search.best_score_:.4f}")
        
        # Create final model with best parameters
        self.model = LogisticRegression(random_state=42, max_iter=2000, **self.best_params)
        
        return grid_search.best_score_

    def train_model(self, X, y):
        """Train the optimized logistic regression model"""
        print("🚀 Training optimized Logistic Regression model...")
        
        # Perform hyperparameter tuning first
        cv_score = self.hyperparameter_tuning(X, y)
        
        # Split data with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        print(f"Class distribution - Placed: {np.mean(y_train):.2%}")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train final model with best parameters
        self.model.fit(X_train_scaled, y_train)
        
        # Cross-validation on training set
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
        print(f"🔄 Cross-validation accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
        
        # Make predictions
        y_train_pred = self.model.predict(X_train_scaled)
        y_test_pred = self.model.predict(X_test_scaled)
        
        # Get probability predictions
        y_train_proba = self.model.predict_proba(X_train_scaled)[:, 1]
        y_test_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        train_accuracy = accuracy_score(y_train, y_train_pred)
        test_accuracy = accuracy_score(y_test, y_test_pred)
        auc_score = roc_auc_score(y_test, y_test_proba)
        
        print(f"✅ Training Accuracy: {train_accuracy:.4f}")
        print(f"✅ Test Accuracy: {test_accuracy:.4f}")
        print(f"📈 AUC Score: {auc_score:.4f}")
        
        # Show probability distribution
        avg_placed_prob = y_test_proba[y_test == 1].mean()
        avg_not_placed_prob = y_test_proba[y_test == 0].mean()
        print(f"📊 Average probability for placed students: {avg_placed_prob:.1%}")
        print(f"📊 Average probability for non-placed students: {avg_not_placed_prob:.1%}")
        
        # Detailed evaluation
        print("\n📈 Classification Report:")
        print(classification_report(y_test, y_test_pred, target_names=['Not Placed', 'Placed']))
        
        return X_test_scaled, y_test
    
    def analyze_feature_importance(self):
        """Analyze which features are most important"""
        print("\n🎯 Feature Importance Analysis:")
        coefficients = self.model.coef_[0]
        
        # Get top 10 most important features
        feature_importance = list(zip(self.feature_names, coefficients))
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        
        print("Top 10 Most Important Features:")
        for i, (feature, coef) in enumerate(feature_importance[:10]):
            direction = "📈 Positive" if coef > 0 else "📉 Negative"
            print(f"{i+1:2d}. {feature:20s}: {coef:8.4f} ({direction})")
    
    def export_model(self, output_path='public/trained_model.json'):
        """Export enhanced model parameters for JavaScript usage"""
        print(f"\n💾 Exporting enhanced model to {output_path}...")
        
        # Calculate final test accuracy
        final_accuracy = accuracy_score(self.y_test, self.model.predict(self.X_test))
        auc_score = roc_auc_score(self.y_test, self.model.predict_proba(self.X_test)[:, 1])
        
        model_data = {
            'model_type': 'Enhanced_LogisticRegression',
            'coefficients': self.model.coef_[0].tolist(),
            'intercept': self.model.intercept_[0],
            'feature_names': self.feature_names,
            'scaler_mean': self.scaler.mean_.tolist(),
            'scaler_scale': self.scaler.scale_.tolist(),
            'degree_classes': self.degree_encoder.classes_.tolist(),
            'skills_vocabulary': self.skills_vectorizer.vocabulary_,
            'skills_idf': self.skills_vectorizer.idf_.tolist(),
            'best_hyperparameters': self.best_params,
            'feature_selection_k': self.feature_selector.k,
            'polynomial_degree': self.poly_features.degree,
            'training_info': {
                'n_features_original': len(self.feature_names),
                'n_features_selected': self.feature_selector.k,
                'final_accuracy': f"{final_accuracy:.4f}",
                'auc_score': f"{auc_score:.4f}",
                'hyperparameters': self.best_params,
                'trained_on': pd.Timestamp.now().isoformat(),
                'model_version': '2.0_Enhanced'
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(model_data, f, indent=2)
        
        print("✅ Enhanced model exported successfully!")
        print(f"📊 Final Performance: Accuracy={final_accuracy:.4f}, AUC={auc_score:.4f}")
        
    def run_full_training(self, csv_path='public/dataset.csv'):
        """Run the complete enhanced training pipeline"""
        print("🤖 Starting Enhanced ML Model Training Pipeline\n")
        
        # Load and preprocess data
        df = self.load_and_preprocess_data(csv_path)
        
        # Advanced feature engineering
        X, y = self.feature_engineering(df)
        
        # Train optimized model
        self.X_test, self.y_test = self.train_model(X, y)
        
        # Analyze feature importance
        self.analyze_feature_importance()
        
        # Export enhanced model
        self.export_model()
        
        print("\n🎉 Enhanced training completed successfully!")
        print("� Optimized model ready for production use!")
        print("🔗 Model integrated with advanced feature engineering and hyperparameter tuning")

if __name__ == "__main__":
    trainer = PlacementMLTrainer()
    trainer.run_full_training()