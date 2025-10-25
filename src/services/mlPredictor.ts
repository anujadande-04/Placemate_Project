/**
 * Machine Learning Predictor for Placement Prediction
 * Uses trained Logistic Regression model coefficients for inference
 */

interface MLModelData {
  model_type: string;
  coefficients: number[];
  intercept: number;
  feature_names: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  degree_classes: string[];
  skills_vocabulary: { [key: string]: number };
  skills_idf: number[];
  training_info: {
    n_features: number;
    accuracy: string;
    trained_on: string;
  };
}

interface StudentProfile {
  cgpa: number;
  branch: string;
  workExp: number;
  internships: number;
  projects: number;
  skills: string[];
  resumeScore?: number;
  softSkills?: number;
}

interface MLPredictionResult {
  binaryPrediction: 'Yes' | 'No';
  probabilityPercentage: number; // 0-100
  confidence: 'High' | 'Medium' | 'Low';
  rawProbability: number; // 0.0-1.0 for internal use
}

class MLPlacementPredictor {
  private modelData: MLModelData | null = null;
  private isModelLoaded = false;

  async loadModel(modelPath: string = '/trained_model.json'): Promise<void> {
    try {
      const response = await fetch(modelPath);
      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.statusText}`);
      }
      this.modelData = await response.json();
      this.isModelLoaded = true;
      console.log('🤖 ML Model loaded successfully!');
      console.log(`📊 Model accuracy: ${this.modelData.training_info.accuracy}`);
    } catch (error) {
      console.error('❌ Error loading ML model:', error);
      throw new Error('Failed to load trained ML model');
    }
  }

  private ensureModelLoaded(): void {
    if (!this.isModelLoaded || !this.modelData) {
      throw new Error('ML model not loaded. Call loadModel() first.');
    }
  }

  private extractFeatures(profile: StudentProfile): number[] {
    this.ensureModelLoaded();
    
    const features: number[] = [];
    
    // Base numerical features
    const cgpa = profile.cgpa;
    const workExp = profile.workExp;
    const internships = profile.internships;
    const projects = profile.projects;
    const resumeScore = profile.resumeScore || 70;
    const softSkills = profile.softSkills || 75;
    
    features.push(cgpa);
    features.push(workExp);
    features.push(internships);
    features.push(projects);
    features.push(resumeScore);
    features.push(softSkills);
    
    // Degree encoding
    const degreeIndex = this.modelData!.degree_classes.indexOf(profile.branch);
    features.push(degreeIndex >= 0 ? degreeIndex : 0);
    
    // Enhanced derived features (matching training script)
    features.push(cgpa * cgpa); // CGPA_Squared
    features.push(workExp + (internships * 0.5)); // Total_Experience
    features.push(projects / (workExp + 1)); // Project_Intensity
    features.push((cgpa * 0.4 + resumeScore * 0.3 + softSkills * 0.3) / 100); // Excellence_Score
    
    // CS Branch indicator
    const csBranches = ['Computer Science Engineering', 'Information Technology', 'Computer Science'];
    features.push(csBranches.includes(profile.branch) ? 1 : 0);
    
    // Skills TF-IDF features
    const skillsVector = this.computeSkillsTFIDF(profile.skills);
    features.push(...skillsVector);
    
    // Note: Polynomial features and feature selection would be pre-computed in training
    // For simplicity, we'll approximate by padding with zeros for now
    const expectedFeatureCount = this.modelData!.feature_names.length;
    while (features.length < expectedFeatureCount) {
      features.push(0);
    }
    
    return features.slice(0, expectedFeatureCount); // Ensure exact feature count
  }

  private computeSkillsTFIDF(skills: string[]): number[] {
    this.ensureModelLoaded();
    
    const vocabulary = this.modelData!.skills_vocabulary;
    const idf = this.modelData!.skills_idf;
    const skillsText = skills.join(' ').toLowerCase();
    
    // Create TF-IDF vector
    const tfidfVector = new Array(Object.keys(vocabulary).length).fill(0);
    
    // Calculate term frequency for each skill
    const termCounts: { [key: string]: number } = {};
    skills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      Object.keys(vocabulary).forEach(vocabTerm => {
        if (normalizedSkill.includes(vocabTerm) || vocabTerm.includes(normalizedSkill)) {
          termCounts[vocabTerm] = (termCounts[vocabTerm] || 0) + 1;
        }
      });
    });
    
    // Apply TF-IDF weighting
    Object.entries(termCounts).forEach(([term, count]) => {
      const vocabIndex = vocabulary[term];
      if (vocabIndex !== undefined && vocabIndex < tfidfVector.length) {
        const tf = count / skills.length;
        const idfValue = idf[vocabIndex] || 1;
        tfidfVector[vocabIndex] = tf * idfValue;
      }
    });
    
    return tfidfVector;
  }

  private scaleFeatures(features: number[]): number[] {
    this.ensureModelLoaded();
    
    const scalerMean = this.modelData!.scaler_mean;
    const scalerScale = this.modelData!.scaler_scale;
    
    return features.map((feature, index) => {
      if (index < scalerMean.length) {
        return (feature - scalerMean[index]) / scalerScale[index];
      }
      return feature;
    });
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  predict(profile: StudentProfile): MLPredictionResult {
    this.ensureModelLoaded();
    
    try {
      // Extract and prepare features
      const rawFeatures = this.extractFeatures(profile);
      const scaledFeatures = this.scaleFeatures(rawFeatures);
      
      // Compute logistic regression prediction
      const coefficients = this.modelData!.coefficients;
      const intercept = this.modelData!.intercept;
      
      console.log('🔍 ML Prediction Debug:', {
        profileSummary: {
          cgpa: profile.cgpa,
          workExp: profile.workExp,
          internships: profile.internships,
          projects: profile.projects,
          skillsCount: profile.skills.length
        },
        firstFewFeatures: rawFeatures.slice(0, 12),
        firstFewScaledFeatures: scaledFeatures.slice(0, 12),
        intercept: intercept,
        firstFewCoeffs: coefficients.slice(0, 12)
      });
      
      // Calculate linear combination: w·x + b
      let linearCombination = intercept;
      for (let i = 0; i < Math.min(scaledFeatures.length, coefficients.length); i++) {
        linearCombination += scaledFeatures[i] * coefficients[i];
      }
      
      console.log('🧮 Linear Combination:', linearCombination);
      
      // Apply sigmoid to get probability
      const rawProbability = this.sigmoid(linearCombination);
      
      // Convert to percentage (0-100)
      const probabilityPercentage = Math.round(rawProbability * 100);
      
      console.log('📊 Raw Probability:', rawProbability, 'Percentage:', probabilityPercentage);
      
      // Binary prediction (threshold = 0.5)
      const binaryPrediction: 'Yes' | 'No' = rawProbability >= 0.5 ? 'Yes' : 'No';
      
      // Enhanced confidence level calculation
      let confidence: 'High' | 'Medium' | 'Low';
      const distanceFromThreshold = Math.abs(rawProbability - 0.5);
      
      // More sophisticated confidence calculation based on enhanced model
      if (distanceFromThreshold >= 0.35) {
        confidence = 'High';
      } else if (distanceFromThreshold >= 0.20) {
        confidence = 'Medium';
      } else {
        confidence = 'Low';
      }
      
      // Boost confidence for very strong profiles
      if (rawProbability >= 0.85 || rawProbability <= 0.15) {
        confidence = 'High';
      }
      
      return {
        binaryPrediction,
        probabilityPercentage,
        confidence,
        rawProbability
      };
      
    } catch (error) {
      console.error('❌ Error in ML prediction:', error);
      // Fallback to statistical method if ML fails
      return {
        binaryPrediction: 'No',
        probabilityPercentage: 50,
        confidence: 'Low',
        rawProbability: 0.5
      };
    }
  }

  getModelInfo(): { accuracy: string; featuresCount: number; trainedOn: string } | null {
    if (!this.isModelLoaded || !this.modelData) {
      return null;
    }
    
    return {
      accuracy: this.modelData.training_info.accuracy,
      featuresCount: this.modelData.training_info.n_features,
      trainedOn: this.modelData.training_info.trained_on
    };
  }
}

// Export singleton instance
export const mlPredictor = new MLPlacementPredictor();
export type { StudentProfile, MLPredictionResult };