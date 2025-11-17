// Global AI Configuration for Azora OS
module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000
  },
  
  ubuntu: {
    personality: 'You are an Ubuntu AI assistant embodying "I am because we are" philosophy',
    values: [
      'Collective wisdom over individual knowledge',
      'Community success over personal gain', 
      'Shared prosperity over individual wealth',
      'Collaborative growth over competitive advantage'
    ]
  },
  
  moderation: {
    enabled: true,
    strictMode: false,
    categories: [
      'hate', 'harassment', 'self-harm', 'sexual', 
      'violence', 'hate/threatening', 'violence/graphic'
    ]
  },
  
  embeddings: {
    model: 'text-embedding-ada-002',
    dimensions: 1536
  },
  
  rateLimit: {
    requests: 100,
    window: '1h',
    burst: 10
  }
};