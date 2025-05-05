import { subjectsData, currentState } from './state.js';
import { domElements, closeAllModals } from './dom.js';
import { updateTopicSelectors } from './topics.js';
import { filterQuestions, loadQuestion } from './quiz.js';
import { filterFlashcards, loadFlashcard } from './flashcards.js';
import { updateProgressDisplay, updateStats } from './progress.js';
import { saveState } from './persistence.js';
import { generateUniqueId } from './utils.js';

export function populateSubjectSelector() {
    const { subjectSelect } = domElements;
    subjectSelect.innerHTML = '';
    Object.keys(subjectsData).forEach((subjectId) => {
        const option = document.createElement('option');
        option.value = subjectId;
        option.textContent = subjectsData[subjectId].name;
        subjectSelect.appendChild(option);
    });
    subjectSelect.value = currentState.currentSubject;
}

export function saveNewSubject() {
    const { newSubjectNameInput, newSubjectDescInput } = domElements;
    const subjectName = newSubjectNameInput.value.trim();
    const subjectDesc = newSubjectDescInput.value.trim();

    if (subjectName === '') {
        alert('Veuillez entrer un nom de sujet.');
        return;
    }

    const subjectId = generateUniqueId(subjectName);
    if (subjectsData[subjectId]) {
        alert('Un sujet avec ce nom existe déjà.');
        return;
    }

    subjectsData[subjectId] = {
        name: subjectName,
        description: subjectDesc,
        topics: {},
        quizData: {
            'multiple-choice': [],
            'true-false': [],
            'short-answer': [],
        },
        flashcardData: [],
    };

    currentState.quiz.answeredQuestions[subjectId] = [];
    currentState.quiz.correctAnswers[subjectId] = 0;
    currentState.flashcards.knownCards[subjectId] = [];
    currentState.flashcards.reviewCards[subjectId] = [];
    currentState.progress.sessions[subjectId] = [];

    populateSubjectSelector();
    domElements.subjectSelect.value = subjectId;
    currentState.currentSubject = subjectId;

    newSubjectNameInput.value = '';
    newSubjectDescInput.value = '';

    closeAllModals();
    updateTopicSelectors();
    filterQuestions();
    loadQuestion();
    filterFlashcards();
    loadFlashcard();
    updateProgressDisplay();
    updateStats();
    saveState();
}

export function handleSubjectChange() {
    currentState.currentSubject = domElements.subjectSelect.value;
    updateTopicSelectors();
    currentState.quiz.currentQuestionIndex = 0;
    currentState.quiz.selectedTopic = 'all';
    currentState.flashcards.currentCardIndex = 0;
    currentState.flashcards.selectedTopic = 'all';
    domElements.topicSelectElement.value = 'all';
    domElements.flashcardTopicSelectElement.value = 'all';
    filterQuestions();
    loadQuestion();
    filterFlashcards();
    loadFlashcard();
    updateProgressDisplay();
    updateStats();
    saveState();
}