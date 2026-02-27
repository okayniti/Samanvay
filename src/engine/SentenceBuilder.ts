export type RecognitionMode = 'auto' | 'fingerspell' | 'word-signs';

export interface SentenceState {
    currentWord: string;
    words: string[];
    mode: 'letter' | 'word';
    fullSentence: string;
}

const WORD_BOUNDARY_MS = 1500;
const SENTENCE_END_MS = 3000;
const LETTER_COOLDOWN_MS = 600;

let state: SentenceState = {
    currentWord: '',
    words: [],
    mode: 'letter',
    fullSentence: '',
};

let lastInputTime = 0;
let lastLetter = '';
let lastLetterTime = 0;
let onUpdateCallback: ((state: SentenceState) => void) | null = null;

function notify() {
    state.fullSentence = [...state.words, state.currentWord].filter(Boolean).join(' ');
    if (onUpdateCallback) onUpdateCallback({ ...state });
}

export function onSentenceUpdate(cb: (state: SentenceState) => void) {
    onUpdateCallback = cb;
}

export function addLetter(letter: string) {
    const now = Date.now();

    if (letter === lastLetter && now - lastLetterTime < LETTER_COOLDOWN_MS) return;

    if (lastInputTime > 0 && now - lastInputTime > WORD_BOUNDARY_MS && state.currentWord) {
        state.words.push(state.currentWord);
        state.currentWord = '';
    }

    if (lastInputTime > 0 && now - lastInputTime > SENTENCE_END_MS && state.words.length > 0) {
        state.words = [];
        state.currentWord = '';
    }

    state.currentWord += letter;
    state.mode = 'letter';
    lastInputTime = now;
    lastLetter = letter;
    lastLetterTime = now;
    notify();
}

export function addWord(word: string) {
    const now = Date.now();

    if (state.currentWord) {
        state.words.push(state.currentWord);
        state.currentWord = '';
    }

    if (lastInputTime > 0 && now - lastInputTime > SENTENCE_END_MS) {
        state.words = [];
    }

    state.words.push(word);
    state.mode = 'word';
    lastInputTime = now;
    notify();
}

export function backspace() {
    if (state.currentWord.length > 0) {
        state.currentWord = state.currentWord.slice(0, -1);
    } else if (state.words.length > 0) {
        state.currentWord = state.words.pop() || '';
    }
    notify();
}

export function addSpace() {
    if (state.currentWord) {
        state.words.push(state.currentWord);
        state.currentWord = '';
        notify();
    }
}

export function clearSentence() {
    state = {
        currentWord: '',
        words: [],
        mode: 'letter',
        fullSentence: '',
    };
    lastInputTime = 0;
    lastLetter = '';
    lastLetterTime = 0;
    notify();
}

export function getSentenceState(): SentenceState {
    return { ...state };
}

export function checkAutoSpace(): boolean {
    if (!state.currentWord) return false;
    const now = Date.now();
    if (lastInputTime > 0 && now - lastInputTime > WORD_BOUNDARY_MS) {
        state.words.push(state.currentWord);
        state.currentWord = '';
        notify();
        return true;
    }
    return false;
}
