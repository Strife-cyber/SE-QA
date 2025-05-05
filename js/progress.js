import { subjectsData, currentState } from './state.js';
import { domElements } from './dom.js';

export function updateProgressDisplay() {
    const { progressFill, progressPercent } = domElements;
    const currentSubject = currentState.currentSubject;

    if (!currentState.quiz.answeredQuestions[currentSubject]) {
        currentState.quiz.answeredQuestions[currentSubject] = [];
    }

    const totalAnswered = currentState.quiz.answeredQuestions[currentSubject].length;
    const totalQuestions = currentState.quiz.filteredQuestions.length;

    if (totalQuestions > 0) {
        const progressPercentage = Math.round((totalAnswered / totalQuestions) * 100);
        progressFill.style.width = `${progressPercentage}%`;
        progressPercent.textContent = `${progressPercentage}%`;
    } else {
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
    }
}

export function updateStats() {
    const { totalAnsweredElement, totalCorrectElement, accuracyElement, topicStatsElement, historyTableBody, performanceChart } = domElements;
    const currentSubject = currentState.currentSubject;

    if (!currentState.quiz.answeredQuestions[currentSubject]) {
        currentState.quiz.answeredQuestions[currentSubject] = [];
    }

    if (!currentState.quiz.correctAnswers[currentSubject]) {
        currentState.quiz.correctAnswers[currentSubject] = 0;
    }

    const totalAnswered = currentState.quiz.answeredQuestions[currentSubject].length;
    const totalCorrect = currentState.quiz.correctAnswers[currentSubject];
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    totalAnsweredElement.textContent = totalAnswered;
    totalCorrectElement.textContent = totalCorrect;
    accuracyElement.textContent = `${accuracy}%`;

    updateTopicStats();
    updateSessionHistory();
    createPerformanceChart();
}

function updateTopicStats() {
    const { topicStatsElement } = domElements;
    const currentSubject = currentState.currentSubject;
    const topics = subjectsData[currentSubject].topics;

    const topicStats = {};
    Object.keys(topics).forEach((topicId) => {
        topicStats[topicId] = {
            name: topics[topicId].name,
            answered: 0,
            correct: 0,
        };
    });

    if (currentState.quiz.answeredQuestions[currentSubject]) {
        currentState.quiz.answeredQuestions[currentSubject].forEach((answer) => {
            if (topicStats[answer.topic]) {
                topicStats[answer.topic].answered++;
                if (answer.isCorrect) {
                    topicStats[answer.topic].correct++;
                }
            }
        });
    }

    topicStatsElement.innerHTML = '';

    Object.keys(topicStats).forEach((topicId) => {
        const topic = topicStats[topicId];
        const accuracy = topic.answered > 0 ? Math.round((topic.correct / topic.answered) * 100) : 0;

        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
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

function updateSessionHistory() {
    const { historyTableBody } = domElements;
    const currentSubject = currentState.currentSubject;

    if (!currentState.progress.sessions[currentSubject]) {
        currentState.progress.sessions[currentSubject] = [];
    }

    historyTableBody.innerHTML = '';
    const sortedSessions = [...currentState.progress.sessions[currentSubject]].reverse();

    sortedSessions.forEach((session) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${session.date}</td>
            <td>${session.questionsAnswered}</td>
            <td>${session.correctAnswers}</td>
            <td>${session.accuracy}%</td>
        `;
        historyTableBody.appendChild(row);
    });

    if (sortedSessions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center;">Aucune session enregistrée</td>
        `;
        historyTableBody.appendChild(row);
    }
}

function createPerformanceChart() {
    const { performanceChart } = domElements;
    performanceChart.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p>Graphique de performance</p>
            <p style="color: #6c757d; font-size: 0.9rem;">(Utiliserait Chart.js dans une implémentation réelle)</p>
        </div>
    `;
}