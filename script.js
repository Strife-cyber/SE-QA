/**
 * Exam Preparation Application
 * 
 * This script powers an interactive exam preparation tool that supports quizzes, flashcards,
 * subject and topic management, content management, and progress tracking.
 * Data is loaded from a `data.json` file (from initialize-data.js), and the "pratique" question
 * type is supported (from script.js).
 * 
 * Features:
 * - Fetch-based data loading from JSON
 * - Quiz with multiple-choice, true-false, short-answer, and pratique questions
 * - Flashcard system with known/review marking
 * - Subject and topic creation/management
 * - Content management (add/edit/delete questions and flashcards)
 * - Progress tracking with session history and topic stats
 * - Import/export functionality
 * - LocalStorage for state persistence
 * 
 * Dependencies:
 * - data.json (for initial data)
 * - HTML with matching IDs/classes
 * - Font Awesome for icons
 * - Prism.js for code highlighting (pratique questions)
 * - CSS for styling
 */

/**
 * Global Data Structures
 */
let subjectsData = {}; // Stores all subjects, topics, quizData, and flashcardData

let currentState = {
    currentSubject: "computer-io", // Default subject ID
    quiz: {
        currentQuestionIndex: 0, // Current question index in filteredQuestions
        selectedQuestionType: "all", // Filter: all, multiple-choice, true-false, short-answer, pratique
        selectedTopic: "all", // Filter: all or specific topic ID
        filteredQuestions: [], // Filtered questions based on type/topic
        selectedOption: null, // Selected option index for multiple-choice/true-false
        shortAnswer: "", // User input for short-answer/pratique
        answeredQuestions: {}, // Per-subject: [{id, isCorrect, topic}]
        correctAnswers: {}, // Per-subject: number of correct answers
    },
    flashcards: {
        currentCardIndex: 0, // Current flashcard index
        selectedTopic: "all", // Filter: all or specific topic ID
        filteredCards: [], // Filtered flashcards based on topic
        knownCards: {}, // Per-subject: [card IDs marked as known]
        reviewCards: {}, // Per-subject: [card IDs marked for review]
    },
    progress: {
        sessions: {}, // Per-subject: [{date, questionsAnswered, correctAnswers, accuracy}]
    },
};

/**
 * DOM Elements
 * All referenced HTML elements are cached for performance
 */
const tabButtons = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const subjectSelect = document.getElementById("subject-select");
const addSubjectBtn = document.getElementById("add-subject-btn");
const importDataBtn = document.getElementById("import-data-btn");
const exportDataBtn = document.getElementById("export-data-btn");
const importFileInput = document.getElementById("import-file");
const addTopicBtn = document.getElementById("add-topic-btn");
const addFlashcardTopicBtn = document.getElementById("add-flashcard-topic-btn");
const subjectModal = document.getElementById("subject-modal");
const topicModal = document.getElementById("topic-modal");
const newSubjectNameInput = document.getElementById("new-subject-name");
const newSubjectDescInput = document.getElementById("new-subject-description");
const saveSubjectBtn = document.getElementById("save-subject-btn");
const newTopicNameInput = document.getElementById("new-topic-name");
const newTopicDescInput = document.getElementById("new-topic-description");
const saveTopicBtn = document.getElementById("save-topic-btn");
const closeModalBtns = document.querySelectorAll(".close-modal");
const contentTypeBtns = document.querySelectorAll(".content-type-btn");
const addQuestionForm = document.getElementById("add-question-form");
const addFlashcardForm = document.getElementById("add-flashcard-form");
const questionTypeSelect = document.getElementById("question-type-select");
const questionTopicSelect = document.getElementById("question-topic-select");
const questionTextInput = document.getElementById("question-text-input");
const optionsInputContainer = document.getElementById("options-input-container");
const optionsList = document.getElementById("options-list");
const addOptionBtn = document.getElementById("add-option-btn");
const correctAnswerSelect = document.getElementById("correct-answer-select");
const keywordsContainer = document.getElementById("keywords-container");
const keywordsInput = document.getElementById("keywords-input");
const explanationInput = document.getElementById("explanation-input");
const saveQuestionBtn = document.getElementById("save-question-btn");
const flashcardTopicInput = document.getElementById("flashcard-topic-input");
const flashcardFrontInput = document.getElementById("flashcard-front-input");
const flashcardBackInput = document.getElementById("flashcard-back-input");
const saveFlashcardBtn = document.getElementById("save-flashcard-btn");
const filterContentType = document.getElementById("filter-content-type");
const filterContentTopic = document.getElementById("filter-content-topic");
const contentSearch = document.getElementById("content-search");
const contentList = document.getElementById("content-list");
const questionTypeSelectElement = document.getElementById("question-type");
const topicSelectElement = document.getElementById("topic-select");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const shortAnswerContainer = document.getElementById("short-answer-container");
const shortAnswerInput = document.getElementById("short-answer");
const checkAnswerButton = document.getElementById("check-answer");
const nextQuestionButton = document.getElementById("next-question");
const feedbackElement = document.getElementById("feedback");
const currentQuestionElement = document.getElementById("current-question");
const totalQuestionsElement = document.getElementById("total-questions");
const progressFill = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");
const flashcardTopicSelectElement = document.getElementById("flashcard-topic-select");
const prevFlashcardButton = document.getElementById("prev-flashcard");
const nextFlashcardButton = document.getElementById("next-flashcard");
const flashcardCounter = document.getElementById("flashcard-counter");
const currentFlashcard = document.getElementById("current-flashcard");
const flashcardFrontText = document.getElementById("flashcard-front-text");
const flashcardBackText = document.getElementById("flashcard-back-text");
const markKnownButton = document.getElementById("mark-known");
const markReviewButton = document.getElementById("mark-review");
const totalAnsweredElement = document.getElementById("total-answered");
const totalCorrectElement = document.getElementById("total-correct");
const accuracyElement = document.getElementById("accuracy");
const topicStatsElement = document.getElementById("topic-stats");
const historyTableBody = document.getElementById("history-table-body");
const performanceChart = document.getElementById("performance-chart");

// Declare functions as variables for binding
let loadQuestion, loadFlashcard, prevFlashcard, nextFlashcard;

/**
 * Initialize Data from JSON
 * Loads subjectsData from data.json and initializes state for each subject
 */
