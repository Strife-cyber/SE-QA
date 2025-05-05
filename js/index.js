import { initializeData } from './data.js';
import { setupEventListeners } from './events.js';
import { populateSubjectSelector } from './subjects.js';
import { filterQuestions, loadQuestion } from './quiz.js';
import { filterFlashcards, loadFlashcard } from './flashcards.js';
import { updateProgressDisplay, updateStats } from './progress.js';
import { setupContentManagement } from './content.js';
import { loadState } from './persistence.js';

async function init() {
    await initializeData();
    loadState();
    populateSubjectSelector();
    setupEventListeners();
    filterQuestions();
    loadQuestion();
    filterFlashcards();
    loadFlashcard();
    updateProgressDisplay();
    updateStats();
    setupContentManagement();
}

document.addEventListener('DOMContentLoaded', init);