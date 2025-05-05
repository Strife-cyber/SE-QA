import { subjectsData, currentState } from './state.js';
import { domElements } from './dom.js';
import { saveState } from './persistence.js';
import { updateProgressDisplay, updateStats } from './progress.js';

export function filterQuestions() {
    const currentSubject = currentState.currentSubject;
    const quizData = subjectsData[currentSubject].quizData;
    let allQuestions = [];

    if (currentState.quiz.selectedQuestionType === 'all') {
        Object.keys(quizData).forEach((type) => {
            allQuestions = allQuestions.concat(quizData[type]);
        });
    } else {
        allQuestions = quizData[currentState.quiz.selectedQuestionType] || [];
    }

    if (currentState.quiz.selectedTopic !== 'all') {
        allQuestions = allQuestions.filter((q) => q.topic === currentState.quiz.selectedTopic);
    }

    currentState.quiz.filteredQuestions = allQuestions;
    domElements.totalQuestionsElement.textContent = allQuestions.length;
}

export function checkAnswer() {
    const { optionsContainer, shortAnswerContainer, feedbackElement, checkAnswerButton, nextQuestionButton } = domElements;
    const questions = currentState.quiz.filteredQuestions;
    const currentIndex = currentState.quiz.currentQuestionIndex;
    const question = questions[currentIndex];
    const currentSubject = currentState.currentSubject;

    let isCorrect = false;
    let feedback = '';

    if (question.hasOwnProperty('options')) {
        if (currentState.quiz.selectedOption === null) {
            alert('Veuillez sélectionner une réponse.');
            return;
        }

        isCorrect = currentState.quiz.selectedOption === question.correctAnswer;

        const options = document.querySelectorAll('.option');
        options.forEach((option, index) => {
            if (index === question.correctAnswer) {
                option.classList.add('correct');
            } else if (index === currentState.quiz.selectedOption && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
    } else {
        const userAnswer = currentState.quiz.shortAnswer.trim().toLowerCase();
        if (userAnswer === '') {
            alert('Veuillez entrer une réponse.');
            return;
        }

        isCorrect = question.correctAnswer.some((keyword) => userAnswer.includes(keyword.toLowerCase()));
    }

    feedback = isCorrect
        ? `<strong>Correct!</strong> ${question.explanation}`
        : `<strong>Incorrect.</strong> ${question.explanation}`;

    feedbackElement.innerHTML = feedback;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.style.display = 'block';

    checkAnswerButton.disabled = true;
    nextQuestionButton.disabled = false;

    if (!currentState.quiz.answeredQuestions[currentSubject]) {
        currentState.quiz.answeredQuestions[currentSubject] = [];
    }

    currentState.quiz.answeredQuestions[currentSubject].push({
        id: question.id,
        isCorrect: isCorrect,
        topic: question.topic,
    });

    if (isCorrect) {
        if (!currentState.quiz.correctAnswers[currentSubject]) {
            currentState.quiz.correctAnswers[currentSubject] = 0;
        }
        currentState.quiz.correctAnswers[currentSubject]++;
    }

    saveState();
    updateProgressDisplay();
}

export function nextQuestion() {
    const { questionText, optionsContainer, shortAnswerContainer, feedbackElement, checkAnswerButton, nextQuestionButton } = domElements;
    const questions = currentState.quiz.filteredQuestions;
    const currentSubject = currentState.currentSubject;

    if (currentState.quiz.currentQuestionIndex < questions.length - 1) {
        currentState.quiz.currentQuestionIndex++;
        loadQuestion();
    } else {
        const sessionData = {
            date: new Date().toLocaleDateString(),
            questionsAnswered: currentState.quiz.answeredQuestions[currentSubject].length,
            correctAnswers: currentState.quiz.correctAnswers[currentSubject],
            accuracy: Math.round(
                (currentState.quiz.correctAnswers[currentSubject] /
                    currentState.quiz.answeredQuestions[currentSubject].length) * 100
            ),
        };

        if (!currentState.progress.sessions[currentSubject]) {
            currentState.progress.sessions[currentSubject] = [];
        }

        currentState.progress.sessions[currentSubject].push(sessionData);
        saveState();

        questionText.textContent = 'Félicitations! Vous avez terminé toutes les questions.';
        optionsContainer.innerHTML = `
            <div class="quiz-summary">
                <p>Vous avez répondu correctement à ${currentState.quiz.correctAnswers[currentSubject]} questions sur ${currentState.quiz.answeredQuestions[currentSubject].length}.</p>
                <p>Précision: ${sessionData.accuracy}%</p>
                <button class="btn primary">Recommencer</button>
            </div>
        `;
        shortAnswerContainer.style.display = 'none';
        feedbackElement.style.display = 'none';
        checkAnswerButton.disabled = true;
        nextQuestionButton.disabled = true;

        updateStats();

        // Re-attach event listener for the restart button
        document.querySelector('.quiz-summary .btn.primary').addEventListener('click', restartQuiz);
    }
}

export function restartQuiz() {
    currentState.quiz.currentQuestionIndex = 0;
    loadQuestion();
}

export function loadQuestion() {
    const { questionText, optionsContainer, shortAnswerContainer, feedbackElement, checkAnswerButton, nextQuestionButton, currentQuestionElement, shortAnswerInput } = domElements;
    const questions = currentState.quiz.filteredQuestions;
    const currentIndex = currentState.quiz.currentQuestionIndex;
    const currentSubject = currentState.currentSubject;

    if (questions.length === 0) {
        questionText.textContent = 'Aucune question disponible avec ces critères.';
        optionsContainer.innerHTML = '';
        shortAnswerContainer.style.display = 'none';
        feedbackElement.style.display = 'none';
        checkAnswerButton.disabled = true;
        nextQuestionButton.disabled = true;
        return;
    }

    const question = questions[currentIndex];

    currentQuestionElement.textContent = currentIndex + 1;
    questionText.textContent = question.question;
    feedbackElement.style.display = 'none';
    feedbackElement.classList.remove('correct', 'incorrect');
    checkAnswerButton.disabled = false;
    nextQuestionButton.disabled = true;
    currentState.quiz.selectedOption = null;
    currentState.quiz.shortAnswer = '';
    shortAnswerInput.value = '';

    if (question.hasOwnProperty('options')) {
        optionsContainer.innerHTML = '';
        shortAnswerContainer.style.display = 'none';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => {
                document.querySelectorAll('.option').forEach((opt) => opt.classList.remove('selected'));
                optionElement.classList.add('selected');
                currentState.quiz.selectedOption = index;
            });
            optionsContainer.appendChild(optionElement);
        });
    } else {
        optionsContainer.innerHTML = '';
        shortAnswerContainer.style.display = 'block';
    }

    if (question.hasOwnProperty('options')) {
        const options = document.querySelectorAll('.option');
        if (currentState.quiz.answeredQuestions[currentSubject]) {
            const answeredQuestion = currentState.quiz.answeredQuestions[currentSubject].find((ans) => ans.id === question.id);
            if (answeredQuestion) {
                if (answeredQuestion.isCorrect) {
                    options[question.correctAnswer].classList.add('correct');
                } else {
                    options[question.correctAnswer].classList.add('correct');
                    options[currentState.quiz.selectedOption]?.classList.add('incorrect');
                }
                checkAnswerButton.disabled = true;
                nextQuestionButton.disabled = false;
            }
        }
    } else {
        if (currentState.quiz.answeredQuestions[currentSubject]) {
            const answeredQuestion = currentState.quiz.answeredQuestions[currentSubject].find((ans) => ans.id === question.id);
            if (answeredQuestion) {
                checkAnswerButton.disabled = true;
                nextQuestionButton.disabled = false;
            }
        }
    }
}