async function initializeData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid JSON format');
        }
        subjectsData = data;

        // Initialize state for each subject
        Object.keys(subjectsData).forEach((subjectId) => {
            if (!currentState.quiz.answeredQuestions[subjectId]) {
                currentState.quiz.answeredQuestions[subjectId] = [];
            }
            if (!currentState.quiz.correctAnswers[subjectId]) {
                currentState.quiz.correctAnswers[subjectId] = 0;
            }
            if (!currentState.flashcards.knownCards[subjectId]) {
                currentState.flashcards.knownCards[subjectId] = [];
            }
            if (!currentState.flashcards.reviewCards[subjectId]) {
                currentState.flashcards.reviewCards[subjectId] = [];
            }
            if (!currentState.progress.sessions[subjectId]) {
                currentState.progress.sessions[subjectId] = [];
            }
        });
    } catch (error) {
        console.error('Failed to load data.json:', error);
        alert('Erreur lors du chargement des données. Utilisation des données locales si disponibles.');
    }
}

/**
 * Initialize Application
 * Asynchronous initialization to ensure data is loaded before setup
 */
async function init() {
    await initializeData();
    loadState();
    populateSubjectSelector();
    setupEventListeners();
    updateTopicSelectors();
    filterQuestions();
    loadQuestionFunc();
    filterFlashcards();
    loadFlashcardFunc();
    updateProgressDisplay();
    updateStats();
    setupContentManagement();
}

/**
 * Populate Subject Selector
 * Fills the subject dropdown with available subjects
 */
function populateSubjectSelector() {
    subjectSelect.innerHTML = '<option value="">Sélectionner un sujet</option>';
    Object.keys(subjectsData).forEach((subjectId) => {
        const option = document.createElement("option");
        option.value = subjectId;
        option.textContent = subjectsData[subjectId].name;
        subjectSelect.appendChild(option);
    });
    subjectSelect.value = currentState.currentSubject || Object.keys(subjectsData)[0] || "";
    if (subjectSelect.value) {
        currentState.currentSubject = subjectSelect.value;
    }
}

/**
 * Setup All Event Listeners
 * Handles tabs, subject changes, modals, and quiz/flashcard interactions
 */
function setupEventListeners() {
    // Tab Switching
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            tabContents.forEach((content) => {
                content.classList.remove("active");
                if (content.id === button.getAttribute("data-tab")) {
                    content.classList.add("active");
                }
            });
        });
    });

    // Subject Change
    subjectSelect.addEventListener("change", () => {
        if (!subjectSelect.value) return;
        currentState.currentSubject = subjectSelect.value;
        currentState.quiz.currentQuestionIndex = 0;
        currentState.quiz.selectedTopic = "all";
        currentState.flashcards.currentCardIndex = 0;
        currentState.flashcards.selectedTopic = "all";
        updateTopicSelectors();
        topicSelectElement.value = "all";
        flashcardTopicSelectElement.value = "all";
        filterQuestions();
        loadQuestionFunc();
        filterFlashcards();
        loadFlashcardFunc();
        updateProgressDisplay();
        updateStats();
        saveState();
    });

    // Modal Triggers
    addSubjectBtn.addEventListener("click", () => openModal(subjectModal));
    addTopicBtn.addEventListener("click", () => openModal(topicModal));
    addFlashcardTopicBtn.addEventListener("click", () => openModal(topicModal));
    saveSubjectBtn.addEventListener("click", saveNewSubject);
    saveTopicBtn.addEventListener("click", saveNewTopic);
    closeModalBtns.forEach((btn) => {
        btn.addEventListener("click", closeAllModals);
    });

    // Import/Export
    importDataBtn.addEventListener("click", () => importFileInput.click());
    importFileInput.addEventListener("change", importData);
    exportDataBtn.addEventListener("click", exportData);

    // Quiz Controls
    questionTypeSelectElement.addEventListener("change", () => {
        currentState.quiz.selectedQuestionType = questionTypeSelectElement.value;
        filterQuestions();
        currentState.quiz.currentQuestionIndex = 0;
        loadQuestionFunc();
    });
    topicSelectElement.addEventListener("change", () => {
        currentState.quiz.selectedTopic = topicSelectElement.value;
        filterQuestions();
        currentState.quiz.currentQuestionIndex = 0;
        loadQuestionFunc();
    });
    checkAnswerButton.addEventListener("click", checkAnswer);
    nextQuestionButton.addEventListener("click", nextQuestion);
    shortAnswerInput.addEventListener("input", () => {
        currentState.quiz.shortAnswer = shortAnswerInput.value;
    });

    // Flashcard Controls
    flashcardTopicSelectElement.addEventListener("change", () => {
        currentState.flashcards.selectedTopic = flashcardTopicSelectElement.value;
        filterFlashcards();
        currentState.flashcards.currentCardIndex = 0;
        loadFlashcardFunc();
    });
    prevFlashcardButton.addEventListener("click", prevFlashcardFunc);
    nextFlashcardButton.addEventListener("click", nextFlashcardFunc);
    currentFlashcard.addEventListener("click", () => {
        currentFlashcard.classList.toggle("flipped");
    });
    markKnownButton.addEventListener("click", () => {
        markCard("known");
        nextFlashcardFunc();
    });
    markReviewButton.addEventListener("click", () => {
        markCard("review");
        nextFlashcardFunc();
    });

    // Content Management
    setupContentManagementListeners();
}

/**
 * Update Topic Selectors
 * Refreshes topic dropdowns for quiz, flashcards, and content management
 */
function updateTopicSelectors() {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) return;

    const topics = subjectsData[currentSubject].topics;

    // Quiz Topic Selector
    topicSelectElement.innerHTML = '<option value="all">Tous</option>';
    Object.keys(topics).forEach((topicId) => {
        const option = document.createElement("option");
        option.value = topicId;
        option.textContent = topics[topicId].name;
        topicSelectElement.appendChild(option);
    });

    // Flashcard Topic Selector
    flashcardTopicSelectElement.innerHTML = '<option value="all">Tous</option>';
    Object.keys(topics).forEach((topicId) => {
        const option = document.createElement("option");
        option.value = topicId;
        option.textContent = topics[topicId].name;
        flashcardTopicSelectElement.appendChild(option);
    });

    // Content Management Topic Selectors
    updateContentManagementTopicSelectors();
}

