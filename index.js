const Page = {
    state: {
        currentQuestion: 0,
        questions: null,
        answers: [],
    },

    ui: {
        quizQuestionare: document.querySelector('.js-quiz-questionare'),
        quizResult: document.querySelector('.js-quiz-result'),
        quizProgress: document.querySelector('.js-quiz-progressbar'),
        questionsList: document.querySelector('.js-questions-list'),
        questions: [],
        goButton: document.querySelector('.js-go-button'),
        backButton: document.querySelector('.js-back-button'),
        error: document.querySelector('.js-error'),
    },

    loadQuestions: async () => {
        const jsonData = await fetch('./questions.json');
        return await jsonData.json();
    },

    renderQuestions: () => {
        const fragment = document.createDocumentFragment();

        Page.state.questions.forEach((questionProps, questionId) => {
            Page.ui.questions[questionId] = document.createElement('div');
            Page.ui.questions[questionId].classList.add('question');

            if (questionId !== Page.state.currentQuestion)
                Page.ui.questions[questionId].classList.add('hidden');

            const questionTitle = document.createElement('h2');
            questionTitle.textContent = questionProps.title;
            questionTitle.classList.add('question__title');
            Page.ui.questions[questionId].append(questionTitle);

            const answersList = document.createElement('div');
            answersList.classList.add('question__answers-list');

            questionProps.answers.forEach((answer, answerId) => {
                const answerLabel = document.createElement('label');
                answerLabel.classList.add('question__answer');
                const answerRadio = document.createElement('input');
                answerRadio.classList.add('question__answer-input');
                answerRadio.type = 'radio';
                answerRadio.name = 'question' + questionId;
                answerRadio.value = answerId.toString();
                answerLabel.append(answerRadio);
                answerLabel.innerHTML += answer;

                answerLabel.onchange = () => {
                    Page.state.answers[questionId] = answerId;
                    Page.ui.error.classList.add('hidden');
                }

                answersList.append(answerLabel);
            });

            Page.ui.questions[questionId].append(answersList);
            fragment.append(Page.ui.questions[questionId]);
        });

        Page.ui.questionsList.append(fragment);
    },

    updateProgress: () => {
        const procent = Page.state.currentQuestion === null ? 100 : Page.state.currentQuestion / Page.state.questions.length * 100;
        Page.ui.quizProgress.style.width = procent + '%';
    },

    showPreviousQuestion: () => {
        Page.ui.error.classList.add('hidden');

        Page.ui.questions[Page.state.currentQuestion--].classList.add('hidden');
        Page.ui.questions[Page.state.currentQuestion].classList.remove('hidden');

        if (Page.state.currentQuestion === 0)
            Page.ui.backButton.classList.add('hidden');

        Page.ui.goButton.textContent = 'Next question';
    },

    showNextQuestion: () => {
        Page.ui.questions[Page.state.currentQuestion++].classList.add('hidden');

        if (Page.state.currentQuestion > 0)
            Page.ui.backButton.classList.remove('hidden');

        if (Page.state.currentQuestion + 1 === Page.state.questions.length)
            Page.ui.goButton.textContent = 'End quiz';

        Page.ui.questions[Page.state.currentQuestion].classList.remove('hidden');
    },

    showResult: () => {
        Page.state.currentQuestion = null;

        Page.ui.quizQuestionare.classList.add('hidden');
        Page.ui.quizResult.classList.remove('hidden');
    },

    initListeners: () => {
        Page.ui.goButton.addEventListener('click', () => {
            if (Page.state.answers[Page.state.currentQuestion] === undefined) {
                Page.ui.error.classList.remove('hidden');
                return;
            }

            Page.state.currentQuestion + 1 < Page.state.questions.length ? Page.showNextQuestion() : Page.showResult();

            Page.updateProgress();
        });

        Page.ui.backButton.addEventListener('click', () => {
            Page.showPreviousQuestion();
            Page.updateProgress();
        });
    },

    onInit: async () => {
        Page.state.questions = await Page.loadQuestions();
        Page.renderQuestions();
        Page.initListeners();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Page.onInit();
});
