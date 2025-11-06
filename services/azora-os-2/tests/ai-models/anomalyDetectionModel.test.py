import unittest
from ai_models.anomalyDetectionModel import AnomalyDetectionModel

class TestAnomalyDetectionModel(unittest.TestCase):

    def setUp(self):
        self.model = AnomalyDetectionModel()

    def test_model_initialization(self):
        self.assertIsNotNone(self.model)

    def test_model_prediction(self):
        sample_data = [1.0, 2.0, 3.0, 4.0, 5.0]
        prediction = self.model.predict(sample_data)
        self.assertIsInstance(prediction, list)

    def test_model_training(self):
        training_data = [[1.0, 2.0], [2.0, 3.0], [3.0, 4.0]]
        self.model.train(training_data)
        self.assertTrue(self.model.is_trained)

if __name__ == '__main__':
    unittest.main()