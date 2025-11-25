from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

class RecommendationModel:
    def __init__(self, data):
        self.data = data
        self.model = RandomForestClassifier()

    def preprocess_data(self):
        # Example preprocessing: fill missing values and encode categorical variables
        self.data.fillna(0, inplace=True)
        self.data = pd.get_dummies(self.data)

    def train(self):
        X = self.data.drop('target', axis=1)
        y = self.data['target']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)
        predictions = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        return accuracy

    def recommend(self, input_data):
        input_df = pd.DataFrame(input_data)
        return self.model.predict(input_df)