/**
 * Modal Management
 */
function openModal(modal) {
    closeAllModals();
    modal.style.display = "block";
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
    });
}

/**
 * Save New Subject
 * Creates a new subject and initializes its state
 */
function saveNewSubject() {
    const subjectName = newSubjectNameInput.value.trim();
    const subjectDesc = newSubjectDescInput.value.trim();

    if (!subjectName) {
        alert("Veuillez entrer un nom de sujet.");
        return;
    }

    const subjectId = generateUniqueId(subjectName);
    if (subjectsData[subjectId]) {
        alert("Un sujet avec ce nom existe déjà.");
        return;
    }

    subjectsData[subjectId] = {
        name: subjectName,
        description: subjectDesc,
        topics: {},
        quizData: {
            "multiple-choice": [],
            "true-false": [],
            "short-answer": [],
            "pratique": []
        },
        flashcardData: [],
    };

    // Initialize state
    currentState.quiz.answeredQuestions[subjectId] = [];
    currentState.quiz.correctAnswers[subjectId] = 0;
    currentState.flashcards.knownCards[subjectId] = [];
    currentState.flashcards.reviewCards[subjectId] = [];
    currentState.progress.sessions[subjectId] = [];

    // Update UI and state
    populateSubjectSelector();
    subjectSelect.value = subjectId;
    currentState.currentSubject = subjectId;
    newSubjectNameInput.value = "";
    newSubjectDescInput.value = "";
    closeAllModals();
    updateTopicSelectors();
    filterQuestions();
    loadQuestionFunc();
    filterFlashcards();
    loadFlashcardFunc();
    updateProgressDisplay();
    updateStats();
    saveState();
}

/**
 * Save New Topic
 * Adds a new topic to the current subject
 */
function saveNewTopic() {
    const topicName = newTopicNameInput.value.trim();
    const topicDesc = newTopicDescInput.value.trim();

    if (!topicName) {
        alert("Veuillez entrer un nom de thème.");
        return;
    }

    const currentSubject = currentState.currentSubject;
    const topicId = generateUniqueId(topicName);
    if (subjectsData[currentSubject].topics[topicId]) {
        alert("Un thème avec ce nom existe déjà.");
        return;
    }

    subjectsData[currentSubject].topics[topicId] = {
        name: topicName,
        description: topicDesc,
    };

    updateTopicSelectors();
    newTopicNameInput.value = "";
    newTopicDescInput.value = "";
    closeAllModals();
    saveState();
}

/**
 * Generate Unique ID
 * Converts a string to a URL-safe ID
 */
