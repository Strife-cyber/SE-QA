import { subjectsData, currentState } from './state.js';
import { domElements } from './dom.js';
import { saveState } from './persistence.js';

export function filterFlashcards() {
    const currentSubject = currentState.currentSubject;
    let cards = [...subjectsData[currentSubject].flashcardData];

    if (currentState.flashcards.selectedTopic !== 'all') {
        cards = cards.filter((card) => card.topic === currentState.flashcards.selectedTopic);
    }

    currentState.flashcards.filteredCards = cards;
}

export function markCard(status) {
    const { markKnownButton, markReviewButton } = domElements;
    const cards = currentState.flashcards.filteredCards;
    const currentIndex = currentState.flashcards.currentCardIndex;
    const cardId = cards[currentIndex].id;
    const currentSubject = currentState.currentSubject;

    if (!currentState.flashcards.knownCards[currentSubject]) {
        currentState.flashcards.knownCards[currentSubject] = [];
    }

    if (!currentState.flashcards.reviewCards[currentSubject]) {
        currentState.flashcards.reviewCards[currentSubject] = [];
    }

    if (status === 'known') {
        if (!currentState.flashcards.knownCards[currentSubject].includes(cardId)) {
            currentState.flashcards.knownCards[currentSubject].push(cardId);
        }
        const reviewIndex = currentState.flashcards.reviewCards[currentSubject].indexOf(cardId);
        if (reviewIndex !== -1) {
            currentState.flashcards.reviewCards[currentSubject].splice(reviewIndex, 1);
        }
        markKnownButton.classList.add('active');
        markReviewButton.classList.remove('active');
    } else if (status === 'review') {
        if (!currentState.flashcards.reviewCards[currentSubject].includes(cardId)) {
            currentState.flashcards.reviewCards[currentSubject].push(cardId);
        }
        const knownIndex = currentState.flashcards.knownCards[currentSubject].indexOf(cardId);
        if (knownIndex !== -1) {
            currentState.flashcards.knownCards[currentSubject].splice(knownIndex, 1);
        }
        markKnownButton.classList.remove('active');
        markReviewButton.classList.add('active');
    }

    saveState();
}

export function loadFlashcard() {
    const { flashcardFrontText, flashcardBackText, flashcardCounter, currentFlashcard, markKnownButton, markReviewButton } = domElements;
    const cards = currentState.flashcards.filteredCards;
    const currentIndex = currentState.flashcards.currentCardIndex;
    const currentSubject = currentState.currentSubject;

    if (cards.length === 0) {
        flashcardFrontText.textContent = 'Aucune carte mémoire disponible avec ces critères.';
        flashcardBackText.textContent = '';
        flashcardCounter.textContent = '0/0';
        currentFlashcard.classList.remove('flipped');
        markKnownButton.disabled = true;
        markReviewButton.disabled = true;
        return;
    }

    const card = cards[currentIndex];

    flashcardCounter.textContent = `${currentIndex + 1}/${cards.length}`;
    flashcardFrontText.textContent = card.front;
    flashcardBackText.textContent = card.back;
    currentFlashcard.classList.remove('flipped');
    markKnownButton.disabled = false;
    markReviewButton.disabled = false;

    if (currentState.flashcards.knownCards[currentSubject].includes(card.id)) {
        markKnownButton.classList.add('active');
    } else {
        markKnownButton.classList.remove('active');
    }

    if (currentState.flashcards.reviewCards[currentSubject].includes(card.id)) {
        markReviewButton.classList.add('active');
    } else {
        markReviewButton.classList.remove('active');
    }
}

export function prevFlashcard() {
    if (currentState.flashcards.currentCardIndex > 0) {
        currentState.flashcards.currentCardIndex--;
        loadFlashcard();
    }
}

export function nextFlashcard() {
    const cards = currentState.flashcards.filteredCards;
    const { flashcardFrontText, flashcardBackText, flashcardCounter, currentFlashcard, markKnownButton, markReviewButton } = domElements;

    if (currentState.flashcards.currentCardIndex < cards.length - 1) {
        currentState.flashcards.currentCardIndex++;
        loadFlashcard();
    } else {
        flashcardFrontText.textContent = 'Vous avez parcouru toutes les cartes mémoire.';
        flashcardBackText.textContent = '';
        flashcardCounter.textContent = 'Terminé';
        currentFlashcard.classList.remove('flipped');
        markKnownButton.disabled = true;
        markReviewButton.disabled = true;
    }
}