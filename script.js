class PromptChecker {
    constructor() {
        this.checkButton = document.getElementById('check-prompt');
        this.promptInput = document.getElementById('prompt-input');
        this.resultsSection = document.getElementById('results-section');
        this.loading = document.getElementById('loading');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.checkButton.addEventListener('click', () => this.analyzePrompt());
        
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.analyzePrompt();
            }
        });
    }

    async analyzePrompt() {
        const prompt = this.promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt to analyze!');
            return;
        }

        this.showLoading();

        try {
            const analysis = await this.getPromptAnalysis(prompt);
            this.displayResults(analysis);
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Sorry, there was an error analyzing your prompt. Please try again.');
            this.hideLoading();
        }
    }

    async getPromptAnalysis(prompt) {
        const analysisPrompt = `Analyze this AI prompt according to the 7 key principles of effective prompting:

1. Specificity & Detail: How specific and detailed is the request?
2. Clear Structure: Is the prompt well-organized and easy to follow?
3. Context & Examples: Does it provide sufficient context or examples?
4. Actionability: Is it clear what action the AI should take?

User's prompt: "${prompt}"

Respond with JSON in this exact format:
{
  "overallGrade": "A" | "B" | "C" | "D" | "F",
  "overallScore": 85,
  "gradeTitle": "Excellent Prompt!",
  "gradeDescription": "Your prompt follows best practices",
  "criteria": {
    "specificity": {
      "score": 85,
      "feedback": "Good level of detail provided"
    },
    "structure": {
      "score": 75,
      "feedback": "Well-organized request"
    },
    "context": {
      "score": 65,
      "feedback": "Could benefit from more context"
    },
    "actionability": {
      "score": 80,
      "feedback": "Clear action requested"
    }
  },
  "suggestions": [
    "Add specific word count or length requirements",
    "Include your target audience information",
    "Provide an example of the desired output format"
  ],
  "improvedPrompt": "Write a 300-word informational article about golden retriever care for new dog owners, focusing on exercise needs and grooming requirements. Use a friendly, approachable tone and include specific tips that can be implemented immediately."
}`;

        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert in AI prompt engineering. Analyze prompts based on best practices and provide constructive feedback."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            json: true
        });

        return JSON.parse(completion.content);
    }

    showLoading() {
        this.loading.classList.remove('hidden');
        this.resultsSection.classList.add('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    displayResults(analysis) {
        // Update grade display
        document.getElementById('grade-letter').textContent = analysis.overallGrade;
        document.getElementById('grade-title').textContent = analysis.gradeTitle;
        document.getElementById('grade-description').textContent = analysis.gradeDescription;

        // Update grade circle color based on grade
        const gradeCircle = document.querySelector('.grade-circle');
        gradeCircle.style.background = this.getGradeColor(analysis.overallGrade);

        // Update criteria scores
        this.updateCriterion('specificity', analysis.criteria.specificity);
        this.updateCriterion('structure', analysis.criteria.structure);
        this.updateCriterion('context', analysis.criteria.context);
        this.updateCriterion('actionability', analysis.criteria.actionability);

        // Update suggestions
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = '';
        analysis.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });

        // Update improved prompt
        document.getElementById('improved-prompt').textContent = analysis.improvedPrompt;

        // Hide loading and show results with animation
        this.hideLoading();
        this.resultsSection.classList.remove('hidden');
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateCriterion(name, data) {
        const scoreBar = document.getElementById(`${name}-bar`);
        const scoreNumber = document.getElementById(`${name}-score`);
        const feedback = document.getElementById(`${name}-feedback`);

        // Animate score bar
        setTimeout(() => {
            scoreBar.style.width = `${data.score}%`;
        }, 300);

        scoreNumber.textContent = `${data.score}%`;
        feedback.textContent = data.feedback;
    }

    getGradeColor(grade) {
        const colors = {
            'A': 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            'B': 'linear-gradient(135deg, #8bc34a 0%, #7cb342 100%)',
            'C': 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            'D': 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
            'F': 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
        };
        return colors[grade] || colors['C'];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PromptChecker();
});