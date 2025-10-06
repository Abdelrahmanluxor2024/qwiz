document.addEventListener('DOMContentLoaded', () => {
    // عناصر الواجهة
    const homeSection = document.getElementById('home');
    const quizSection = document.getElementById('quiz');
    const resultSection = document.getElementById('result');
    const instructionsModal = document.getElementById('instructions-modal');

    const startBtn = document.getElementById('start-btn');
    const confirmStartBtn = document.getElementById('confirm-start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const langToggleBtn = document.getElementById('lang-toggle');

    const questionEl = document.getElementById('question');
    const answersContainer = document.getElementById('answers-container');
    const resultMessageEl = document.getElementById('result-message');
    const feedbackContainer = document.getElementById('feedback-container');

    const timerText = document.getElementById('timer-text');
    const timerProgress = document.querySelector('.timer-progress');
    const FULL_DASH_ARRAY = 283;
    const TIME_LIMIT = 10;

    let currentQuestionIndex;
    let score;
    let timerInterval;
    let timeLeft;
    let questions = [];
    let userAnswers = []; // جديد: لتخزين إجابات المستخدم

    // قاموس الترجمة (مع إضافة نصوص الملاحظات)
    const translations = {
        ar: {
            title: "اختبار التركيز",
            main_title: "اختبار التركيز 🧠",
            subtitle: "اعرف مدى حاجتك للنوم في أقل من دقيقة!",
            start_btn: "ابدأ الاختبار",
            restart_btn: "أعد الاختبار",
            result_title: "النتيجة",
            positive_result: "تركيزك جامد، كمل يومك كده 👏🧠",
            negative_result: "يبدو إنك محتاج ترتاح ساعتين كمان. 😴",
            lang_btn_text: "English",
            instructions_title: "ملاحظات قبل البدء",
            instructions_text: "سيتم عرض 5 أسئلة سريعة. أمامك 10 ثوانٍ فقط للإجابة على كل سؤال. حاول الإجابة بصدق وسرعة لقياس تركيزك الفعلي.",
            confirm_start_btn: "تأكيد والبدء",
            your_answer: "إجابتك",
            correct_answer: "الإجابة الصحيحة",
            not_answered: "لم تتم الإجابة",
            questions: [
                { question: "كم عدد ساعات النوم التي حصلت عليها الليلة الماضية؟", answers: [ { text: "أكثر من 8 ساعات", correct: true }, { text: "6-8 ساعات", correct: true }, { text: "4-6 ساعات", correct: false }, { text: "أقل من 4 ساعات", correct: false } ] },
                { question: "ما هو لون زر 'ابدأ الاختبار'؟", answers: [ { text: "أزرق", correct: false }, { text: "أخضر", correct: false }, { text: "أصفر", correct: true }, { text: "أحمر", correct: false } ] },
                { question: "في أي وقت من اليوم تشعر بأكبر قدر من النشاط؟", answers: [ { text: "الصباح الباكر", correct: true }, { text: "فترة الظهيرة", correct: false }, { text: "بعد الظهر", correct: false }, { text: "في المساء", correct: true } ] },
                { question: "هل تشعر بالنعاس أثناء قراءة هذا السؤال؟", answers: [ { text: "إطلاقاً", correct: true }, { text: "قليلاً", correct: false }, { text: "نعم، جداً", correct: false }, { text: "كنت نائماً واستيقظت للتو", correct: false } ] },
                { question: "ما هو ناتج 5 * 3 - 2؟", answers: [ { text: "10", correct: false }, { text: "13", correct: true }, { text: "25", correct: false }, { text: "5", correct: false } ] }
            ]
        },
        en: {
            title: "Focus Test",
            main_title: "Focus Test 🧠",
            subtitle: "Find out how much sleep you need in less than a minute!",
            start_btn: "Start Test",
            restart_btn: "Retake Test",
            result_title: "Result",
            positive_result: "Your focus is sharp, keep it up! 👏🧠",
            negative_result: "It seems you need a couple more hours of rest. 😴",
            lang_btn_text: "العربية",
            instructions_title: "Instructions Before Starting",
            instructions_text: "You will be shown 5 quick questions. You have only 10 seconds to answer each one. Try to answer honestly and quickly to measure your actual focus.",
            confirm_start_btn: "Confirm & Start",
            your_answer: "Your Answer",
            correct_answer: "Correct Answer",
            not_answered: "Not Answered",
            questions: [
                { question: "How many hours of sleep did you get last night?", answers: [ { text: "More than 8 hours", correct: true }, { text: "6-8 hours", correct: true }, { text: "4-6 hours", correct: false }, { text: "Less than 4 hours", correct: false } ] },
                { question: "What is the color of the 'Start Test' button?", answers: [ { text: "Blue", correct: false }, { text: "Green", correct: false }, { text: "Yellow", correct: true }, { text: "Red", correct: false } ] },
                { question: "At what time of day do you feel most energetic?", answers: [ { text: "Early Morning", correct: true }, { text: "Midday", correct: false }, { text: "Afternoon", correct: false }, { text: "Evening", correct: true } ] },
                { question: "Do you feel sleepy while reading this question?", answers: [ { text: "Not at all", correct: true }, { text: "A little", correct: false }, { text: "Yes, very", correct: false }, { text: "I was sleeping and just woke up", correct: false } ] },
                { question: "What is the result of 5 * 3 - 2?", answers: [ { text: "10", correct: false }, { text: "13", correct: true }, { text: "25", correct: false }, { text: "5", correct: false } ] }
            ]
        }
    };
    
    let currentLang = 'ar';

    function setLanguage(lang) {
        currentLang = lang;
        const langData = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (langData[key]) element.textContent = langData[key];
        });
        langToggleBtn.textContent = langData.lang_btn_text;
        questions = langData.questions;
    }

    startBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('hidden');
    });
    
    confirmStartBtn.addEventListener('click', () => {
        instructionsModal.classList.add('hidden');
        startQuiz();
    });

    restartBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        homeSection.classList.remove('hidden');
    });
    
    langToggleBtn.addEventListener('click', () => {
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    });

    function startQuiz() {
        homeSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = []; // إعادة تعيين سجل الإجابات
        setNextQuestion();
    }

    function setNextQuestion() {
        resetState();
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
            startTimer();
        } else {
            showResult();
        }
    }

    function startTimer() {
        timeLeft = TIME_LIMIT;
        timerText.textContent = timeLeft;
        setCircleDasharray(timeLeft);
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            setCircleDasharray(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                selectAnswer(null); // الوقت انتهى
            }
        }, 1000);
    }
    
    function setCircleDasharray(time) {
        const timeFraction = time / TIME_LIMIT;
        const rawTimeFraction = timeFraction - (1 / TIME_LIMIT) * (1 - timeFraction);
        const dashoffset = rawTimeFraction * FULL_DASH_ARRAY;
        timerProgress.style.strokeDashoffset = dashoffset;
    }

    function showQuestion(questionData) {
        questionEl.innerText = questionData.question;
        questionData.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn');
            if (answer.correct) {
                button.dataset.correct = true;
            }
            button.addEventListener('click', () => selectAnswer(button));
            answersContainer.appendChild(button);
        });
    }

    function resetState() {
        while (answersContainer.firstChild) {
            answersContainer.removeChild(answersContainer.firstChild);
        }
        timerProgress.style.transition = 'none';
        timerProgress.style.strokeDashoffset = FULL_DASH_ARRAY;
        setTimeout(() => { timerProgress.style.transition = 'stroke-dashoffset 1s linear'; }, 20);
    }

    function selectAnswer(selectedButton) {
        clearInterval(timerInterval);
        const correct = selectedButton ? selectedButton.dataset.correct === 'true' : false;
        if (correct) {
            score++;
        }
        // تخزين إجابة المستخدم
        userAnswers.push({
            question: questions[currentQuestionIndex].question,
            selected: selectedButton ? selectedButton.innerText : null,
            correctAnswer: questions[currentQuestionIndex].answers.find(a => a.correct).text,
            isCorrect: correct
        });

        // تعطيل جميع الأزرار وتحديد الإجابة المختارة
        Array.from(answersContainer.children).forEach(button => {
            button.disabled = true;
            if (button === selectedButton) {
                button.classList.add('selected'); // فقط فئة للإشارة للاختيار
            }
        });
        // الانتقال للسؤال التالي بعد فترة قصيرة
        setTimeout(() => {
            currentQuestionIndex++;
            setNextQuestion();
        }, 1000); 
    }

    function showResult() {
        quizSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        const langData = translations[currentLang];

        if (score >= questions.length / 2) {
            resultMessageEl.textContent = langData.positive_result;
        } else {
            resultMessageEl.textContent = langData.negative_result;
        }

        // عرض تفاصيل الإجابات
        feedbackContainer.innerHTML = ''; // مسح النتائج السابقة
        userAnswers.forEach((answer, index) => {
            const feedbackItem = document.createElement('div');
            feedbackItem.classList.add('feedback-item');
            
            const answerText = answer.selected ? `"${answer.selected}"` : langData.not_answered;
            const feedbackClass = answer.isCorrect ? 'correct-feedback' : 'wrong-feedback';

            let html = `<h4>${index + 1}. ${answer.question}</h4>`;
            html += `<p class="${feedbackClass}">${langData.your_answer}: ${answerText}</p>`;
            
            if (!answer.isCorrect) {
                html += `<p>${langData.correct_answer}: "${answer.correctAnswer}"</p>`;
            }

            feedbackItem.innerHTML = html;
            feedbackContainer.appendChild(feedbackItem);
        });
    }

    // تهيئة اللغة عند تحميل الصفحة
    setLanguage(currentLang);
});