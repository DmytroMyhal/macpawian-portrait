const clusters = [
    {
        name: "Productive Ironman",
        description: "You appreciate your time and personal boundaries. That helps you achieve a lot in life and take new challenges. In fact, every true Ironman knows — family first."
    },
    {
        name: "Sophisticated hedonist",
        description: "Like a true MacPawian, you’re a 100% foodie. You also know stuff about a decent rest and how to live it up. Mastering the balance between social life and being by yourself is definitely your strong suit."
    },
    {
        name: "Clubby nerd",
        description: "Van Gogh, Mozart and Dickens would be your dream team by the day, while at night you’re likely to be spotted dancing on the dance floor shaking up champagne. They say that still waters run deep and you’re a proof!"
    },
    {
        name: "Wild and free",
        description: "You know what gluten free means and how to sort the garbage. You enjoy being a loner, but did you know your laugh is infectious? Smile!"
    }
];

const Page = {
    state: {
        currentQuestion: 0,
        questions: null,
        answers: [],
        scores: new Array(4).fill(0)
    },

    ui: {
        startButton: document.querySelector('.js-start-button'),
        quizStartPage: document.querySelector('.js-start-page'),
        quizQuestionare: document.querySelector('.js-quiz-questionare'),
        quizResult: document.querySelector('.js-quiz-result'),
        quizResultName: document.querySelector('.js-quiz-result-name'),
        quizResultDescription: document.querySelector('.js-quiz-result-description'),
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
            Page.ui.questions[questionId].classList.add('visibility-animated');

            if (questionId !== Page.state.currentQuestion)
                Page.ui.questions[questionId].classList.add('hidden');

            const questionTitle = document.createElement('h2');
            questionTitle.textContent = questionProps.title;
            questionTitle.classList.add('question__title');
            Page.ui.questions[questionId].append(questionTitle);

            const answersList = document.createElement('div');
            answersList.classList.add('question__answers-list');

            questionProps.answers.forEach((answerProps, answerId) => {
                const answerLabel = document.createElement('label');
                answerLabel.classList.add('question__answer');
                answerLabel.setAttribute('for', 'answer' + questionId + answerId);
                const answerRadio = document.createElement('input');
                answerRadio.classList.add('question__answer-input');
                answerRadio.id = "answer" + questionId + answerId;
                answerRadio.type = 'radio';
                answerRadio.name = 'question' + questionId;
                answerRadio.value = answerId.toString();
                answerLabel.innerHTML += answerProps.value;

                answerRadio.onchange = () => {
                    Page.state.answers[questionId] = answerId;
                    Page.ui.error.classList.add('hidden');
                }

                answersList.append(answerRadio);
                answersList.append(answerLabel);
            });

            Page.ui.questions[questionId].append(answersList);
            fragment.append(Page.ui.questions[questionId]);
        });

        Page.ui.questionsList.append(fragment);
    },

    startQuiz: () => {
        Page.ui.quizStartPage.classList.add('hidden');
        Page.ui.quizQuestionare.classList.remove('hidden');
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

        Page.ui.goButton.textContent = 'Next';

        const selectedAnswerId = Page.state.answers[Page.state.currentQuestion];
        Page.state.questions[Page.state.currentQuestion].answers[selectedAnswerId].scores.forEach((score, clusterId) =>
            Page.state.scores[clusterId] -= score
        );
    },

    showNextQuestion: () => {
        const selectedAnswerId = Page.state.answers[Page.state.currentQuestion];
        Page.state.questions[Page.state.currentQuestion].answers[selectedAnswerId].scores.forEach((score, clusterId) =>
            Page.state.scores[clusterId] += score
        );

        Page.ui.questions[Page.state.currentQuestion++].classList.add('hidden');

        if (Page.state.currentQuestion > 0)
            Page.ui.backButton.classList.remove('hidden');

        if (Page.state.currentQuestion + 1 === Page.state.questions.length)
            Page.ui.goButton.textContent = 'End quiz';

        Page.ui.questions[Page.state.currentQuestion].classList.remove('hidden');
    },

    getClusterId: () => {
        let maxValue = Page.state.scores[0];
        let maxValueId = 0;
        Page.state.scores.forEach((clusterScore, clusterId) => {
            if (clusterScore > maxValue) {
                maxValue = clusterScore;
                maxValueId = clusterId;
            }
        });
        return maxValueId;
    },

    showResult: () => {
        console.log(Page.state.scores);

        Page.state.currentQuestion = null;

        Page.ui.quizQuestionare.classList.add('hidden');
        Page.ui.quizResult.classList.remove('hidden');

        const clusterId = Page.getClusterId();

        Page.ui.quizResultName.textContent = clusters[clusterId].name;
        Page.ui.quizResultDescription.textContent = clusters[clusterId].description;
    },

    initListeners: () => {
        Page.ui.startButton.addEventListener('click', Page.startQuiz);

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
