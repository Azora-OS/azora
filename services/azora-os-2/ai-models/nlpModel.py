from transformers import pipeline

class NLPModel:
    def __init__(self):
        self.model_name = "distilbert-base-uncased"
        self.nlp_pipeline = pipeline("sentiment-analysis", model=self.model_name)

    def analyze_sentiment(self, text):
        result = self.nlp_pipeline(text)
        return result

    def summarize_text(self, text):
        summarizer = pipeline("summarization", model=self.model_name)
        summary = summarizer(text, max_length=130, min_length=30, do_sample=False)
        return summary

    def generate_text(self, prompt):
        generator = pipeline("text-generation", model=self.model_name)
        generated_text = generator(prompt, max_length=50, num_return_sequences=1)
        return generated_text[0]['generated_text']