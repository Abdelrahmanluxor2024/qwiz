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
    let userAnswers = []; // لتخزين إجابات المستخدم ومقارنتها

    // قاموس الترجمة مع هيكل الأسئلة الجديد
    // تم تغيير 'correct' إلى 'value' لإعطاء نقاط لكل إجابة
    // الأسئلة المعرفية: الإجابة الصحيحة تأخذ 1، والبقية 0
    // الأسئلة التقييمية: الإجابات التي تدل على تركيز عالٍ تأخذ نقاطاً أعلى
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
                { type: 'assessment', question: "كم عدد ساعات النوم التي حصلت عليها الليلة الماضية؟", answers: [ { text: "أكثر من 8 ساعات", value: 1 }, { text: "6-8 ساعات", value: 1 }, { text: "4-6 ساعات", value: 0 }, { text: "أقل من 4 ساعات", value: 0 } ] },
                { type: 'knowledge', question: "ما هو لون زر 'ابدأ الاختبار'؟", answers: [ { text: "أزرق", value: 0 }, { text: "أخضر", value: 0 }, { text: "أصفر", value: 1 }, { text: "أحمر", value: 0 } ] },
                { type: 'assessment', question: "في أي وقت من اليوم تشعر بأكبر قدر من النشاط؟", answers: [ { text: "الصباح الباكر", value: 1 }, { text: "فترة الظهيرة", value: 0 }, { text: "بعد الظهر", value: 0 }, { text: "في المساء", value: 1 } ] },
                { type: 'assessment', question: "هل تشعر بالنعاس أثناء قراءة هذا السؤال؟", answers: [ { text: "إطلاقاً", value: 1 }, { text: "قليلاً", value: 0 }, { text: "نعم، جداً", value: 0 }, { text: "كنت نائماً واستيقظت للتو", value: 0 } ] },
                { type: 'knowledge', question: "ما هو ناتج 5 * 3 - 2؟", answers: [ { text: "10", value: 0 }, { text: "13", value: 1 }, { text: "25", value: 0 }, { text: "5", value: 0 } ] }
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
                { type: 'assessment', question: "How many hours of sleep did you get last night?", answers: [ { text: "More than 8 hours", value: 1 }, { text: "6-8 hours", value: 1 }, { text: "4-6 hours", value: 0 }, { text: "Less than 4 hours", value: 0 } ] },
                { type: 'knowledge', question: "What is the color of the 'Start Test' button?", answers: [ { text: "Blue", value: 0 }, { text: "Green", value: 0 }, { text: "Yellow", value: 1 }, { text: "Red", value: 0 } ] },
                { type: 'assessment', question: "At what time of day do you feel most energetic?", answers: [ { text: "Early Morning", value: 1 }, { text: "Midday", value: 0 }, { text: "Afternoon", value: 0 }, { text: "Evening", value: 1 } ] },
                { type: 'assessment', question: "Do you feel sleepy while reading this question?", answers: [ { text: "Not at all", value: 1 }, { text: "A little", value: 0 }, { text: "Yes, very", value: 0 }, { text: "I was sleeping and just woke up", value: 0 } ] },
                { type: 'knowledge', question: "What is the result of 5 * 3 - 2?", answers: [ { text: "10", value: 0 }, { text: "13", value: 1 }, { text: "25", value: 0 }, { text: "5", value: 0 } ] }
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
        userAnswers = [];
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
        setCircleDasharray();
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            setCircleDasharray();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                selectAnswer(null); // الوقت انتهى
            }
        }, 1000);
    }
    
    function setCircleDasharray() {
        const timeFraction = timeLeft / TIME_LIMIT;
        // صيغة محسنة قليلاً للحركة عند البداية
        const dashoffset = (1 - timeFraction) * FULL_DASH_ARRAY;
        timerProgress.style.strokeDashoffset = dashoffset;
    }

    function showQuestion(questionData) {
        questionEl.innerText = questionData.question;
        questionData.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn');
            // تخزين القيمة (النقاط) في الزر مباشرة
            button.dataset.value = answer.value;
            button.addEventListener('click', () => selectAnswer(button));
            answersContainer.appendChild(button);
        });
    }

    function resetState() {
        while (answersContainer.firstChild) {
            answersContainer.removeChild(answersContainer.firstChild);
        }
        // إعادة تعيين حركة المؤقت بشكل صحيح
        timerProgress.style.transition = 'none'; // إزالة الانتقال مؤقتًا
        timerProgress.style.strokeDashoffset = 0; // إعادة التعيين الكامل
        // إعادة إجبار المتصفح على تطبيق التغيير قبل إعادة الانتقال
        void timerProgress.offsetWidth; 
        timerProgress.style.transition = 'stroke-dashoffset 1s linear';
    }

    function selectAnswer(selectedButton) {
        clearInterval(timerInterval);

        const currentQuestion = questions[currentQuestionIndex];
        const selectedValue = selectedButton ? parseInt(selectedButton.dataset.value) : 0;
        
        // زيادة النقاط بناءً على قيمة الإجابة
        if (selectedValue > 0) {
            score++;
        }

        // البحث عن الإجابة الصحيحة للأسئلة المعرفية فقط
        const correctAnswerObj = currentQuestion.type === 'knowledge' ? currentQuestion.answers.find(a => a.value === 1) : null;

        userAnswers.push({
            question: currentQuestion.question,
            type: currentQuestion.type,
            selected: selectedButton ? selectedButton.innerText : null,
            correctAnswer: correctAnswerObj ? correctAnswerObj.text : null,
            isCorrect: selectedValue > 0
        });

        Array.from(answersContainer.children).forEach(button => {
            button.disabled = true;
            if (button === selectedButton) {
                button.classList.add(selectedValue > 0 ? 'correct' : 'wrong');
            }
            // إظهار الإجابة الصحيحة إذا كانت موجودة ولم يتم اختيارها
            if (correctAnswerObj && button.dataset.value === '1' && button !== selectedButton) {
                 button.classList.add('correct');
            }
        });

        setTimeout(() => {
            currentQuestionIndex++;
            setNextQuestion();
        }, 1200); // زيادة المدة قليلاً لرؤية الإجابة
    }

    function showResult() {
        quizSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        const langData = translations[currentLang];

        // النتيجة بناءً على عدد النقاط (3 أو أكثر يعتبر جيداً)
        if (score >= 3) {
            resultMessageEl.textContent = langData.positive_result;
        } else {
            resultMessageEl.textContent = langData.negative_result;
        }

        feedbackContainer.innerHTML = '';
        userAnswers.forEach((answer, index) => {
            const feedbackItem = document.createElement('div');
            feedbackItem.classList.add('feedback-item');
            
            const answerText = answer.selected ? `"${answer.selected}"` : langData.not_answered;
            const feedbackClass = answer.isCorrect ? 'correct-feedback' : 'wrong-feedback';

            let html = `<h4>${index + 1}. ${answer.question}</h4>`;
            html += `<p class="${feedbackClass}">${langData.your_answer}: ${answerText}</p>`;
            
            // عرض الإجابة الصحيحة فقط للأسئلة المعرفية وإذا كانت الإجابة خاطئة
            if (answer.type === 'knowledge' && !answer.isCorrect) {
                html += `<p>${langData.correct_answer}: "${answer.correctAnswer}"</p>`;
            }

            feedbackItem.innerHTML = html;
            feedbackContainer.appendChild(feedbackItem);
        });
    }

    // تهيئة اللغة عند تحميل الصفحة
    setLanguage(currentLang);
});