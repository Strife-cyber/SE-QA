import { subjectsData, currentState } from './state.js';
import { domElements } from './dom.js';
import { saveState } from './persistence.js';

export function setupContentManagement() {
    const { questionTypeSelect, optionsInputContainer, keywordsContainer, addOptionBtn, saveQuestionBtn, saveFlashcardBtn, contentTypeBtns, addQuestionForm, addFlashcardForm, filterContentType, filterContentTopic, contentSearch } = domElements;

    updateContentManagementTopicSelectors();

    questionTypeSelect.addEventListener('change', () => {
        const questionType = questionTypeSelect.value;
        if (questionType === 'multiple-choice' || questionType === 'true-false') {
            optionsInputContainer.style.display = 'block';
            keywordsContainer.style.display = 'none';

            if (questionType === 'true-false') {
                optionsList.innerHTML = '';
                addOptionInput('Vrai');
                addOptionInput('Faux');
                addOptionBtn.disabled = true;
            } else {
                addOptionBtn.disabled = false;
                if (optionsList.children.length === 0) {
                    addOptionInput('');
                    addOptionInput('');
                }
            }
            updateCorrectAnswerSelect();
        } else if (questionType === 'short-answer') {
            optionsInputContainer.style.display = 'none';
            keywordsContainer.style.display = 'block';
        }
    });

    addOptionBtn.addEventListener('click', () => {
        addOptionInput('');
        updateCorrectAnswerSelect();
    });

    saveQuestionBtn.addEventListener('click', saveQuestion);
    saveFlashcardBtn.addEventListener('click', saveFlashcard);

    contentTypeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            contentTypeBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-type');
            if (type === 'question') {
                addQuestionForm.style.display = 'block';
                addFlashcardForm.style.display = 'none';
            } else if (type === 'flashcard') {
                addQuestionForm.style.display = 'none';
                addFlashcardForm.style.display = 'block';
            }
        });
    });

    filterContentType.addEventListener('change', updateContentList);
    filterContentTopic.addEventListener('change', updateContentList);
    contentSearch.addEventListener('input', updateContentList);

    updateContentList();
}

export function setupContentManagementListeners() {
    const { optionsList } = domElements;
    optionsList.addEventListener('click', (e) => {
        if (
            e.target.classList.contains('remove-option-btn') ||
            e.target.parentElement.classList.contains('remove-option-btn')
        ) {
            const button = e.target.classList.contains('remove-option-btn') ? e.target : e.target.parentElement;
            const optionInput = button.closest('.option-input');
            if (optionsList.children.length <= 2) {
                alert('Une question doit avoir au moins 2 options.');
                return;
            }
            optionInput.remove();
            updateCorrectAnswerSelect();
        }
    });
}

export function updateContentManagementTopicSelectors() {
    const { questionTopicSelect, flashcardTopicInput, filterContentTopic } = domElements;
    const currentSubject = currentState.currentSubject;
    const topics = subjectsData[currentSubject].topics;

    questionTopicSelect.innerHTML = '';
    flashcardTopicInput.innerHTML = '';
    filterContentTopic.innerHTML = '<option value="all">Tous les thèmes</option>';

    Object.keys(topics).forEach((topicId) => {
        const option1 = document.createElement('option');
        option1.value = topicId;
        option1.textContent = topics[topicId].name;
        questionTopicSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = topicId;
        option2.textContent = topics[topicId].name;
        flashcardTopicInput.appendChild(option2);

        const option3 = document.createElement('option');
        option3.value = topicId;
        option3.textContent = topics[topicId].name;
        filterContentTopic.appendChild(option3);
    });
}

function addOptionInput(value) {
    const { optionsList } = domElements;
    const optionInput = document.createElement('div');
    optionInput.className = 'option-input';
    optionInput.innerHTML = `
        <input type="text" placeholder="Option" value="${value}">
        <button class="remove-option-btn"><i class="fas fa-times"></i></button>
    `;
    optionsList.appendChild(optionInput);
}

