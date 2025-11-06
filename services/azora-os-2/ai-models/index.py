from ai_models.recommendation_model import RecommendationModel
from ai_models.anomaly_detection_model import AnomalyDetectionModel
from ai_models.nlp_model import NLPModel
from ai_models.vision_model import VisionModel

class AIModels:
    def __init__(self):
        self.recommendation_model = RecommendationModel()
        self.anomaly_detection_model = AnomalyDetectionModel()
        self.nlp_model = NLPModel()
        self.vision_model = VisionModel()

    def train_all_models(self, data):
        self.recommendation_model.train(data)
        self.anomaly_detection_model.train(data)
        self.nlp_model.train(data)
        self.vision_model.train(data)

    def evaluate_all_models(self, test_data):
        results = {
            "recommendation": self.recommendation_model.evaluate(test_data),
            "anomaly_detection": self.anomaly_detection_model.evaluate(test_data),
            "nlp": self.nlp_model.evaluate(test_data),
            "vision": self.vision_model.evaluate(test_data),
        }
        return results

    def predict(self, model_name, input_data):
        if model_name == "recommendation":
            return self.recommendation_model.predict(input_data)
        elif model_name == "anomaly_detection":
            return self.anomaly_detection_model.predict(input_data)
        elif model_name == "nlp":
            return self.nlp_model.predict(input_data)
        elif model_name == "vision":
            return self.vision_model.predict(input_data)
        else:
            raise ValueError("Invalid model name")