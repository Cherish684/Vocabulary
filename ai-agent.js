// AI Agent System for VocabBoost - Section Based UI
console.log("AI Agent System loaded!");

class AIAgentSystem {
    constructor() {
        this.currentWord = null;
        this.quizData = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.initializeAgents();
        this.setupEventListeners();
    }

    initializeAgents() {
        console.log("Initializing AI Agents...");
        this.wordNetAgent = new WordNetAgent();
        this.wordClueAgent = new WordClueAgent();
    }

    setupEventListeners() {
        // Word Net search
        const wordnetSearchBtn = document.getElementById('wordnet-search-btn');
        const wordnetSearchInput = document.getElementById('wordnet-search-input');

        if (wordnetSearchBtn && wordnetSearchInput) {
            wordnetSearchBtn.addEventListener('click', () => {
                const word = wordnetSearchInput.value.trim();
                if (word) {
                    this.analyzeWordNet(word);
                }
            });

            wordnetSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const word = wordnetSearchInput.value.trim();
                    if (word) {
                        this.analyzeWordNet(word);
                    }
                }
            });
        }

        // Word Clue search
        const wordclueSearchBtn = document.getElementById('wordclue-search-btn');
        const wordclueSearchInput = document.getElementById('wordclue-search-input');

        if (wordclueSearchBtn && wordclueSearchInput) {
            wordclueSearchBtn.addEventListener('click', () => {
                const word = wordclueSearchInput.value.trim();
                if (word) {
                    this.startWordClueQuiz(word);
                }
            });

            wordclueSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const word = wordclueSearchInput.value.trim();
                    if (word) {
                        this.startWordClueQuiz(word);
                    }
                }
            });
        }
    }

    async analyzeWordNet(word) {
        const resultsContainer = document.getElementById('wordnet-results');
        
        // Show loading
        resultsContainer.innerHTML = `
            <div class="ai-loading">
                <i class="fas fa-spinner"></i>
                <p>Word Net Agent analyzing "${word}"...</p>
            </div>
        `;

        try {
            const relations = await this.wordNetAgent.getWordRelations(word);
            this.displayWordNetResults(word, relations);
        } catch (error) {
            console.error('Error analyzing word:', error);
            resultsContainer.innerHTML = `
                <div class="ai-empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to analyze word. Please try again.</p>
                </div>
            `;
        }
    }

    displayWordNetResults(word, relations) {
        const resultsContainer = document.getElementById('wordnet-results');
        
        resultsContainer.innerHTML = `
            <div class="wordnet-results">
                <div class="wordnet-section">
                    <h3><i class="fas fa-equals"></i> Synonyms</h3>
                    <div class="word-tags">
                        ${relations.synonyms.length > 0 
                            ? relations.synonyms.map(w => `<span class="word-tag">${w}</span>`).join('')
                            : '<p class="no-results">No synonyms found</p>'}
                    </div>
                </div>

                <div class="wordnet-section">
                    <h3><i class="fas fa-not-equal"></i> Antonyms</h3>
                    <div class="word-tags">
                        ${relations.antonyms.length > 0 
                            ? relations.antonyms.map(w => `<span class="word-tag">${w}</span>`).join('')
                            : '<p class="no-results">No antonyms found</p>'}
                    </div>
                </div>

                <div class="wordnet-section">
                    <h3><i class="fas fa-music"></i> Rhyming Words</h3>
                    <div class="word-tags">
                        ${relations.rhymes.length > 0 
                            ? relations.rhymes.map(w => `<span class="word-tag">${w}</span>`).join('')
                            : '<p class="no-results">No rhyming words found</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    async startWordClueQuiz(word) {
        const resultsContainer = document.getElementById('wordclue-results');
        
        // Show loading
        resultsContainer.innerHTML = `
            <div class="ai-loading">
                <i class="fas fa-spinner"></i>
                <p>Word Clue Agent generating quiz for "${word}"...</p>
            </div>
        `;

        try {
            const quiz = await this.wordClueAgent.generateQuiz(word);
            this.quizData = quiz;
            this.resetQuiz();
            this.displayQuizQuestion(0);
        } catch (error) {
            console.error('Error generating quiz:', error);
            resultsContainer.innerHTML = `
                <div class="ai-empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to generate quiz. Please try again.</p>
                </div>
            `;
        }
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
    }

    displayQuizQuestion(index) {
        const resultsContainer = document.getElementById('wordclue-results');
        
        if (index >= this.quizData.questions.length) {
            this.displayQuizResults();
            return;
        }

        const question = this.quizData.questions[index];
        
        resultsContainer.innerHTML = `
            <div class="wordclue-container">
                <div class="quiz-header-section">
                    <div class="quiz-progress-info">
                        Question ${index + 1} of 5
                    </div>
                    <div class="quiz-score-info">
                        Score: ${this.score}/5
                    </div>
                </div>

                <div class="quiz-question-card">
                    <h3>${question.question}</h3>
                    <div class="quiz-options-list">
                        ${question.options.map(option => `
                            <button class="quiz-option-btn" data-answer="${this.escapeHtml(option)}">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback-box" style="display: none;"></div>
                </div>
            </div>
        `;

        // Add event listeners to options
        const options = resultsContainer.querySelectorAll('.quiz-option-btn');
        options.forEach(option => {
            option.addEventListener('click', () => {
                this.handleQuizAnswer(option, question, index);
            });
        });
    }

    handleQuizAnswer(selectedOption, question, currentIndex) {
        const allOptions = document.querySelectorAll('.quiz-option-btn');
        const feedback = document.querySelector('.quiz-feedback-box');
        const selectedAnswer = selectedOption.getAttribute('data-answer');
        const isCorrect = selectedAnswer === question.correctAnswer;

        // Disable all options
        allOptions.forEach(opt => opt.disabled = true);

        // Highlight correct/incorrect
        if (isCorrect) {
            selectedOption.classList.add('correct');
            this.score++;
            feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct! Well done!';
            feedback.className = 'quiz-feedback-box correct';
        } else {
            selectedOption.classList.add('incorrect');
            // Highlight the correct answer
            allOptions.forEach(opt => {
                if (opt.getAttribute('data-answer') === question.correctAnswer) {
                    opt.classList.add('correct');
                }
            });
            feedback.innerHTML = `<i class="fas fa-times-circle"></i> Incorrect. The correct answer is: <strong>${question.correctAnswer}</strong>`;
            feedback.className = 'quiz-feedback-box incorrect';
        }

        feedback.style.display = 'block';

        // Update score in header
        const scoreDisplay = document.querySelector('.quiz-score-info');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${this.score}/5`;
        }

        // Show next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'quiz-next-button';
        
        if (currentIndex < this.quizData.questions.length - 1) {
            nextBtn.innerHTML = 'Next Question <i class="fas fa-arrow-right"></i>';
            nextBtn.addEventListener('click', () => {
                this.displayQuizQuestion(currentIndex + 1);
            });
        } else {
            nextBtn.innerHTML = 'See Results <i class="fas fa-trophy"></i>';
            nextBtn.addEventListener('click', () => {
                this.displayQuizResults();
            });
        }
        
        feedback.appendChild(nextBtn);
    }

    displayQuizResults() {
        const resultsContainer = document.getElementById('wordclue-results');
        const percentage = (this.score / 5) * 100;

        let message = '';
        let emoji = '';
        
        if (percentage === 100) {
            message = 'Perfect! You\'re a word master!';
            emoji = '🏆';
        } else if (percentage >= 80) {
            message = 'Excellent work!';
            emoji = '🌟';
        } else if (percentage >= 60) {
            message = 'Good job! Keep practicing!';
            emoji = '👍';
        } else {
            message = 'Keep learning and try again!';
            emoji = '📚';
        }

        resultsContainer.innerHTML = `
            <div class="quiz-results-card">
                <div class="results-emoji-large">${emoji}</div>
                <h2>${message}</h2>
                <div class="results-score-display">
                    <div class="score-circle-large">
                        <span class="score-text-large">${this.score}/5</span>
                    </div>
                    <p class="score-percentage-large">${percentage}%</p>
                </div>
                <button class="restart-quiz-button">
                    <i class="fas fa-redo"></i> Retake Quiz
                </button>
            </div>
        `;

        const restartBtn = resultsContainer.querySelector('.restart-quiz-button');
        restartBtn.addEventListener('click', () => {
            this.resetQuiz();
            this.displayQuizQuestion(0);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Word Net Agent - Synonyms, Antonyms, Rhymes
class WordNetAgent {
    constructor() {
        this.apiBase = 'https://api.datamuse.com/words';
    }

    async getWordRelations(word) {
        try {
            const [synonyms, antonyms, rhymes] = await Promise.all([
                this.getSynonyms(word),
                this.getAntonyms(word),
                this.getRhymes(word)
            ]);

            return {
                synonyms: synonyms.slice(0, 10),
                antonyms: antonyms.slice(0, 10),
                rhymes: rhymes.slice(0, 10)
            };
        } catch (error) {
            console.error('Error fetching word relations:', error);
            return {
                synonyms: [],
                antonyms: [],
                rhymes: []
            };
        }
    }

    async getSynonyms(word) {
        try {
            const response = await fetch(`${this.apiBase}?rel_syn=${word}&max=10`);
            const data = await response.json();
            return data.map(item => item.word);
        } catch (error) {
            console.error('Error fetching synonyms:', error);
            return [];
        }
    }

    async getAntonyms(word) {
        try {
            const response = await fetch(`${this.apiBase}?rel_ant=${word}&max=10`);
            const data = await response.json();
            return data.map(item => item.word);
        } catch (error) {
            console.error('Error fetching antonyms:', error);
            return [];
        }
    }

    async getRhymes(word) {
        try {
            const response = await fetch(`${this.apiBase}?rel_rhy=${word}&max=10`);
            const data = await response.json();
            return data.map(item => item.word);
        } catch (error) {
            console.error('Error fetching rhymes:', error);
            return [];
        }
    }
}

// Word Clue Agent - Quiz Generation
class WordClueAgent {
    constructor() {
        this.templates = [
            {
                type: 'definition',
                generator: (wordData) => this.generateDefinitionQuestion(wordData)
            },
            {
                type: 'usage',
                generator: (wordData) => this.generateUsageQuestion(wordData)
            },
            {
                type: 'synonym',
                generator: (wordData) => this.generateSynonymQuestion(wordData)
            },
            {
                type: 'context',
                generator: (wordData) => this.generateContextQuestion(wordData)
            },
            {
                type: 'blank',
                generator: (wordData) => this.generateBlankQuestion(wordData)
            }
        ];
    }

    async generateQuiz(word) {
        try {
            // Fetch word data from dictionary API
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) throw new Error('Word not found');
            
            const data = await response.json();
            const wordData = {
                word: data[0].word,
                meanings: data[0].meanings,
                phonetic: data[0].phonetic || ''
            };

            // Generate 5 questions
            const questions = [];
            const usedTypes = new Set();

            for (let i = 0; i < 5; i++) {
                let template;
                let attempts = 0;
                
                // Try to get a unique question type
                do {
                    template = this.templates[Math.floor(Math.random() * this.templates.length)];
                    attempts++;
                } while (usedTypes.has(template.type) && attempts < 10);
                
                usedTypes.add(template.type);
                
                const question = await template.generator(wordData);
                questions.push({
                    ...question,
                    type: template.type
                });
            }

            return {
                word: wordData.word,
                questions: questions
            };
        } catch (error) {
            console.error('Error generating quiz:', error);
            return this.generateFallbackQuiz(word);
        }
    }

    generateDefinitionQuestion(wordData) {
        const correctDef = wordData.meanings[0].definitions[0].definition;
        const options = [correctDef];
        
        // Generate plausible wrong answers
        const wrongDefs = [
            `A type of ${wordData.meanings[0].partOfSpeech} that is rarely used in modern language`,
            `Something related to ancient ${wordData.word.slice(0, 3)} terminology`,
            `An old-fashioned term for everyday objects or concepts`
        ];
        
        wrongDefs.forEach(def => {
            if (options.length < 4) options.push(def);
        });
        
        return {
            question: `What is the best definition of "${wordData.word}"?`,
            options: this.shuffleArray(options),
            correctAnswer: correctDef
        };
    }

    generateUsageQuestion(wordData) {
        const word = wordData.word;
        const example = wordData.meanings[0].definitions[0].example || 
                       `The ${word} was quite impressive to observe.`;
        
        const options = [
            example,
            `I went to the store yesterday to buy some ${word}.`,
            `The color of the ${word} is blue and green today.`,
            `Yesterday, I ${word}ed for several hours straight.`
        ];
        
        return {
            question: `Which sentence correctly uses "${word}"?`,
            options: this.shuffleArray(options),
            correctAnswer: example
        };
    }

    async generateSynonymQuestion(wordData) {
        const word = wordData.word;
        
        try {
            const response = await fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=10`);
            const synonyms = await response.json();
            
            if (synonyms.length > 0) {
                const correctAnswer = synonyms[0].word;
                const options = [correctAnswer];
                
                // Add some random words as wrong answers
                const wrongWords = ['happy', 'computer', 'mountain', 'quick', 'bright', 'small', 'difficult', 'ancient'];
                const filtered = wrongWords.filter(w => w !== correctAnswer && w !== word);
                
                while (options.length < 4 && filtered.length > 0) {
                    const randomIndex = Math.floor(Math.random() * filtered.length);
                    options.push(filtered.splice(randomIndex, 1)[0]);
                }
                
                return {
                    question: `Which word is a synonym of "${word}"?`,
                    options: this.shuffleArray(options),
                    correctAnswer: correctAnswer
                };
            }
        } catch (error) {
            console.error('Error in synonym question:', error);
        }
        
        // Fallback
        return {
            question: `Which word is closest in meaning to "${word}"?`,
            options: this.shuffleArray(['similar', 'different', 'opposite', 'unrelated']),
            correctAnswer: 'similar'
        };
    }

    generateContextQuestion(wordData) {
        const word = wordData.word;
        const partOfSpeech = wordData.meanings[0].partOfSpeech;
        
        const contexts = {
            noun: [
                `When describing a physical object or concept`,
                `In a formal scientific research paper`,
                `During casual everyday conversation`,
                `In a professional business letter`
            ],
            verb: [
                `When describing an action or process`,
                `In a detailed cooking recipe`,
                `During live sports commentary`,
                `In a formal legal document`
            ],
            adjective: [
                `When describing a quality or characteristic`,
                `In a detailed product review`,
                `In a weather forecast report`,
                `In creative poetry or literature`
            ]
        };
        
        const contextOptions = contexts[partOfSpeech] || contexts.noun;
        const correctAnswer = contextOptions[0];
        
        return {
            question: `In which context would "${word}" be most appropriate?`,
            options: this.shuffleArray(contextOptions),
            correctAnswer: correctAnswer
        };
    }

    generateBlankQuestion(wordData) {
        const word = wordData.word;
        const sentence = `The _____ was quite remarkable in that particular situation.`;
        
        const options = [
            word,
            word + 's',
            'situation',
            'moment'
        ];
        
        return {
            question: `Fill in the blank: "${sentence.replace('_____', '...')}"`,
            options: this.shuffleArray(options),
            correctAnswer: word
        };
    }

    generateFallbackQuiz(word) {
        return {
            word: word,
            questions: [
                {
                    question: `What type of word is "${word}"?`,
                    options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
                    correctAnswer: 'Noun'
                },
                {
                    question: `How would you use "${word}" in a sentence?`,
                    options: [
                        `The ${word} was impressive`,
                        `I ${word} every day`,
                        `Very ${word} indeed`,
                        `${word}ly speaking`
                    ],
                    correctAnswer: `The ${word} was impressive`
                },
                {
                    question: `Which context best suits "${word}"?`,
                    options: ['Formal writing', 'Casual conversation', 'Technical documentation', 'Poetic expression'],
                    correctAnswer: 'Formal writing'
                },
                {
                    question: `"${word}" is most commonly used as a:`,
                    options: ['Descriptor', 'Action word', 'Object or thing', 'Connector'],
                    correctAnswer: 'Object or thing'
                },
                {
                    question: `The word "${word}" is best described as:`,
                    options: ['Common everyday word', 'Rare or uncommon', 'Technical jargon', 'Archaic or old-fashioned'],
                    correctAnswer: 'Common everyday word'
                }
            ]
        };
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize AI System when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing AI Agent System...");
    
    const aiSystem = new AIAgentSystem();
    
    // Make it globally accessible
    window.aiSystem = aiSystem;
    
    console.log("AI Agent System ready!");
});