function updateCorrectAnswerSelect() {
    const { correctAnswerSelect, optionsList } = domElements;
    correctAnswerSelect.innerHTML = '';
    const options = optionsList.querySelectorAll('input');
    options.forEach((option, index) => {
        const selectOption = document.createElement('option');
        selectOption.value = index;
        const optionText = option.value.trim() || `Option ${index + 1}`;
        selectOption.textContent = optionText;
        correctAnswerSelect.appendChild(selectOption);
    });
}

function saveQuestion() {
    const { questionTypeSelect, questionTopicSelect, questionTextInput, explanationInput, optionsList, correctAnswerSelect, keywordsInput } = domElements;
    const currentSubject = currentState.currentSubject;
    const questionType = questionTypeSelect.value;
    const topic = questionTopicSelect.value;
    const questionText = questionTextInput.value.trim();
    const explanation = explanationInput.value.trim();

    if (!topic) {
        alert('Veuillez sélectionner un thème.');
        return;
    }
    if (!questionText) {
        alert('Veuillez entrer une question.');
        return;
    }
    if (!explanation) {
        alert('Veuillez entrer une explication.');
        return;
    }

    const question = {
        id: Date.now(),
        topic: topic,
        question: questionText,
        explanation: explanation,
    };

    if (questionType === 'multiple-choice' || questionType === 'true-false') {
        const options = [];
        optionsList.querySelectorAll('input').forEach((input) => {
            options.push(input.value.trim());
        });

        if (options.some((opt) => !opt)) {
            alert('Veuillez remplir toutes les options.');
            return;
        }

        const correctAnswer = Number.parseInt(correctAnswerSelect.value);
        question.options = options;
        question.correctAnswer = correctAnswer;
    } else if (questionType === 'short-answer') {
        const keywords = keywordsInput.value
            .split(',')
            .map((keyword) => keyword.trim())
            .filter((keyword) => keyword);

        if (keywords.length === 0) {
            alert('Veuillez entrer au moins un mot-clé.');
            return;
        }

        question.correctAnswer = keywords;
    }

    if (!subjectsData[currentSubject].quizData[questionType]) {
        subjectsData[currentSubject].quizData[questionType] = [];
    }

    subjectsData[currentSubject].quizData[questionType].push(question);

    questionTextInput.value = '';
    explanationInput.value = '';
    if (questionType === 'multiple-choice') {
        optionsList.innerHTML = '';
        addOptionInput('');
        addOptionInput('');
        updateCorrectAnswerSelect();
    } else if (questionType === 'short-answer') {
        keywordsInput.value = '';
    }

    updateContentList();
    saveState();
    alert('Question enregistrée avec succès!');
}

function saveFlashcard() {
    const { flashcardTopicInput, flashcardFrontInput, flashcardBackInput } = domElements;
    const currentSubject = currentState.currentSubject;
    const topic = flashcardTopicInput.value;
    const front = flashcardFrontInput.value.trim();
    const back = flashcardBackInput.value.trim();

    if (!topic) {
        alert('Veuillez sélectionner un thème.');
        return;
    }
    if (!front) {
        alert('Veuillez entrer le texte du recto.');
        return;
    }
    if (!back) {
        alert('Veuillez entrer le texte du verso.');
        return;
    }

    const flashcard = {
        id: Date.now(),
        topic: topic,
        front: front,
        back: back,
    };

    if (!subjectsData[currentSubject].flashcardData) {
        subjectsData[currentSubject].flashcardData = [];
    }

    subjectsData[currentSubject].flashcardData.push(flashcard);

    flashcardFrontInput.value = '';
    flashcardBackInput.value = '';
    updateContentList();
    saveState();
    alert('Carte mémoire enregistrée avec succès!');
}