function generateUniqueId(str) {
    return str
        .toLowerCase()
        .replace(/[àáâãäå]/g, "a")
        .replace(/[èéêë]/g, "e")
        .replace(/[ìíîï]/g, "i")
        .replace(/[òóôõö]/g, "o")
        .replace(/[ùúûü]/g, "u")
        .replace(/[ç]/g, "c")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * Import Data
 * Merges data from a JSON file into subjectsData
 */
function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Aucun fichier sélectionné.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData.subjects || typeof importedData.subjects !== "object") {
                throw new Error("Format de données invalide.");
            }

            Object.keys(importedData.subjects).forEach((subjectId) => {
                if (!subjectsData[subjectId]) {
                    subjectsData[subjectId] = importedData.subjects[subjectId];
                    currentState.quiz.answeredQuestions[subjectId] = [];
                    currentState.quiz.correctAnswers[subjectId] = 0;
                    currentState.flashcards.knownCards[subjectId] = [];
                    currentState.flashcards.reviewCards[subjectId] = [];
                    currentState.progress.sessions[subjectId] = [];
                } else {
                    // Merge topics
                    const existingTopics = subjectsData[subjectId].topics;
                    const importedTopics = importedData.subjects[subjectId].topics;
                    Object.keys(importedTopics).forEach((topicId) => {
                        if (!existingTopics[topicId]) {
                            existingTopics[topicId] = importedTopics[topicId];
                        }
                    });

                    // Merge quiz data
                    const existingQuizData = subjectsData[subjectId].quizData;
                    const importedQuizData = importedData.subjects[subjectId].quizData;
                    Object.keys(importedQuizData).forEach((questionType) => {
                        if (!existingQuizData[questionType]) {
                            existingQuizData[questionType] = [];
                        }
                        const existingIds = existingQuizData[questionType].map((q) => q.id);
                        importedQuizData[questionType].forEach((question) => {
                            if (!existingIds.includes(question.id)) {
                                existingQuizData[questionType].push(question);
                            }
                        });
                    });

                    // Merge flashcards
                    const existingFlashcards = subjectsData[subjectId].flashcardData;
                    const importedFlashcards = importedData.subjects[subjectId].flashcardData;
                    const existingFlashcardIds = existingFlashcards.map((f) => f.id);
                    importedFlashcards.forEach((flashcard) => {
                        if (!existingFlashcardIds.includes(flashcard.id)) {
                            existingFlashcards.push(flashcard);
                        }
                    });
                }
            });

            // Update UI
            populateSubjectSelector();
            updateTopicSelectors();
            filterQuestions();
            loadQuestionFunc();
            filterFlashcards();
            loadFlashcardFunc();
            updateProgressDisplay();
            updateStats();
            saveState();
            alert("Données importées avec succès!");
        } catch (error) {
            console.error('Erreur lors de l’importation:', error);
            alert("Erreur lors de l'importation: " + error.message);
        }
    };
    reader.onerror = () => {
        alert("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(file);
    event.target.value = "";
}

/**
 * Export Data
 * Downloads subjectsData as a JSON file
 */
function exportData() {
    const exportData = { subjects: subjectsData };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileName = `exam_prep_data_${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
}

/**
 * Filter Questions
 * Updates filteredQuestions based on question type and topic
 */
function filterQuestions() {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) {
        currentState.quiz.filteredQuestions = [];
        totalQuestionsElement.textContent = "0";
        return;
    }

    const quizData = subjectsData[currentSubject].quizData;
    let allQuestions = [];

    if (currentState.quiz.selectedQuestionType === "all") {
        Object.keys(quizData).forEach((type) => {
            allQuestions = allQuestions.concat(quizData[type]);
        });
    } else {
        allQuestions = quizData[currentState.quiz.selectedQuestionType] || [];
    }

    if (currentState.quiz.selectedTopic !== "all") {
        allQuestions = allQuestions.filter((q) => q.topic === currentState.quiz.selectedTopic);
    }

    currentState.quiz.filteredQuestions = allQuestions;
    totalQuestionsElement.textContent = allQuestions.length;
}

/**
 * Check Answer
 * Validates user input and provides feedback
 */
function checkAnswer() {
    const questions = currentState.quiz.filteredQuestions;
    const currentIndex = currentState.quiz.currentQuestionIndex;
    if (currentIndex >= questions.length) return;

    const question = questions[currentIndex];
    const currentSubject = currentState.currentSubject;

    let isCorrect = false;
    let feedback = "";

    if (question.hasOwnProperty("options")) {
        // Multiple-choice or true-false
        if (currentState.quiz.selectedOption === null) {
            alert("Veuillez sélectionner une réponse.");
            return;
        }
        isCorrect = currentState.quiz.selectedOption === question.correctAnswer;
        const options = document.querySelectorAll(".option");
        options.forEach((option, index) => {
            option.classList.remove("correct", "incorrect");
            if (index === question.correctAnswer) {
                option.classList.add("correct");
            } else if (index === currentState.quiz.selectedOption && !isCorrect) {
                option.classList.add("incorrect");
            }
        });
        feedback = isCorrect
            ? `<strong>Correct!</strong> ${question.explanation}`
            : `<strong>Incorrect.</strong> ${question.explanation}`;
    } else if (question.hasOwnProperty("solution")) {
        // Pratique question
        const userAnswer = currentState.quiz.shortAnswer.trim().toLowerCase();
        if (!userAnswer) {
            alert("Veuillez entrer une réponse.");
            return;
        }
        isCorrect = true; // Pratique questions are always marked correct
        if (question.solution.hasOwnProperty("code")) {
            const codeBlock = document.querySelector(".code-example pre");
            if (codeBlock) {
                codeBlock.style.display = "block";
                const toggleButton = document.querySelector(".code-toggle");
                if (toggleButton) {
                    toggleButton.textContent = "Masquer la solution";
                }
            }
        }
        feedback = `<strong>Solution:</strong> ${
            question.solution.hasOwnProperty("correctAnswer")
                ? question.solution.correctAnswer
                : `<pre><code class="language-clike">${question.solution.code}</code></pre>`
        }<br><br><strong>Explication:</strong> ${question.solution.explanation}`;
    } else {
        // Short-answer
        const userAnswer = currentState.quiz.shortAnswer.trim().toLowerCase();
        if (!userAnswer) {
            alert("Veuillez entrer une réponse.");
            return;
        }
        isCorrect = question.correctAnswer.some((keyword) =>
            userAnswer.includes(keyword.toLowerCase())
        );
        feedback = isCorrect
            ? `<strong>Correct!</strong> ${question.explanation}`
            : `<strong>Incorrect.</strong> ${question.explanation}`;
    }

    // Update UI
    feedbackElement.innerHTML = feedback;
    feedbackElement.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
    feedbackElement.style.display = "block";
    checkAnswerButton.disabled = true;
    nextQuestionButton.disabled = false;

    // Record answer
    if (!currentState.quiz.answeredQuestions[currentSubject]) {
        currentState.quiz.answeredQuestions[currentSubject] = [];
    }
    currentState.quiz.answeredQuestions[currentSubject].push({
        id: question.id,
        isCorrect: isCorrect,
        topic: question.topic,
    });

    if (isCorrect) {
        currentState.quiz.correctAnswers[currentSubject] =
            (currentState.quiz.correctAnswers[currentSubject] || 0) + 1;
    }

    saveState();
    updateProgressDisplay();
}

/**
 * Next Question
 * Advances to the next question or shows quiz summary
 */
function nextQuestion() {
    const questions = currentState.quiz.filteredQuestions;
    const currentSubject = currentState.currentSubject;

    if (currentState.quiz.currentQuestionIndex < questions.length - 1) {
        currentState.quiz.currentQuestionIndex++;
        loadQuestionFunc();
    } else {
        // Quiz completed
        const totalAnswered = currentState.quiz.answeredQuestions[currentSubject].length;
        const totalCorrect = currentState.quiz.correctAnswers[currentSubject] || 0;
        const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

        const sessionData = {
            date: new Date().toLocaleDateString(),
            questionsAnswered: totalAnswered,
            correctAnswers: totalCorrect,
            accuracy: accuracy,
        };

        currentState.progress.sessions[currentSubject] =
            currentState.progress.sessions[currentSubject] || [];
        currentState.progress.sessions[currentSubject].push(sessionData);
        saveState();

        // Display summary
        questionText.textContent = "Félicitations! Vous avez terminé toutes les questions.";
        optionsContainer.innerHTML = `
            <div class="quiz-summary">
                <p>Vous avez répondu correctement à ${totalCorrect} questions sur ${totalAnswered}.</p>
                <p>Précision: ${accuracy}%</p>
                <button class="btn primary" onclick="restartQuiz()">Recommencer</button>
            </div>
        `;
        shortAnswerContainer.style.display = "none";
        feedbackElement.style.display = "none";
        checkAnswerButton.disabled = true;
        nextQuestionButton.disabled = true;
        updateStats();
    }
}

/**
 * Restart Quiz
 * Resets the quiz to the first question
 */
function restartQuiz() {
    currentState.quiz.currentQuestionIndex = 0;
    loadQuestionFunc();
}

/**
 * Filter Flashcards
 * Updates filteredCards based on selected topic
 */
function filterFlashcards() {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) {
        currentState.flashcards.filteredCards = [];
        return;
    }

    let cards = [...subjectsData[currentSubject].flashcardData];
    if (currentState.flashcards.selectedTopic !== "all") {
        cards = cards.filter((card) => card.topic === currentState.flashcards.selectedTopic);
    }
    currentState.flashcards.filteredCards = cards;
}

/**
 * Mark Flashcard
 * Marks a flashcard as known or review
 */
function markCard(status) {
    const cards = currentState.flashcards.filteredCards;
    const currentIndex = currentState.flashcards.currentCardIndex;
    if (currentIndex >= cards.length) return;

    const cardId = cards[currentIndex].id;
    const currentSubject = currentState.currentSubject;

    currentState.flashcards.knownCards[currentSubject] =
        currentState.flashcards.knownCards[currentSubject] || [];
    currentState.flashcards.reviewCards[currentSubject] =
        currentState.flashcards.reviewCards[currentSubject] || [];

    if (status === "known") {
        if (!currentState.flashcards.knownCards[currentSubject].includes(cardId)) {
            currentState.flashcards.knownCards[currentSubject].push(cardId);
        }
        const reviewIndex = currentState.flashcards.reviewCards[currentSubject].indexOf(cardId);
        if (reviewIndex !== -1) {
            currentState.flashcards.reviewCards[currentSubject].splice(reviewIndex, 1);
        }
    } else if (status === "review") {
        if (!currentState.flashcards.reviewCards[currentSubject].includes(cardId)) {
            currentState.flashcards.reviewCards[currentSubject].push(cardId);
        }
        const knownIndex = currentState.flashcards.knownCards[currentSubject].indexOf(cardId);
        if (knownIndex !== -1) {
            currentState.flashcards.knownCards[currentSubject].splice(knownIndex, 1);
        }
    }

    saveState();
}

/**
 * Update Progress Display
 * Shows quiz progress as a percentage
 */
function updateProgressDisplay() {
    const currentSubject = currentState.currentSubject;
    const totalAnswered = (currentState.quiz.answeredQuestions[currentSubject] || []).length;
    const totalQuestions = currentState.quiz.filteredQuestions.length;

    if (totalQuestions > 0) {
        const progressPercentage = Math.round((totalAnswered / totalQuestions) * 100);
        progressFill.style.width = `${progressPercentage}%`;
        progressPercent.textContent = `${progressPercentage}%`;
    } else {
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
    }
}

/**
 * Update Statistics
 * Displays total answered, correct, accuracy, topic stats, and session history
 */
function updateStats() {
    const currentSubject = currentState.currentSubject;
    const totalAnswered = (currentState.quiz.answeredQuestions[currentSubject] || []).length;
    const totalCorrect = currentState.quiz.correctAnswers[currentSubject] || 0;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    totalAnsweredElement.textContent = totalAnswered;
    totalCorrectElement.textContent = totalCorrect;
    accuracyElement.textContent = `${accuracy}%`;

    updateTopicStats();
    updateSessionHistory();
    createPerformanceChart();
}

/**
 * Update Topic Statistics
 * Shows progress per topic
 */
function updateTopicStats() {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) return;

    const topics = subjectsData[currentSubject].topics;
    const topicStats = {};
    Object.keys(topics).forEach((topicId) => {
        topicStats[topicId] = {
            name: topics[topicId].name,
            answered: 0,
            correct: 0,
        };
    });

    (currentState.quiz.answeredQuestions[currentSubject] || []).forEach((answer) => {
        if (topicStats[answer.topic]) {
            topicStats[answer.topic].answered++;
            if (answer.isCorrect) {
                topicStats[answer.topic].correct++;
            }
        }
    });

    topicStatsElement.innerHTML = "";
    Object.keys(topicStats).forEach((topicId) => {
        const topic = topicStats[topicId];
        const accuracy = topic.answered > 0 ? Math.round((topic.correct / topic.answered) * 100) : 0;
        const topicItem = document.createElement("div");
        topicItem.className = "topic-item";
        topicItem.innerHTML = `
            <div class="topic-name">${topic.name}</div>
            <div class="topic-progress">
                <div class="topic-bar">
                    <div class="topic-fill" style="width: ${accuracy}%"></div>
                </div>
                <div class="topic-percent">${accuracy}% (${topic.correct}/${topic.answered})</div>
            </div>
        `;
        topicStatsElement.appendChild(topicItem);
    });
}

/**
 * Update Session History
 * Displays past quiz sessions
 */
function updateSessionHistory() {
    const currentSubject = currentState.currentSubject;
    historyTableBody.innerHTML = "";
    const sessions = currentState.progress.sessions[currentSubject] || [];
    const sortedSessions = [...sessions].reverse();

    if (sortedSessions.length === 0) {
        historyTableBody.innerHTML = `
            <tr><td colspan="4" style="text-align: center;">Aucune session enregistrée</td></tr>
        `;
        return;
    }

    sortedSessions.forEach((session) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${session.date}</td>
            <td>${session.questionsAnswered}</td>
            <td>${session.correctAnswers}</td>
            <td>${session.accuracy}%</td>
        `;
        historyTableBody.appendChild(row);
    });
}

