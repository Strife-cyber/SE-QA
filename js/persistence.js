import { subjectsData, currentState } from './state.js';
import { populateSubjectSelector } from './subjects.js';
import { updateTopicSelectors } from './topics.js';
import { filterQuestions, loadQuestion } from './quiz.js';
import { filterFlashcards, loadFlashcard } from './flashcards.js';
import { updateProgressDisplay, updateStats } from './progress.js';

export function saveState() {
    localStorage.setItem('examPrepState', JSON.stringify(currentState));
    localStorage.setItem('examPrepData', JSON.stringify(subjectsData));
}

export function loadState() {
    const savedState = localStorage.getItem('examPrepState');
    const savedData = localStorage.getItem('examPrepData');
    if (savedState) {
        Object.assign(currentState, JSON.parse(savedState));
    }
    if (savedData) {
        Object.assign(subjectsData, JSON.parse(savedData));
    }
}

export function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData.subjects || typeof importedData.subjects !== 'object') {
                throw new Error('Format de données invalide.');
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
                    const existingTopics = subjectsData[subjectId].topics;
                    const importedTopics = importedData.subjects[subjectId].topics;
                    Object.keys(importedTopics).forEach((topicId) => {
                        if (!existingTopics[topicId]) {
                            existingTopics[topicId] = importedTopics[topicId];
                        }
                    });

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

            populateSubjectSelector();
            updateTopicSelectors();
            filterQuestions();
            loadQuestion();
            filterFlashcards();
            loadFlashcard();
            updateProgressDisplay();
            updateStats();
            saveState();
            alert('Données importées avec succès!');
        } catch (error) {
            alert('Erreur lors de l\'importation: ' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

export function exportData() {
    const exportData = { subjects: subjectsData };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = 'exam_prep_data_' + new Date().toISOString().slice(0, 10) + '.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
}