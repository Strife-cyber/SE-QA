export let subjectsData = {};

export let currentState = {
    currentSubject: 'computer-io',
    quiz: {
        currentQuestionIndex: 0,
        selectedQuestionType: 'all',
        selectedTopic: 'all',
        filteredQuestions: [],
        selectedOption: null,
        shortAnswer: '',
        answeredQuestions: {},
        correctAnswers: {},
    },
    flashcards: {
        currentCardIndex: 0,
        selectedTopic: 'all',
        filteredCards: [],
        knownCards: {},
        reviewCards: {},
    },
    progress: {
        sessions: {},
    },
};

export function updateSubjectsData(newData) {
    subjectsData = { ...subjectsData, ...newData };
}

export function updateCurrentState(newState) {
    currentState = { ...currentState, ...newState };
}