/**
 * Create Performance Chart
 * Placeholder for a Chart.js-based chart
 */
function createPerformanceChart() {
    performanceChart.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p>Graphique de performance</p>
            <p style="color: #6c757d; font-size: 0.9rem;">(Placeholder: Chart.js serait utilisé ici)</p>
        </div>
    `;
}

/**
 * Setup Content Management
 * Initializes forms and event listeners for adding/editing content
 */
function setupContentManagement() {
    updateContentManagementTopicSelectors();

    questionTypeSelect.addEventListener("change", () => {
        const questionType = questionTypeSelect.value;
        optionsInputContainer.style.display =
            questionType === "multiple-choice" || questionType === "true-false" ? "block" : "none";
        keywordsContainer.style.display =
            questionType === "short-answer" || questionType === "pratique" ? "block" : "none";

        if (questionType === "true-false") {
            optionsList.innerHTML = "";
            addOptionInput("Vrai");
            addOptionInput("Faux");
            addOptionBtn.disabled = true;
            updateCorrectAnswerSelect();
        } else if (questionType === "multiple-choice") {
            addOptionBtn.disabled = false;
            if (optionsList.children.length === 0) {
                addOptionInput("");
                addOptionInput("");
            }
            updateCorrectAnswerSelect();
        } else {
            optionsList.innerHTML = "";
            addOptionBtn.disabled = false;
        }
    });

    addOptionBtn.addEventListener("click", () => {
        addOptionInput("");
        updateCorrectAnswerSelect();
    });

    saveQuestionBtn.addEventListener("click", saveQuestion);
    saveFlashcardBtn.addEventListener("click", saveFlashcard);

    contentTypeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            contentTypeBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const type = btn.getAttribute("data-type");
            addQuestionForm.style.display = type === "question" ? "block" : "none";
            addFlashcardForm.style.display = type === "flashcard" ? "block" : "none";
        });
    });

    filterContentType.addEventListener("change", updateContentList);
    filterContentTopic.addEventListener("change", updateContentList);
    contentSearch.addEventListener("input", updateContentList);

    updateContentList();
}

/**
 * Setup Content Management Listeners
 * Handles dynamic option removal
 */
function setupContentManagementListeners() {
    optionsList.addEventListener("click", (e) => {
        const button = e.target.closest(".remove-option-btn");
        if (!button) return;

        const optionInput = button.closest(".option-input");
        if (optionsList.children.length <= 2) {
            alert("Une question doit avoir au moins 2 options.");
            return;
        }
        optionInput.remove();
        updateCorrectAnswerSelect();
    });
}

/**
 * Update Content Management Topic Selectors
 */
function updateContentManagementTopicSelectors() {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) return;

    const topics = subjectsData[currentSubject].topics;

    questionTopicSelect.innerHTML = "";
    Object.keys(topics).forEach((topicId) => {
        const option = document.createElement("option");
        option.value = topicId;
        option.textContent = topics[topicId].name;
        questionTopicSelect.appendChild(option);
    });

    flashcardTopicInput.innerHTML = "";
    Object.keys(topics).forEach((topicId) => {
        const option = document.createElement("option");
        option.value = topicId;
        option.textContent = topics[topicId].name;
        flashcardTopicInput.appendChild(option);
    });

    filterContentTopic.innerHTML = '<option value="all">Tous les thèmes</option>';
    Object.keys(topics).forEach((topicId) => {
        const option = document.createElement("option");
        option.value = topicId;
        option.textContent = topics[topicId].name;
        filterContentTopic.appendChild(option);
    });
}

/**
 * Add Option Input
 * Adds a new option field for multiple-choice/true-false questions
 */
function addOptionInput(value) {
    const optionInput = document.createElement("div");
    optionInput.className = "option-input";
    optionInput.innerHTML = `
        <input type="text" placeholder="Option" value="${value}">
        <button class="remove-option-btn"><i class="fas fa-times"></i></button>
    `;
    optionsList.appendChild(optionInput);
}

/**
 * Update Correct Answer Selector
 * Refreshes the dropdown for selecting the correct answer
 */
function updateCorrectAnswerSelect() {
    correctAnswerSelect.innerHTML = "";
    const options = optionsList.querySelectorAll("input");
    options.forEach((option, index) => {
        const selectOption = document.createElement("option");
        selectOption.value = index;
        selectOption.textContent = option.value.trim() || `Option ${index + 1}`;
        correctAnswerSelect.appendChild(selectOption);
    });
}

/**
 * Save Question
 * Adds a new question to quizData
 */
function saveQuestion() {
    const currentSubject = currentState.currentSubject;
    const questionType = questionTypeSelect.value;
    const topic = questionTopicSelect.value;
    const questionText = questionTextInput.value.trim();
    const explanation = explanationInput.value.trim();

    if (!topic) {
        alert("Veuillez sélectionner un thème.");
        return;
    }
    if (!questionText) {
        alert("Veuillez entrer une question.");
        return;
    }
    if (!explanation) {
        alert("Veuillez entrer une explication.");
        return;
    }

    const question = {
        id: Date.now(),
        topic: topic,
        question: questionText,
    };

    if (questionType === "multiple-choice" || questionType === "true-false") {
        const options = Array.from(optionsList.querySelectorAll("input")).map((input) =>
            input.value.trim()
        );
        if (options.some((opt) => !opt)) {
            alert("Veuillez remplir toutes les options.");
            return;
        }
        question.options = options;
        question.correctAnswer = Number.parseInt(correctAnswerSelect.value);
        question.explanation = explanation;
    } else if (questionType === "short-answer") {
        const keywords = keywordsInput.value
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k);
        if (keywords.length === 0) {
            alert("Veuillez entrer au moins un mot-clé.");
            return;
        }
        question.correctAnswer = keywords;
        question.explanation = explanation;
    } else if (questionType === "pratique") {
        const keywords = keywordsInput.value.trim();
        if (!keywords) {
            alert("Veuillez entrer une solution.");
            return;
        }
        const codeIndicators = ["{", "}", ";", "()", "[]", "function", "int ", "void ", "#include"];
        const isCodeSolution = codeIndicators.some((indicator) => keywords.includes(indicator));
        question.solution = isCodeSolution
            ? { code: keywords, explanation: explanation }
            : { correctAnswer: keywords, explanation: explanation };
    }

    subjectsData[currentSubject].quizData[questionType] =
        subjectsData[currentSubject].quizData[questionType] || [];
    subjectsData[currentSubject].quizData[questionType].push(question);

    // Reset form
    questionTextInput.value = "";
    explanationInput.value = "";
    keywordsInput.value = "";
    if (questionType === "multiple-choice") {
        optionsList.innerHTML = "";
        addOptionInput("");
        addOptionInput("");
        updateCorrectAnswerSelect();
    }

    updateContentList();
    saveState();
    alert("Question enregistrée avec succès!");
}

/**
 * Save Flashcard
 * Adds a new flashcard to flashcardData
 */
function saveFlashcard() {
    const currentSubject = currentState.currentSubject;
    const topic = flashcardTopicInput.value;
    const front = flashcardFrontInput.value.trim();
    const back = flashcardBackInput.value.trim();

    if (!topic) {
        alert("Veuillez sélectionner un thème.");
        return;
    }
    if (!front) {
        alert("Veuillez entrer le texte du recto.");
        return;
    }
    if (!back) {
        alert("Veuillez entrer le texte du verso.");
        return;
    }

    const flashcard = {
        id: Date.now(),
        topic: topic,
        front: front,
        back: back,
    };

    subjectsData[currentSubject].flashcardData = subjectsData[currentSubject].flashcardData || [];
    subjectsData[currentSubject].flashcardData.push(flashcard);

    flashcardFrontInput.value = "";
    flashcardBackInput.value = "";
    updateContentList();
    saveState();
    alert("Carte mémoire enregistrée avec succès!");
}

/**
 * Update Content List
 * Displays questions and flashcards with edit/delete options
 */
function updateContentList() {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) {
        contentList.innerHTML = '<div class="content-item">Aucun contenu disponible</div>';
        return;
    }

    const contentType = filterContentType.value;
    const topic = filterContentTopic.value;
    const searchText = contentSearch.value.toLowerCase();

    let items = [];
    if (contentType === "questions") {
        Object.keys(subjectsData[currentSubject].quizData).forEach((type) => {
            subjectsData[currentSubject].quizData[type].forEach((question) => {
                items.push({
                    id: question.id,
                    type: type,
                    topic: question.topic,
                    text: question.question,
                    isQuestion: true,
                });
            });
        });
    } else if (contentType === "flashcards") {
        (subjectsData[currentSubject].flashcardData || []).forEach((flashcard) => {
            items.push({
                id: flashcard.id,
                topic: flashcard.topic,
                text: flashcard.front,
                isQuestion: false,
            });
        });
    }

    if (topic !== "all") {
        items = items.filter((item) => item.topic === topic);
    }
    if (searchText) {
        items = items.filter((item) => item.text.toLowerCase().includes(searchText));
    }

    items.sort((a, b) => {
        if (a.topic !== b.topic) {
            return subjectsData[currentSubject].topics[a.topic].name.localeCompare(
                subjectsData[currentSubject].topics[b.topic].name
            );
        }
        return a.text.localeCompare(b.text);
    });

    contentList.innerHTML = "";
    items.forEach((item) => {
        const topicName = subjectsData[currentSubject].topics[item.topic]?.name || "Thème inconnu";
        const itemElement = document.createElement("div");
        itemElement.className = "content-item";
        itemElement.innerHTML = `
            <div class="content-item-text" title="${item.text}">
                <strong>${topicName}:</strong> ${item.text}
            </div>
            <div class="content-item-actions">
                <button class="edit-btn" data-id="${item.id}" data-is-question="${item.isQuestion}" data-type="${item.isQuestion ? item.type : ""}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${item.id}" data-is-question="${item.isQuestion}" data-type="${item.isQuestion ? item.type : ""}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        contentList.appendChild(itemElement);
    });

    // Add event listeners for edit/delete buttons
    contentList.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            editContent(
                Number.parseInt(btn.getAttribute("data-id")),
                btn.getAttribute("data-is-question") === "true",
                btn.getAttribute("data-type")
            );
        });
    });

    contentList.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            deleteContent(
                Number.parseInt(btn.getAttribute("data-id")),
                btn.getAttribute("data-is-question") === "true",
                btn.getAttribute("data-type")
            );
        });
    });

    if (items.length === 0) {
        contentList.innerHTML = '<div class="content-item">Aucun contenu trouvé</div>';
    }
}

