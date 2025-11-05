from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd

class AnomalyDetectionModel:
    def __init__(self, contamination=0.1):
        self.contamination = contamination
        self.model = IsolationForest(contamination=self.contamination)

    def fit(self, data):
        self.model.fit(data)

    def predict(self, data):
        predictions = self.model.predict(data)
        return np.where(predictions == -1, 1, 0)  # 1 for anomaly, 0 for normal

    def evaluate(self, data, true_labels):
        predictions = self.predict(data)
        accuracy = np.mean(predictions == true_labels)
        return accuracy

# Example usage:
# if __name__ == "__main__":
#     # Load your data here
#     data = pd.read_csv('your_data.csv')
#     model = AnomalyDetectionModel(contamination=0.05)
#     model.fit(data)
#     anomalies = model.predict(data)
#     print("Anomalies detected:", anomalies)