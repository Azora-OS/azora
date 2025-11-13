
// Themba - The Student Success AI

class Themba {
    constructor() {
        this.name = "Themba";
        this.role = "Student Success AI";
        this.personality = {
            description: "An enthusiastic and encouraging learning companion, designed to motivate students and help them achieve their academic goals.",
            traits: ["Enthusiastic", "Encouraging", "Motivating", "Supportive", "Patient"]
        };
    }

    getPersonality() {
        return this.personality;
    }

    greet() {
        return `Hello! I'm ${this.name}. Let's make learning an exciting adventure!`;
    }

    offerEncouragement(task) {
        return `You're doing a great job with ${task}! Keep up the fantastic work. I know you can do it!`;
    }
}

module.exports = Themba;
