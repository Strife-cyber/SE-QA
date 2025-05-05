import { domElements } from './dom.js';
import { currentState } from './state.js';
import { populateSubjectSelector, handleSubjectChange } from './subjects.js';
import { saveNewTopic } from './topics.js';
import { filterQuestions, loadQuestion, checkAnswer, nextQuestion, restartQuiz } from './quiz.js';
import { filterFlashcards, loadFlashcard, prevFlashcard, nextFlashcard, markCard } from './flashcards.js';
import { updateProgressDisplay, updateStats } from './progress.js';
import { setupContentManagementListeners, updateContentList } from './content.js';
import { importData, exportData } from './persistence.js';

export function setupEventListeners() {
    const {
        tabButtons,
        tabContents,
        subjectSelect,
        addSubjectBtn,
        importDataBtn,
        exportDataBtn,
        importFileInput,
        addTopicBtn,
        addFlashcardTopicBtn,
        saveSubjectBtn,
        saveTopicBtn,
        closeModalBtns,
        subjectModal,
        topicModal,
        questionTypeSelectElement,
        topicSelectElement,
        checkAnswerButton,
        nextQuestionButton,
        shortAnswerInput,
        flashcardTopicSelectElement,
        prevFlashcardButton,
        nextFlashcardButton,
        currentFlashcard,
        markKnownButton,
        markReviewButton,
    } = domElements;

    // Tab navigation
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach((content) => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Subject selector
    subjectSelect.addEventListener('change', handleSubjectChange);

    // Add subject button
    addSubjectBtn.addEventListener('click', () => openModal(subjectModal));

    // Save subject button
    saveSubjectBtn.addEventListener('click', () => {
        import('./subjects.js').then(({ saveNewSubject }) => saveNewSubject());
    });

    // Add topic buttons
    addTopicBtn.addEventListener('click', () => openModal(topicModal));
    addFlashcardTopicBtn.addEventListener('click', () => openModal(topicModal));

    // Save topic button
    saveTopicBtn.addEventListener('click', saveNewTopic);

    // Close modal buttons
    closeModalBtns.forEach((btn) => {
        btn.addEventListener('click', closeAllModals);
    });

    // Import/Export buttons
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);
    exportDataBtn.addEventListener('click', exportData);

    // Quiz filters
    questionTypeSelectElement.addEventListener('change', () => {
        currentState.quiz.selectedQuestionType = questionTypeSelectElement.value;
        filterQuestions();
        currentState.quiz.currentQuestionIndex = 0;
        loadQuestion();
    });

    topicSelectElement.addEventListener('change', () => {
        currentState.quiz.selectedTopic = topicSelectElement.value;
        filterQuestions();
        currentState.quiz.currentQuestionIndex = 0;
        loadQuestion();
    });

    // Quiz buttons
    checkAnswerButton.addEventListener('click', checkAnswer);
    nextQuestionButton.addEventListener('click', nextQuestion);

    // Short answer input
    shortAnswerInput.addEventListener('input', () => {
        currentState.quiz.shortAnswer = shortAnswerInput.value;
    });

    // Flashcard filters
    flashcardTopicSelectElement.addEventListener('change', () => {
        currentState.flashcards.selectedTopic = flashcardTopicSelectElement.value;
        filterFlashcards();
        currentState.flashcards.currentCardIndex = 0;
        loadFlashcard();
    });

    // Flashcard navigation
    prevFlashcardButton.addEventListener('click', prevFlashcard);
    nextFlashcardButton.addEventListener('click', nextFlashcard);

    // Flashcard flip
    currentFlashcard.addEventListener('click', () => {
        currentFlashcard.classList.toggle('flipped');
    });

    // Flashcard buttons
    markKnownButton.addEventListener('click', () => {
        markCard('known');
        nextFlashcard();
    });

    markReviewButton.addEventListener('click', () => {
        markCard('review');
        nextFlashcard();
    });

    // Content management listeners
    setupContentManagementListeners();

    // Restart quiz button (previously inline)
    document.querySelectorAll('.quiz-summary .btn.primary').forEach((btn) => {
        btn.addEventListener('click', restartQuiz);
    });
}