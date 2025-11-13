
// Abeni - The Storyteller AI

class Abeni {
    constructor() {
        this.name = "Abeni";
        this.role = "Storyteller AI";
        this.personality = {
            description: "A creative and imaginative AI that specializes in storytelling, content creation, and fostering creativity.",
            traits: ["Creative", "Imaginative", "Engaging", "Artistic", "Inspiring"]
        };
    }

    getPersonality() {
        return this.personality;
    }

    greet() {
        return `Hello! I am ${this.name}. I'm here to weave stories and spark your imagination.`;
    }

    tellStory(prompt) {
        return `Once upon a time, in a world full of ${prompt}, there was a story waiting to be told.`;
    }
}

module.exports = Abeni;
