import { subjectsData, currentState, updateSubjectsData } from './state.js';

export async function initializeData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        updateSubjectsData(data);
        Object.keys(subjectsData).forEach((subjectId) => {
            currentState.quiz.answeredQuestions[subjectId] = [];
            currentState.quiz.correctAnswers[subjectId] = 0;
            currentState.flashcards.knownCards[subjectId] = [];
            currentState.flashcards.reviewCards[subjectId] = [];
            currentState.progress.sessions[subjectId] = [];
        });
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}