/**
 * Edit Content
 * Populates the form for editing a question or flashcard
 */
function editContent(id, isQuestion, type) {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) return;

    if (isQuestion) {
        const question = subjectsData[currentSubject].quizData[type]?.find((q) => q.id === id);
        if (!question) {
            alert("Question non trouvée.");
            return;
        }

        contentTypeBtns.forEach((btn) => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-type") === "question") btn.classList.add("active");
        });
        addQuestionForm.style.display = "block";
        addFlashcardForm.style.display = "none";

        questionTypeSelect.value = type;
        questionTopicSelect.value = question.topic;
        questionTextInput.value = question.question;
        explanationInput.value = question.explanation || (question.solution?.explanation) || "";

        questionTypeSelect.dispatchEvent(new Event("change"));

        if (type === "multiple-choice" || type === "true-false") {
            optionsList.innerHTML = "";
            question.options.forEach((option) => addOptionInput(option));
            updateCorrectAnswerSelect();
            correctAnswerSelect.value = question.correctAnswer;
        } else if (type === "short-answer") {
            keywordsInput.value = question.correctAnswer.join(", ");
        } else if (type === "pratique") {
            keywordsInput.value = question.solution?.code || question.solution?.correctAnswer || "";
        }

        deleteContent(id, true, type, false);
    } else {
        const flashcard = subjectsData[currentSubject].flashcardData.find((f) => f.id === id);
        if (!flashcard) {
            alert("Carte mémoire non trouvée.");
            return;
        }

        contentTypeBtns.forEach((btn) => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-type") === "flashcard") btn.classList.add("active");
        });
        addQuestionForm.style.display = "none";
        addFlashcardForm.style.display = "block";

        flashcardTopicInput.value = flashcard.topic;
        flashcardFrontInput.value = flashcard.front;
        flashcardBackInput.value = flashcard.back;

        deleteContent(id, false, "", false);
    }
}

