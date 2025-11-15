// Quiz Sistemi

const quizQuestions = [
    {
        question: 'Sürdürülebilir şehir planlamasının en önemli unsuru nedir?',
        options: [
            'Sadece ekonomik büyüme',
            'Çevre, ekonomi ve sosyal yaşam dengesi',
            'Sadece yeşil alanlar',
            'Sadece ulaşım'
        ],
        correct: 1,
        explanation: 'Sürdürülebilirlik, çevre, ekonomi ve sosyal yaşamın dengeli bir şekilde gelişmesini gerektirir.'
    },
    {
        question: 'Toplu taşıma yatırımlarının uzun vadeli faydası nedir?',
        options: [
            'Daha fazla araba satışı',
            'Trafik ve hava kirliliğinin azalması',
            'Daha fazla otopark',
            'Daha yüksek yakıt tüketimi'
        ],
        correct: 1,
        explanation: 'Toplu taşıma, özel araç kullanımını azaltarak hem trafiği hem de hava kirliliğini düşürür.'
    },
    {
        question: 'Yeşil alanların şehirlerdeki önemi nedir?',
        options: [
            'Sadece estetik',
            'Hava kalitesi, ısı adası etkisi ve yaşam kalitesi',
            'Sadece çocuklar için',
            'Hiçbir önemi yok'
        ],
        correct: 1,
        explanation: 'Yeşil alanlar havayı temizler, şehri serinletir ve yaşam kalitesini artırır.'
    },
    {
        question: 'Yenilenebilir enerji kaynaklarına örnek hangisidir?',
        options: [
            'Kömür',
            'Doğalgaz',
            'Güneş ve rüzgar',
            'Petrol'
        ],
        correct: 2,
        explanation: 'Güneş ve rüzgar enerjisi yenilenebilir, temiz enerji kaynaklarıdır.'
    },
    {
        question: 'Karbon emisyonunu azaltmanın en etkili yolu nedir?',
        options: [
            'Daha fazla araba kullanmak',
            'Fosil yakıtları artırmak',
            'Yenilenebilir enerji ve toplu taşıma',
            'Hiçbir şey yapmamak'
        ],
        correct: 2,
        explanation: 'Yenilenebilir enerji ve toplu taşıma, karbon emisyonunu önemli ölçüde azaltır.'
    },
    {
        question: 'Dikey mimari (yüksek binalar) hangi sorunu çözer?',
        options: [
            'Hava kirliliği',
            'Yatay yayılma ve yeşil alan kaybı',
            'Trafik',
            'Su kirliliği'
        ],
        correct: 1,
        explanation: 'Dikey mimari, şehrin yatay yayılmasını önleyerek yeşil alanları korur.'
    },
    {
        question: 'Geri dönüşümün çevreye faydası nedir?',
        options: [
            'Hiçbir faydası yok',
            'Atık miktarını azaltır ve kaynakları korur',
            'Sadece para kazandırır',
            'Sadece temizlik sağlar'
        ],
        correct: 1,
        explanation: 'Geri dönüşüm, atık miktarını azaltır ve doğal kaynakları korur.'
    },
    {
        question: 'Isı adası etkisi nedir?',
        options: [
            'Şehirlerin çevreden daha sıcak olması',
            'Şehirlerin daha soğuk olması',
            'Deniz seviyesinin yükselmesi',
            'Yağmur yağması'
        ],
        correct: 0,
        explanation: 'Beton ve asfalt ısıyı tutar, şehirleri çevreden daha sıcak yapar. Yeşil alanlar bunu azaltır.'
    },
    {
        question: 'Kentsel dönüşümün amacı nedir?',
        options: [
            'Sadece yeni binalar yapmak',
            'Eski, riskli binaları güvenli hale getirmek',
            'Yeşil alanları yok etmek',
            'Trafiği artırmak'
        ],
        correct: 1,
        explanation: 'Kentsel dönüşüm, eski ve riskli binaları depreme dayanıklı hale getirir.'
    },
    {
        question: 'Bisiklet yollarının faydası nedir?',
        options: [
            'Sadece sporcular için',
            'Çevre dostu ulaşım ve sağlıklı yaşam',
            'Araba trafiğini artırır',
            'Hiçbir faydası yok'
        ],
        correct: 1,
        explanation: 'Bisiklet yolları hem çevre dostu ulaşım sağlar hem de sağlıklı yaşamı teşvik eder.'
    }
];

