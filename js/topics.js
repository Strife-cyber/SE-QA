import { subjectsData, currentState } from './state.js';
import { domElements, closeAllModals } from './dom.js';
import { saveState } from './persistence.js';
import { generateUniqueId } from './utils.js';
import { updateContentManagementTopicSelectors } from './content.js';

export function updateTopicSelectors() {
    const { topicSelectElement, flashcardTopicSelectElement } = domElements;
    const currentSubject = currentState.currentSubject;
    const topics = subjectsData[currentSubject].topics;

    topicSelectElement.innerHTML = '<option value="all">Tous</option>';
    flashcardTopicSelectElement.innerHTML = '<option value="all">Tous</option>';

    Object.keys(topics).forEach((topicId) => {
        const option1 = document.createElement('option');
        option1.value = topicId;
        option1.textContent = topics[topicId].name;
        topicSelectElement.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = topicId;
        option2.textContent = topics[topicId].name;
        flashcardTopicSelectElement.appendChild(option2);
    });

    updateContentManagementTopicSelectors();
}

export function saveNewTopic() {
    const { newTopicNameInput, newTopicDescInput } = domElements;
    const topicName = newTopicNameInput.value.trim();
    const topicDesc = newTopicDescInput.value.trim();

    if (topicName === '') {
        alert('Veuillez entrer un nom de thème.');
        return;
    }

    const currentSubject = currentState.currentSubject;
    const topicId = generateUniqueId(topicName);

    if (subjectsData[currentSubject].topics[topicId]) {
        alert('Un thème avec ce nom existe déjà.');
        return;
    }

    subjectsData[currentSubject].topics[topicId] = {
        name: topicName,
        description: topicDesc,
    };

    updateTopicSelectors();
    newTopicNameInput.value = '';
    newTopicDescInput.value = '';
    closeAllModals();
    saveState();
}