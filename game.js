export default class MillionaireGame {

    constructor() {
        this.questions = [];
        this.questionIdx = -1;
        this.questionTimer = null;
        this.answerTimer = null;
        this.moneyAnimation = null;
        this.displayMoney = 0;
        this.money = 0;
        this.el = {};
        this.times = {
            question: 30000,
            beforeMoneyAnimation: 1800,
            afterShowingAnswer: 5000
        };
    }

    init(questions) {
        this.questions = questions;
        this.findElements();
        this.registerEventListeners();
    }

    findElements() {
        this.el.main = document.querySelector('#main');
        this.el.mainOuter = document.querySelector('#main-outer');

        this.el.question = document.querySelector('#question h1');
        this.el.answers = document.querySelectorAll('.answer');
        this.el.answerTexts = document.querySelectorAll('.answer > p');
        this.el.tooltips = document.querySelectorAll('.tooltip i');
        this.el.money = document.querySelector('#money p');
        this.el.progress = document.querySelector('#progress');

        this.el.startScreen = document.querySelector('#start-screen');
        this.el.startBtn = document.querySelector('#start-screen .button');

        this.el.gameOverScreen = document.querySelector('#game-over-screen');
        this.el.gameOverBtn = document.querySelector('#game-over-screen .button');
        this.el.gameOverMoney = document.querySelector('#game-over-screen .money');

        this.el.endScreen = document.querySelector('#end-screen');
        this.el.endScreenBtn = document.querySelector('#end-screen .button');
    }

    registerEventListeners() {
        this.el.answers.forEach(el => {
            el.addEventListener('click', (event) => {
                this.selectAnswer(event, el);
            });
        });

        this.el.tooltips.forEach(el => {
            el.addEventListener('click', (event) => {
                event.stopPropagation();
                this.checkAnswer();
            });
        });

        this.el.startBtn.addEventListener('click', () => this.startGame(this.el.startScreen));
        this.el.gameOverBtn.addEventListener('click', () => this.startGame(this.el.gameOverScreen));
        this.el.endScreenBtn.addEventListener('click', () => this.startGame(this.el.endScreen));
    }

    startGame(fromScreen) {
        this.money = 0;
        this.displayMoney = 0;
        this.el.money.innerHTML = "$0";

        fromScreen.classList.remove('shown');
        this.el.mainOuter.classList.remove('in-overlay');

        this.questionIdx = -1;
        this.loadQuestion();

        setTimeout(() => {
            this.el.main.style.overflow = 'visible';
        }, 1000);
    }

    loadQuestion() {
        this.answerTimer = null;

        this.questionIdx++;
        if (this.questionIdx >= this.questions.length) {
            this.victory();
            return;
        }

        this.resetAnswerStyles();
        this.updateQuestionAndAnswers();
        this.restartProgress();
    }

    resetAnswerStyles() {
        let selected = document.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }

        this.el.answers.forEach(el => {
            el.classList.remove('correct');
            el.classList.remove('wrong');
        });
    }

    updateQuestionAndAnswers() {
        this.el.question.innerHTML = this.questions[this.questionIdx].question;
        this.el.answerTexts.forEach((el, i) => el.innerHTML = this.questions[this.questionIdx].answers[i])
    }

    restartProgress() {
        let progress = document.querySelector('#progress');
        this.el.progress.classList.remove('progress-animate');
        void progress.offsetWidth;
        this.el.progress.classList.add('progress-animate');
        this.questionTimer = window.setTimeout(() => this.checkAnswer(), this.times.question);
    }

    selectAnswer(event, answerEl) {
        if (this.answerTimer) {
            return;
        }

        this.el.answers.forEach(el => {
            el.classList.remove('selected');
        });
        answerEl.classList.add('selected');
    }

    checkAnswer() {
        if (this.questionTimer) {
            window.clearTimeout(this.questionTimer);
            this.el.progress.classList.remove('progress-animate');
        }

        let selected = document.querySelector('.selected');
        let answer = -1;
        if (selected) {
            answer = parseInt(selected.dataset.index);
        }

        this.markRightAndWrong();

        if (answer == this.questions[this.questionIdx].correct) {
            this.money += this.questions[this.questionIdx].value;
            let moneyIncrement = Math.floor((this.money - this.displayMoney) / (3200 / 32));
            setTimeout(() => {
                this.moneyAnimation = setInterval(() => this.animateMoney(moneyIncrement), 32);
            }, this.times.beforeMoneyAnimation);

            this.answerTimer = setTimeout(() => this.loadQuestion(), this.times.afterShowingAnswer);
        } else {
            this.answerTimer = setTimeout(() => this.gameOver(), this.times.afterShowingAnswer);
        }
    }

    markRightAndWrong() {
        this.el.answers.forEach(el => {
            if (el.dataset.index == this.questions[this.questionIdx].correct) {
                el.classList.add('correct');
            } else {
                el.classList.add('wrong');
            }
        });
    }

    animateMoney(increment) {
        this.displayMoney += increment;

        if (this.displayMoney >= this.money) {
            this.displayMoney = this.money;
            clearInterval(this.moneyAnimation);
            this.moneyAnimation = null;
        }

        this.el.money.innerHTML = "$" + this.displayMoney;
    }

    gameOver() {
        this.el.gameOverMoney.innerHTML = "$" + this.money;
        this.el.main.style.overflow = 'hidden';
        this.el.mainOuter.classList.add('in-overlay');
        this.el.gameOverScreen.classList.add('shown');
    }

    victory() {
        this.el.main.style.overflow = 'hidden';
        this.el.mainOuter.classList.add('in-overlay', 'hide-content');
        this.el.endScreen.classList.add('shown');
    }

}
