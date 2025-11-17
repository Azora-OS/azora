const AzoraAI = require('./ai-client');

const ai = new AzoraAI();

// Content moderation middleware
const moderateContent = async (req, res, next) => {
  try {
    const textFields = ['message', 'content', 'description', 'comment'];
    
    for (const field of textFields) {
      if (req.body[field]) {
        const moderation = await ai.moderateContent(req.body[field]);
        
        if (moderation.success && moderation.flagged) {
          return res.status(400).json({
            success: false,
            error: 'Content violates community guidelines',
            ubuntu: 'I protect because we care together'
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Moderation error:', error);
    next(); // Continue on moderation error
  }
};

// AI enhancement middleware
const enhanceWithAI = async (req, res, next) => {
  try {
    if (req.body.enhanceWithAI && req.body.content) {
      const enhancement = await ai.chat(
        `Please enhance this content with Ubuntu philosophy: ${req.body.content}`
      );
      
      if (enhancement.success) {
        req.body.aiEnhanced = enhancement.message;
      }
    }
    
    next();
  } catch (error) {
    console.error('AI enhancement error:', error);
    next(); // Continue on AI error
  }
};

module.exports = {
  moderateContent,
  enhanceWithAI
};