/**
 * Delete Content
 * Removes a question or flashcard
 */
function deleteContent(id, isQuestion, type, showConfirmation = true) {
    const currentSubject = currentState.currentSubject;
    if (!subjectsData[currentSubject]) return;

    if (showConfirmation && !confirm("Êtes-vous sûr de vouloir supprimer cet élément?")) {
        return;
    }

    if (isQuestion) {
        const index = subjectsData[currentSubject].quizData[type]?.findIndex((q) => q.id === id);
        if (index !== -1) {
            subjectsData[currentSubject].quizData[type].splice(index, 1);
        }
    } else {
        const index = subjectsData[currentSubject].flashcardData.findIndex((f) => f.id === id);
        if (index !== -1) {
            subjectsData[currentSubject].flashcardData.splice(index, 1);
        }
    }

    updateContentList();
    saveState();
    if (showConfirmation) {
        alert("Élément supprimé avec succès!");
    }
}

/**
 * Save State
 * Persists currentState and subjectsData to localStorage
 */
function saveState() {
    try {
        localStorage.setItem("examPrepState", JSON.stringify(currentState));
        localStorage.setItem("examPrepData", JSON.stringify(subjectsData));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'état:", error);
        alert("Erreur lors de la sauvegarde des données.");
    }
}

/**
 * Load State
 * Restores state from localStorage
 */
