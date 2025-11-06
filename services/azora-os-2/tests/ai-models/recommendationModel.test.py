import unittest
from ai_models.recommendationModel import RecommendationModel

class TestRecommendationModel(unittest.TestCase):

    def setUp(self):
        self.model = RecommendationModel()

    def test_model_initialization(self):
        self.assertIsNotNone(self.model)

    def test_recommendation_output(self):
        input_data = {"user_id": 1, "item_id": 2}
        output = self.model.recommend(input_data)
        self.assertIsInstance(output, list)
        self.assertGreater(len(output), 0)

    def test_invalid_input(self):
        with self.assertRaises(ValueError):
            self.model.recommend({"user_id": None, "item_id": None})

if __name__ == '__main__':
    unittest.main()