let currentQuiz = null;
let quizScore = 0;
let quizAnswered = 0;

function startQuiz() {
    currentQuiz = {
        questions: [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5),
        currentIndex: 0,
        score: 0
    };
    
    showQuizQuestion();
}

function showQuizQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'quiz-modal';
    modal.innerHTML = `
        <div class="modal-content quiz-modal">
            <div class="quiz-header">
                <h3>🧠 Quiz Sorusu ${currentQuiz.currentIndex + 1}/${currentQuiz.questions.length}</h3>
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${(currentQuiz.currentIndex / currentQuiz.questions.length) * 100}%"></div>
                </div>
            </div>
            <div class="quiz-question">
                <p>${question.question}</p>
            </div>
            <div class="quiz-options">
                ${question.options.map((option, i) => `
                    <button class="quiz-option" onclick="answerQuiz(${i})">
                        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                        <span class="option-text">${option}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function answerQuiz(answerIndex) {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
        currentQuiz.score++;
        showToast('✅ Doğru cevap!', 'success');
        addXP(20);
        checkDailyQuest('answer_quiz', 1);
    } else {
        showToast('❌ Yanlış cevap!', 'error');
    }
    
    // Açıklamayı göster
    setTimeout(() => {
        showQuizExplanation(question, isCorrect);
    }, 1000);
}

function showQuizExplanation(question, isCorrect) {
    const modal = document.getElementById('quiz-modal');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="quiz-explanation ${isCorrect ? 'correct' : 'wrong'}">
            <div class="explanation-icon">${isCorrect ? '✅' : '❌'}</div>
            <h3>${isCorrect ? 'Doğru!' : 'Yanlış!'}</h3>
            <p class="correct-answer">Doğru cevap: ${question.options[question.correct]}</p>
            <p class="explanation-text">${question.explanation}</p>
            <button class="btn-primary" onclick="nextQuizQuestion()">
                ${currentQuiz.currentIndex < currentQuiz.questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
            </button>
        </div>
    `;
}

function nextQuizQuestion() {
    currentQuiz.currentIndex++;
    
    if (currentQuiz.currentIndex < currentQuiz.questions.length) {
        document.getElementById('quiz-modal').remove();
        showQuizQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    const percentage = (currentQuiz.score / currentQuiz.questions.length) * 100;
    let grade, message;
    
    if (percentage >= 80) {
        grade = 'Mükemmel!';
        message = 'Sürdürülebilirlik konusunda uzman seviyesindesin!';
        checkAchievement('quiz_master');
    } else if (percentage >= 60) {
        grade = 'İyi!';
        message = 'Güzel bir performans, biraz daha pratik yapabilirsin.';
    } else {
        grade = 'Geliştirilmeli';
        message = 'Daha fazla öğrenmen gerekiyor, tekrar dene!';
    }
    
    const modal = document.getElementById('quiz-modal');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="quiz-results">
            <div class="results-icon">🏆</div>
            <h2>${grade}</h2>
            <div class="score-circle">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" stroke-width="8"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" stroke-width="8"
                            stroke-dasharray="${percentage * 2.827} 282.7"
                            transform="rotate(-90 50 50)"/>
                </svg>
                <div class="score-text">
                    <span class="score-number">${currentQuiz.score}</span>
                    <span class="score-total">/ ${currentQuiz.questions.length}</span>
                </div>
            </div>
            <p>${message}</p>
            <div class="quiz-actions">
                <button class="btn-primary" onclick="closeQuizModal()">Kapat</button>
                <button class="btn-secondary" onclick="startQuiz()">Tekrar Dene</button>
            </div>
        </div>
    `;
}

function closeQuizModal() {
    const modal = document.getElementById('quiz-modal');
    if (modal) modal.remove();
}

// Tur sonunda quiz göster
function showTurnQuiz(turn) {
    if (Math.random() > 0.5) return; // %50 şans
    
    setTimeout(() => {
        const question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
        showQuizQuestion();
    }, 2000);
}
