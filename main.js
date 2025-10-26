console.log("JS file loaded!");
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded"); // Debug message
    
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
        
        themeToggleBtn.addEventListener('click', toggleTheme);
        
        
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
        }
    } else {
        console.error("Theme toggle button not found");
    }
    
    const navItems = document.querySelectorAll('nav ul li');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log("Nav item clicked:", this.getAttribute('data-page'));
            const targetPage = this.getAttribute('data-page');
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            pages.forEach(page => page.classList.remove('active'));
            const targetElement = document.getElementById(targetPage);
            if (targetElement) {
                targetElement.classList.add('active');
                if (targetPage === 'reports') {
                    updateReports();
                }
            } else {
                console.error(`Target page ${targetPage} not found`);
            }
        });
    });
    const subNavButtons = document.querySelectorAll('.sub-nav button');
    
    subNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("Sub-nav button clicked:", this.getAttribute('data-subpage'));
            const parentSection = this.closest('section');
            const targetSubpage = this.getAttribute('data-subpage');
            const subNavs = parentSection.querySelectorAll('.sub-nav button');
            subNavs.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const subpages = parentSection.querySelectorAll('.subpage');
            subpages.forEach(subpage => subpage.classList.remove('active'));
            
            const targetElement = parentSection.querySelector('#' + targetSubpage);
            if (targetElement) {
                targetElement.classList.add('active');
            } else {
                console.error(`Target subpage ${targetSubpage} not found`);
            }
        });
    });
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    
    if (!searchInput || !searchButton) {
        console.error("Search elements not found");
    } else {
        async function searchWord(word) {
            try {
                console.log("Searching for word:", word);
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (!response.ok) throw new Error('Word not found');
                const data = await response.json();
                console.log("API response:", data);
                
                if (data && data[0] && data[0].meanings && data[0].meanings[0]) {
                    return {
                        word: data[0].word,
                        type: data[0].meanings[0].partOfSpeech || 'unknown',
                        definition: data[0].meanings[0].definitions[0].definition || 'No definition found',
                        example: data[0].meanings[0].definitions[0].example || `Example of ${data[0].word} usage.`
                    };
                } else {
                    console.error("Invalid API response structure");
                    return null;
                }
            } catch (error) {
                console.error('Error fetching word:', error);
                return null;
            }
        }
        
        searchButton.addEventListener('click', async function() {
            const word = searchInput.value.trim();
            if (word) {
                const wordData = await searchWord(word);
                if (wordData) {
                    if (!wordList.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) {
                        wordList.push(wordData);
                        saveWordList();
                        addPointsForLearning(wordData.word);
                        updateWordList();
                    }
                    
                    document.querySelector('nav ul li[data-page="learn"]').click();
                    currentWordIndex = wordList.findIndex(w => w.word.toLowerCase() === wordData.word.toLowerCase());
                    updateWordCard();
                } else {
                    alert("Word not found. Please try another word.");
                }
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
    
    let userPoints = parseInt(localStorage.getItem('userPoints') || '0');
    
    function updatePoints() {
        const pointsElement = document.getElementById('total-points');
        if (pointsElement) {
            pointsElement.textContent = userPoints;
        }
        
        const beginnerProgress = Math.min(userPoints, 100);
        const intermediateProgress = userPoints > 100 ? Math.min(userPoints - 100, 100) : 0;
        const advancedProgress = userPoints > 200 ? Math.min(userPoints - 200, 100) : 0;
        
        const beginnerProgressBar = document.getElementById('beginner-progress');
        const beginnerPercentage = document.getElementById('beginner-percentage');
        if (beginnerProgressBar) beginnerProgressBar.style.width = `${beginnerProgress}%`;
        if (beginnerPercentage) beginnerPercentage.textContent = beginnerProgress;
        
        const intermediateCard = document.getElementById('intermediate-level');
        const intermediateProgressBar = document.getElementById('intermediate-progress');
        const intermediatePercentage = document.getElementById('intermediate-percentage');
        
        if (userPoints >= 100 && intermediateCard) {
            intermediateCard.classList.remove('locked');
            if (intermediateProgressBar) intermediateProgressBar.style.width = `${intermediateProgress}%`;
            if (intermediatePercentage) intermediatePercentage.textContent = intermediateProgress;
            
            const intermediateBtn = intermediateCard.querySelector('button');
            if (intermediateBtn) {
                intermediateBtn.classList.remove('locked-btn');
                intermediateBtn.innerHTML = 'Continue';
                intermediateBtn.classList.add('continue-btn');
            }
        }
        
        const advancedCard = document.getElementById('advanced-level');
        const advancedProgressBar = document.getElementById('advanced-progress');
        const advancedPercentage = document.getElementById('advanced-percentage');
        
        if (userPoints >= 200 && advancedCard) {
            advancedCard.classList.remove('locked');
            if (advancedProgressBar) advancedProgressBar.style.width = `${advancedProgress}%`;
            if (advancedPercentage) advancedPercentage.textContent = advancedProgress;
            
            const advancedBtn = advancedCard.querySelector('button');
            if (advancedBtn) {
                advancedBtn.classList.remove('locked-btn');
                advancedBtn.innerHTML = 'Continue';
                advancedBtn.classList.add('continue-btn');
            }
        }
        
        saveUserPoints();
    }
    
    function addPointsForLearning(word) {
        userPoints += 5;
        updatePoints();
        
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `<p>+5 points for learning "${word}"!</p>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
    
    function saveUserPoints() {
        localStorage.setItem('userPoints', userPoints.toString());
    }
    
    let wordList = JSON.parse(localStorage.getItem('wordList')) || [
        {
            word: 'Ephemeral',
            type: 'adjective',
            definition: 'Lasting for a very short time.',
            example: 'The beauty of cherry blossoms is ephemeral, lasting only a few days.'
        },
        {
            word: 'Ubiquitous',
            type: 'adjective',
            definition: 'Present, appearing, or found everywhere.',
            example: 'Mobile phones have become ubiquitous in modern society.'
        },
        {
            word: 'Serendipity',
            type: 'noun',
            definition: 'The occurrence of events by chance in a happy or beneficial way.',
            example: 'The discovery of penicillin was a serendipity, as it was accidentally found by Alexander Fleming.'
        },
        {
            word: 'Eloquent',
            type: 'adjective',
            definition: 'Fluent or persuasive in speaking or writing.',
            example: 'Her eloquent speech moved the entire audience.'
        },
        {
            word: 'Mellifluous',
            type: 'adjective',
            definition: 'Sweet or musical; pleasant to hear.',
            example: 'The mellifluous tones of the flute filled the concert hall.'
        }
    ];
    
    function saveWordList() {
        localStorage.setItem('wordList', JSON.stringify(wordList));
    }
    
    let currentWordIndex = 0;
    
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (wordList.length > 0) {
                currentWordIndex = (currentWordIndex + 1) % wordList.length;
                updateWordCard();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (wordList.length > 0) {
                currentWordIndex = (currentWordIndex - 1 + wordList.length) % wordList.length;
                updateWordCard();
            }
        });
    }
    
    function updateWordCard() {
        if (wordList.length === 0) return;
        
        const wordCard = document.querySelector('.word-card');
        if (!wordCard) {
            console.error("Word card not found");
            return;
        }
        
        const currentWord = wordList[currentWordIndex];
        
        const wordTitle = wordCard.querySelector('h2');
        const wordType = wordCard.querySelector('.word-type');
        const wordDefinition = wordCard.querySelector('.word-definition');
        const wordExample = wordCard.querySelector('.word-examples p em');
        
        if (wordTitle) wordTitle.textContent = currentWord.word;
        if (wordType) wordType.textContent = currentWord.type;
        if (wordDefinition) wordDefinition.textContent = currentWord.definition;
        if (wordExample) wordExample.textContent = currentWord.example;
        
        const favoriteBtn = wordCard.querySelector('.favorite-btn i');
        if (favoriteBtn) {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favoriteBtn.className = favorites.includes(currentWord.word) ? 'fas fa-heart' : 'far fa-heart';
        }
    }
    
    document.querySelectorAll('.pronunciation-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const word = this.closest('.word-item')?.querySelector('h3')?.textContent || 
                          this.closest('.word-header')?.querySelector('h2')?.textContent;
            if (word) speakWord(word);
        });
    });
    
    function speakWord(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    }
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            
            const word = this.closest('.word-header')?.querySelector('h2')?.textContent ||
                         this.closest('.word-item')?.querySelector('h3')?.textContent;
            if (word) toggleFavorite(word);
        });
    });
    
    function toggleFavorite(word) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.includes(word)) {
            favorites = favorites.filter(w => w !== word);
        } else {
            favorites.push(word);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
    }
    
    function updateWordList() {
        const savedContainer = document.getElementById('saved-words-list');
        if (!savedContainer) {
            console.error("Saved words container not found");
            return;
        }
        
        savedContainer.innerHTML = '';
        
        wordList.forEach(wordItem => {
            savedContainer.innerHTML += `
                <div class="word-item">
                    <div class="word-info">
                        <h3>${wordItem.word}</h3>
                        <p>${wordItem.definition}</p>
                    </div>
                    <div class="word-actions">
                        <button class="pronunciation-btn"><i class="fas fa-volume-up"></i></button>
                        <button class="favorite-btn"><i class="${isFavorite(wordItem.word) ? 'fas' : 'far'} fa-heart"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        
        addWordListEventListeners();
        
        updateReports();
    }
    
    function updateFavoritesList() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoritesContainer = document.getElementById('favorite-words-list');
        if (!favoritesContainer) {
            console.error("Favorites container not found");
            return;
        }
        
        favoritesContainer.innerHTML = '';
        
        favorites.forEach(favWord => {
            const wordData = wordList.find(w => w.word === favWord);
            if (wordData) {
                favoritesContainer.innerHTML += `
                    <div class="word-item">
                        <div class="word-info">
                            <h3>${wordData.word}</h3>
                            <p>${wordData.definition}</p>
                        </div>
                        <div class="word-actions">
                            <button class="pronunciation-btn"><i class="fas fa-volume-up"></i></button>
                            <button class="favorite-btn"><i class="fas fa-heart"></i></button>
                            <button class="delete-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            }
        });
        
        addWordListEventListeners();
        
        updateReports();
    }
    
    function isFavorite(word) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.includes(word);
    }
    
    function addWordListEventListeners() {
        document.querySelectorAll('.word-item .pronunciation-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const word = this.closest('.word-item').querySelector('h3').textContent;
                speakWord(word);
            });
        });
        
        document.querySelectorAll('.word-item .favorite-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const word = this.closest('.word-item').querySelector('h3').textContent;
                toggleFavorite(word);
                this.querySelector('i').classList.toggle('far');
                this.querySelector('i').classList.toggle('fas');
            });
        });
        
        document.querySelectorAll('.word-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const word = this.closest('.word-item').querySelector('h3').textContent;
                deleteWord(word);
            });
        });
    }
    
    function deleteWord(word) {
        
        wordList = wordList.filter(w => w.word !== word);
        saveWordList();
        
        
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(w => w !== word);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        updateWordList();
        updateFavoritesList();
        if (wordList.length > 0) {
            currentWordIndex = Math.min(currentWordIndex, wordList.length - 1);
            updateWordCard();
        }
        
        updateReports();
    }
    
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const word = this.closest('.word-header')?.querySelector('h2')?.textContent;
            const definition = this.closest('.word-card')?.querySelector('.word-definition')?.textContent;
            
            if (word && definition) {
                if (navigator.share) {
                    navigator.share({
                        title: 'VocabBoost: ' + word,
                        text: word + ': ' + definition,
                        url: window.location.href
                    })
                    .catch(error => console.log('Error sharing:', error));
                } else {
                    alert('Share functionality is not supported in your browser.');
                }
            }
        });
    });
    
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            if (answer && icon) {
                const isOpen = answer.style.display === 'block';
                answer.style.display = isOpen ? 'none' : 'block';
                icon.className = isOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
        });
    });
    
    let currentRating = 0;
    const ratingStars = document.querySelectorAll('.rating i');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-rating'));
            
            ratingStars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                s.className = starRating <= currentRating ? 'fas fa-star' : 'far fa-star';
            });
            
            const ratingInput = document.getElementById('rating-value');
            if (ratingInput) {
                ratingInput.value = currentRating;
            }
        });
    });
    
    let barChart = null;
    let pieChart = null;
    
    function initializeCharts() {
        const barCanvas = document.getElementById('wordBarChart');
        const pieCanvas = document.getElementById('categoryPieChart');
        
        if (!barCanvas || !pieCanvas) {
            console.error("Chart canvases not found");
            return;
        }
        
        try {
            
            const newWordsCount = wordList.length;
            const favoritesCount = (JSON.parse(localStorage.getItem('favorites')) || []).length;
            const savedWordsCount = wordList.length; // This is technically the same as newWordsCount in this app
            
            
            const wordTypes = {
                noun: 0,
                verb: 0,
                adjective: 0,
                adverb: 0,
                others: 0
            };
            
            wordList.forEach(word => {
                const type = word.type.toLowerCase();
                if (type.includes('noun')) {
                    wordTypes.noun++;
                } else if (type.includes('verb')) {
                    wordTypes.verb++;
                } else if (type.includes('adj')) {
                    wordTypes.adjective++;
                } else if (type.includes('adv')) {
                    wordTypes.adverb++;
                } else {
                    wordTypes.others++;
                }
            });
            
            
            const barCtx = barCanvas.getContext('2d');
            barChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: ['New Words', 'Favorites', 'Saved Words'],
                    datasets: [{
                        label: 'Number of Words',
                        data: [newWordsCount, favoritesCount, savedWordsCount],
                        backgroundColor: [
                            '#6a0dad',
                            '#9932cc',
                            '#8a2be2'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Words'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Word Categories'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.raw + ' words';
                                }
                            }
                        }
                    }
                }
            });
            
        
            const pieCtx = pieCanvas.getContext('2d');
            pieChart = new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: ['Nouns', 'Verbs', 'Adjectives', 'Adverbs', 'Others'],
                    datasets: [{
                        data: [
                            wordTypes.noun,
                            wordTypes.verb,
                            wordTypes.adjective,
                            wordTypes.adverb,
                            wordTypes.others
                        ],
                        backgroundColor: [
                            '#ff6b6b',
                            '#4ecdc4',
                            '#ffd166',
                            '#06d6a0',
                            '#118ab2'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value * 100) / total) + '%';
                                    return label + ': ' + value + ' (' + percentage + ')';
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error initializing charts:", error);
        }
    }
    
    function updateReports() {
        if (barChart) {
            barChart.destroy();
        }
        if (pieChart) {
            pieChart.destroy();
        }
        
        initializeCharts();
    }
    
    
    let feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || [];
    const feedbackForm = document.getElementById('feedback-form');
    
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const feedback = document.getElementById('feedback-text').value;
            
            const newFeedback = {
                id: Date.now(),
                name,
                email,
                feedback,
                rating: currentRating,
                date: new Date().toLocaleDateString()
            };
            
            feedbackData.push(newFeedback);
            localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
            
            alert('Thank you for your feedback!');
            feedbackForm.reset();
            
            currentRating = 0;
            ratingStars.forEach(star => {
                star.className = 'far fa-star';
            });
            
            updateFeedbackList();
        });
    }
    
    function updateFeedbackList() {
        const feedbackList = document.getElementById('feedback-list');
        if (!feedbackList) {
            console.error("Feedback list container not found");
            return;
        }
        
        feedbackList.innerHTML = '<h3>Submitted Feedback</h3>';
        
        feedbackData.forEach(item => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';
            feedbackItem.innerHTML = `
                <div class="feedback-header">
                    <h4>${item.name}</h4>
                    <span class="feedback-date">${item.date}</span>
                </div>
                <div class="feedback-rating">
                    ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
                </div>
                <p class="feedback-content">${item.feedback}</p>
                <div class="feedback-footer">
                    <span>${item.email}</span>
                    <button class="delete-feedback" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            feedbackList.appendChild(feedbackItem);
        });
        
        document.querySelectorAll('.delete-feedback').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteFeedback(id);
            });
        });
    }
    
    function deleteFeedback(id) {
        feedbackData = feedbackData.filter(item => item.id !== id);
        localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
        updateFeedbackList();
    }

    try {
        updatePoints();
        updateWordCard();
        updateWordList();
        updateFavoritesList();
        updateFeedbackList();
        initializeCharts();
    } catch (error) {
        console.error("Error initializing app:", error);
    }
});