export function updateContentList() {
    const { filterContentType, filterContentTopic, contentSearch, contentList } = domElements;
    const currentSubject = currentState.currentSubject;
    const contentType = filterContentType.value;
    const topic = filterContentTopic.value;
    const searchText = contentSearch.value.toLowerCase();

    contentList.innerHTML = '';

    let items = [];
    if (contentType === 'questions') {
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
    } else if (contentType === 'flashcards') {
        subjectsData[currentSubject].flashcardData.forEach((flashcard) => {
            items.push({
                id: flashcard.id,
                topic: flashcard.topic,
                text: flashcard.front,
                isQuestion: false,
            });
        });
    }

    if (topic !== 'all') {
        items = items.filter((item) => item.topic === topic);
    }

    if (searchText) {
        items = items.filter((item) => item.text.toLowerCase().includes(searchText));
    }

    items.sort((a, b) => {
        if (a.topic !== b.topic) {
            return a.topic.localeCompare(b.topic);
        }
        return a.text.localeCompare(b.text);
    });

    items.forEach((item) => {
        const topicName = subjectsData[currentSubject].topics[item.topic].name;
        const itemElement = document.createElement('div');
        itemElement.className = 'content-item';
        itemElement.innerHTML = `
            <div class="content-item-text" title="${item.text}">
                <strong>${topicName}:</strong> ${item.text}
            </div>
            <div class="content-item-actions">
                <button class="edit-btn" data-id="${item.id}" data-is-question="${item.isQuestion}" data-type="${item.isQuestion ? item.type : ''}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${item.id}" data-is-question="${item.isQuestion}" data-type="${item.isQuestion ? item.type : ''}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        contentList.appendChild(itemElement);
    });

    contentList.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number.parseInt(btn.getAttribute('data-id'));
            const isQuestion = btn.getAttribute('data-is-question') === 'true';
            const type = btn.getAttribute('data-type');
            editContent(id, isQuestion, type);
        });
    });

    contentList.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number.parseInt(btn.getAttribute('data-id'));
            const isQuestion = btn.getAttribute('data-is-question') === 'true';
            const type = btn.getAttribute('data-type');
            deleteContent(id, isQuestion, type);
        });
    });

    if (items.length === 0) {
        contentList.innerHTML = '<div class="content-item">Aucun contenu trouvé</div>';
    }
}

function editContent(id, isQuestion, type) {
    const { contentTypeBtns, addQuestionForm, addFlashcardForm, questionTypeSelect, questionTopicSelect, questionTextInput, explanationInput, optionsList, correctAnswerSelect, keywordsInput, flashcardTopicInput, flashcardFrontInput, flashcardBackInput } = domElements;
    const currentSubject = currentState.currentSubject;

    if (isQuestion) {
        const question = subjectsData[currentSubject].quizData[type].find((q) => q.id === id);
        if (!question) {
            alert('Question non trouvée.');
            return;
        }

        contentTypeBtns.forEach((btn) => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === 'question') {
                btn.classList.add('active');
            }
        });

        addQuestionForm.style.display = 'block';
        addFlashcardForm.style.display = 'none';

        questionTypeSelect.value = type;
        questionTopicSelect.value = question.topic;
        questionTextInput.value = question.question;
        explanationInput.value = question.explanation;

        const event = new Event('change');
        questionTypeSelect.dispatchEvent(event);

        if (type === 'multiple-choice' || type === 'true-false') {
            optionsList.innerHTML = '';
            question.options.forEach((option) => {
                addOptionInput(option);
            });
            updateCorrectAnswerSelect();
            correctAnswerSelect.value = question.correctAnswer;
        } else if (type === 'short-answer') {
            keywordsInput.value = question.correctAnswer.join(', ');
        }

        deleteContent(id, true, type, false);
    } else {
        const flashcard = subjectsData[currentSubject].flashcardData.find((f) => f.id === id);
        if (!flashcard) {
            alert('Carte mémoire non trouvée.');
            return;
        }

        contentTypeBtns.forEach((btn) => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === 'flashcard') {
                btn.classList.add('active');
            }
        });

        addQuestionForm.style.display = 'none';
        addFlashcardForm.style.display = 'block';

        flashcardTopicInput.value = flashcard.topic;
        flashcardFrontInput.value = flashcard.front;
        flashcardBackInput.value = flashcard.back;

        deleteContent(id, false, '', false);
    }
}

function deleteContent(id, isQuestion, type, showConfirmation = true) {
    const currentSubject = currentState.currentSubject;

    if (showConfirmation && !confirm('Êtes-vous sûr de vouloir supprimer cet élément?')) {
        return;
    }

    if (isQuestion) {
        const index = subjectsData[currentSubject].quizData[type].findIndex((q) => q.id === id);
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
        alert('Élément supprimé avec succès!');
    }
}