function loadState() {
    try {
        const savedState = localStorage.getItem("examPrepState");
        const savedData = localStorage.getItem("examPrepData");
        if (savedState) {
            currentState = JSON.parse(savedState);
        }
        if (savedData) {
            subjectsData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error("Erreur lors du chargement de l'état:", error);
        alert("Erreur lors du chargement des données sauvegardées.");
    }
}

/**
 * Load Question
 * Displays the current quiz question
 */
loadQuestion = () => {
    const questions = currentState.quiz.filteredQuestions;
    const currentIndex = currentState.quiz.currentQuestionIndex;
    const currentSubject = currentState.currentSubject;

    if (questions.length === 0) {
        questionText.textContent = "Aucune question disponible avec ces critères.";
        optionsContainer.innerHTML = "";
        shortAnswerContainer.style.display = "none";
        feedbackElement.style.display = "none";
        checkAnswerButton.disabled = true;
        nextQuestionButton.disabled = true;
        currentQuestionElement.textContent = "0";
        return;
    }

    const question = questions[currentIndex];
    currentQuestionElement.textContent = currentIndex + 1;
    questionText.textContent = question.question;
    feedbackElement.style.display = "none";
    feedbackElement.classList.remove("correct", "incorrect");
    checkAnswerButton.disabled = false;
    nextQuestionButton.disabled = true;
    currentState.quiz.selectedOption = null;
    currentState.quiz.shortAnswer = "";
    shortAnswerInput.value = "";

    if (question.hasOwnProperty("options")) {
        // Multiple-choice or true-false
        optionsContainer.innerHTML = "";
        shortAnswerContainer.style.display = "none";
        question.options.forEach((option, index) => {
            const optionElement = document.createElement("div");
            optionElement.className = "option";
            optionElement.textContent = option;
            optionElement.addEventListener("click", () => {
                document.querySelectorAll(".option").forEach((opt) => opt.classList.remove("selected"));
                optionElement.classList.add("selected");
                currentState.quiz.selectedOption = index;
            });
            optionsContainer.appendChild(optionElement);
        });
    } else if (question.hasOwnProperty("solution") && question.solution.hasOwnProperty("code")) {
        // Pratique with code solution
        optionsContainer.innerHTML = "";
        shortAnswerContainer.style.display = "block";
        const codeExample = document.createElement("div");
        codeExample.className = "code-example";
        codeExample.innerHTML = `
            <pre><code class="language-clike">${question.solution.code}</code></pre>
            <button class="btn secondary small code-toggle">Afficher/Masquer la solution</button>
        `;
        const codeBlock = codeExample.querySelector("pre");
        codeBlock.style.display = "none";
        const toggleButton = codeExample.querySelector(".code-toggle");
        toggleButton.addEventListener("click", () => {
            codeBlock.style.display = codeBlock.style.display === "none" ? "block" : "none";
            toggleButton.textContent =
                codeBlock.style.display === "none" ? "Afficher la solution" : "Masquer la solution";
        });
        optionsContainer.appendChild(codeExample);
    } else {
        // Short-answer or pratique with text solution
        optionsContainer.innerHTML = "";
        shortAnswerContainer.style.display = "block";
    }

    // Highlight previous answers
    const answeredQuestion = (currentState.quiz.answeredQuestions[currentSubject] || []).find(
        (ans) => ans.id === question.id
    );
    if (answeredQuestion) {
        if (question.hasOwnProperty("options")) {
            const options = document.querySelectorAll(".option");
            if (answeredQuestion.isCorrect) {
                options[question.correctAnswer].classList.add("correct");
            } else {
                options[question.correctAnswer].classList.add("correct");
                if (currentState.quiz.selectedOption !== null) {
                    options[currentState.quiz.selectedOption].classList.add("incorrect");
                }
            }
        }
        checkAnswerButton.disabled = true;
        nextQuestionButton.disabled = false;
    }
};

/**
 * Load Flashcard
 * Displays the current flashcard
 */
loadFlashcard = () => {
    const cards = currentState.flashcards.filteredCards;
    const currentIndex = currentState.flashcards.currentCardIndex;
    const currentSubject = currentState.currentSubject;

    if (cards.length === 0) {
        flashcardFrontText.textContent = "Aucune carte mémoire disponible avec ces critères.";
        flashcardBackText.textContent = "";
        flashcardCounter.textContent = "0/0";
        currentFlashcard.classList.remove("flipped");
        markKnownButton.disabled = true;
        markReviewButton.disabled = true;
        return;
    }

    const card = cards[currentIndex];
    flashcardCounter.textContent = `${currentIndex + 1}/${cards.length}`;
    flashcardFrontText.textContent = card.front;
    flashcardBackText.textContent = card.back;
    currentFlashcard.classList.remove("flipped");
    markKnownButton.disabled = false;
    markReviewButton.disabled = false;

    markKnownButton.classList.toggle(
        "active",
        (currentState.flashcards.knownCards[currentSubject] || []).includes(card.id)
    );
    markReviewButton.classList.toggle(
        "active",
        (currentState.flashcards.reviewCards[currentSubject] || []).includes(card.id)
    );
};

/**
 * Previous Flashcard
 * Navigates to the previous flashcard
 */
prevFlashcard = () => {
    if (currentState.flashcards.currentCardIndex > 0) {
        currentState.flashcards.currentCardIndex--;
        loadFlashcardFunc();
    }
};

/**
 * Next Flashcard
 * Navigates to the next flashcard or shows completion
 */
nextFlashcard = () => {
    const cards = currentState.flashcards.filteredCards;
    if (currentState.flashcards.currentCardIndex < cards.length - 1) {
        currentState.flashcards.currentCardIndex++;
        loadFlashcardFunc();
    } else {
        flashcardFrontText.textContent = "Vous avez parcouru toutes les cartes mémoire.";
        flashcardBackText.textContent = "";
        flashcardCounter.textContent = "Terminé";
        currentFlashcard.classList.remove("flipped");
        markKnownButton.disabled = true;
        markReviewButton.disabled = true;
    }
};

/**
 * Bind Functions
 * Ensures correct `this` context
 */
const loadQuestionFunc = loadQuestion.bind(this);
const loadFlashcardFunc = loadFlashcard.bind(this);
const prevFlashcardFunc = prevFlashcard.bind(this);
const nextFlashcardFunc = nextFlashcard.bind(this);

/**
 * Initialize on DOM Load
 */
document.addEventListener("DOMContentLoaded", init);