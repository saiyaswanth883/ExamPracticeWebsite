// Exam Practice Platform - Main Application

// State Management
let state = {
    data: null,
    currentFile: null,
    currentExercise: null,
    userAnswers: {},
    testStartTime: null,
    results: null
};

// Initialize Application
async function init() {
    try {
        const response = await fetch('data/questions.json');
        state.data = await response.json();
        showFileSelection();
    } catch (error) {
        console.error('Failed to load questions:', error);
        alert('Failed to load question data. Please check the console for details.');
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// File Selection Screen
function showFileSelection() {
    showScreen('fileSelectionScreen');
    const container = document.getElementById('fileCards');
    container.innerHTML = '';

    state.data.files.forEach(file => {
        const totalQuestions = file.exercises.reduce((sum, ex) => sum + ex.totalQuestions, 0);

        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-card-icon">📄</div>
            <div class="file-card-title">${file.name}</div>
            <div class="file-card-meta">
                ${file.exercises.length} Exercise${file.exercises.length > 1 ? 's' : ''} • 
                ${totalQuestions} Question${totalQuestions > 1 ? 's' : ''}
            </div>
        `;
        card.addEventListener('click', () => selectFile(file));
        container.appendChild(card);
    });
}

// Select File and Show Exercises
function selectFile(file) {
    state.currentFile = file;
    showExerciseSelection();
}

function showExerciseSelection() {
    showScreen('exerciseSelectionScreen');
    document.getElementById('selectedFileName').textContent = state.currentFile.name;

    const container = document.getElementById('exerciseCards');
    container.innerHTML = '';

    state.currentFile.exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `
            <div class="exercise-card-title">${exercise.name}</div>
            <div class="exercise-card-meta">
                ${exercise.totalQuestions} Question${exercise.totalQuestions > 1 ? 's' : ''}
            </div>
        `;
        card.addEventListener('click', () => selectExercise(exercise));
        container.appendChild(card);
    });
}

// Select Exercise and Show Test Start
function selectExercise(exercise) {
    state.currentExercise = exercise;
    showTestStart();
}

function showTestStart() {
    showScreen('testStartScreen');
    document.getElementById('exerciseName').textContent = state.currentExercise.name;
    document.getElementById('questionCount').textContent = state.currentExercise.totalQuestions;
}

// Start Test
function startTest() {
    state.userAnswers = {};
    state.testStartTime = Date.now();
    showTestScreen();
}

function showTestScreen() {
    showScreen('testScreen');

    const totalQuestions = state.currentExercise.totalQuestions;
    document.getElementById('totalQuestions').textContent = totalQuestions;

    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    state.currentExercise.questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        container.appendChild(questionCard);
    });

    updateProgress();
}

function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.questionId = question.id;

    const optionsHtml = question.options.map((option, optIndex) => `
        <div class="option" data-option="${optIndex}">
            <div class="option-radio"></div>
            <div class="option-text">${option}</div>
        </div>
    `).join('');

    card.innerHTML = `
        <div class="question-header">
            <div class="question-number">${index + 1}</div>
            <div class="question-text">${question.question}</div>
        </div>
        <div class="options">
            ${optionsHtml}
        </div>
    `;

    // Add click handlers for options
    card.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => selectOption(question.id, option));
    });

    return card;
}

function selectOption(questionId, optionElement) {
    const card = optionElement.closest('.question-card');
    card.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    optionElement.classList.add('selected');

    const optionIndex = parseInt(optionElement.dataset.option);
    state.userAnswers[questionId] = optionIndex;

    updateProgress();
}

function updateProgress() {
    const totalQuestions = state.currentExercise.totalQuestions;
    const answeredCount = Object.keys(state.userAnswers).length;

    const percentage = (answeredCount / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('currentQuestion').textContent = answeredCount;
}

// Submit Test
function submitTest() {
    const totalQuestions = state.currentExercise.totalQuestions;
    const answeredCount = Object.keys(state.userAnswers).length;

    if (answeredCount < totalQuestions) {
        const unanswered = totalQuestions - answeredCount;
        if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) {
            return;
        }
    }

    calculateResults();
    showResults();
}

function calculateResults() {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const questionResults = state.currentExercise.questions.map(question => {
        const userAnswer = state.userAnswers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        const isAnswered = userAnswer !== undefined;

        if (!isAnswered) {
            unanswered++;
        } else if (isCorrect) {
            correct++;
        } else {
            incorrect++;
        }

        return {
            question,
            userAnswer,
            isCorrect,
            isAnswered
        };
    });

    const totalQuestions = state.currentExercise.totalQuestions;
    const percentage = Math.round((correct / totalQuestions) * 100);

    state.results = {
        correct,
        incorrect,
        unanswered,
        totalQuestions,
        percentage,
        questionResults
    };
}

function showResults() {
    showScreen('resultsScreen');

    // Scroll to top of page to show results summary
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const { correct, incorrect, unanswered, percentage } = state.results;

    // Update score display
    document.getElementById('scorePercentage').textContent = percentage;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('unansweredCount').textContent = unanswered;

    // Animate score circle
    setTimeout(() => {
        const circumference = 339.292;
        const offset = circumference - (percentage / 100) * circumference;
        document.getElementById('scoreCircle').style.strokeDashoffset = offset;
    }, 100);

    // Show detailed results
    showResultDetails('all');
}

function showResultDetails(filter) {
    const container = document.getElementById('resultsDetails');
    container.innerHTML = '';

    state.results.questionResults.forEach((result, index) => {
        if (filter === 'correct' && !result.isCorrect) return;
        if (filter === 'incorrect' && (result.isCorrect || !result.isAnswered)) return;

        const card = createResultCard(result, index);
        container.appendChild(card);
    });
}

function createResultCard(result, index) {
    const { question, userAnswer, isCorrect, isAnswered } = result;

    const card = document.createElement('div');
    card.className = 'question-card result-question';

    const optionsHtml = question.options.map((option, optIndex) => {
        let className = 'option';

        // Highlight correct answer
        if (optIndex === question.correctAnswer) {
            className += ' correct';
        }
        // Highlight incorrect user answer
        else if (isAnswered && optIndex === userAnswer && !isCorrect) {
            className += ' incorrect';
        }
        // Mark selected answer
        if (optIndex === userAnswer) {
            className += ' selected';
        }

        return `
            <div class="${className}">
                <div class="option-radio"></div>
                <div class="option-text">${option}</div>
            </div>
        `;
    }).join('');

    const statusIcon = !isAnswered ? '−' : (isCorrect ? '✓' : '✗');
    const statusColor = !isAnswered ? 'var(--warning-color)' : (isCorrect ? 'var(--success-color)' : 'var(--error-color)');

    card.innerHTML = `
        <div class="question-header">
            <div class="question-number" style="background: ${statusColor};">${statusIcon}</div>
            <div class="question-text">${question.question}</div>
        </div>
        <div class="options">
            ${optionsHtml}
        </div>
    `;

    return card;
}

// Filter Results
function filterResults(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    showResultDetails(filter);
}

// Download Results as PDF
async function downloadPDF() {
    // Create a simple HTML-based PDF using window.print
    const printWindow = window.open('', '', 'width=800,height=600');

    const { correct, incorrect, unanswered, totalQuestions, percentage } = state.results;

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Results - ${state.currentFile.name} - ${state.currentExercise.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #333;
                }
                h1 {
                    color: #6366f1;
                    border-bottom: 3px solid #6366f1;
                    padding-bottom: 10px;
                }
                .summary {
                    background: #f3f4f6;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-top: 15px;
                }
                .stat {
                    text-align: center;
                }
                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #6366f1;
                }
                .stat-label {
                    font-size: 14px;
                    color: #666;
                    margin-top: 5px;
                }
                .question {
                    margin: 30px 0;
                    padding: 20px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    break-inside: avoid;
                }
                .question-header {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .question-number {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                    flex-shrink: 0;
                }
                .correct-badge { background: #10b981; }
                .incorrect-badge { background: #ef4444; }
                .unanswered-badge { background: #f59e0b; }
                .question-text {
                    flex: 1;
                    font-weight: 600;
                    font-size: 16px;
                }
                .options {
                    margin-left: 45px;
                }
                .option {
                    padding: 10px;
                    margin: 8px 0;
                    border-radius: 6px;
                }
                .option-correct {
                    background: #d1fae5;
                    border: 2px solid #10b981;
                    font-weight: 600;
                }
                .option-incorrect {
                    background: #fee2e2;
                    border: 2px solid #ef4444;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>Test Results</h1>
            <p><strong>Paper:</strong> ${state.currentFile.name}</p>
            <p><strong>Exercise:</strong> ${state.currentExercise.name}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            
            <div class="summary">
                <h2>Summary</h2>
                <div class="summary-grid">
                    <div class="stat">
                        <div class="stat-value">${percentage}%</div>
                        <div class="stat-label">Score</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" style="color: #10b981;">${correct}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" style="color: #ef4444;">${incorrect}</div>
                        <div class="stat-label">Incorrect</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" style="color: #f59e0b;">${unanswered}</div>
                        <div class="stat-label">Unanswered</div>
                    </div>
                </div>
            </div>

            <h2>Detailed Results</h2>
    `;

    state.results.questionResults.forEach((result, index) => {
        const { question, userAnswer, isCorrect, isAnswered } = result;

        const badgeClass = !isAnswered ? 'unanswered-badge' : (isCorrect ? 'correct-badge' : 'incorrect-badge');
        const badgeIcon = !isAnswered ? '−' : (isCorrect ? '✓' : '✗');

        htmlContent += `
            <div class="question">
                <div class="question-header">
                    <div class="question-number ${badgeClass}">${badgeIcon}</div>
                    <div class="question-text">Q${index + 1}. ${question.question}</div>
                </div>
                <div class="options">
        `;

        question.options.forEach((option, optIndex) => {
            let optionClass = 'option';
            let label = String.fromCharCode(65 + optIndex); // A, B, C, D

            if (optIndex === question.correctAnswer) {
                optionClass += ' option-correct';
                label += ' ✓ (Correct Answer)';
            } else if (isAnswered && optIndex === userAnswer && !isCorrect) {
                optionClass += ' option-incorrect';
                label += ' ✗ (Your Answer)';
            }

            htmlContent += `<div class="${optionClass}">${label}) ${option}</div>`;
        });

        htmlContent += `
                </div>
            </div>
        `;
    });

    htmlContent += `
            <p class="no-print" style="text-align: center; margin-top: 40px;">
                <button onclick="window.print();" style="padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
                    Print / Save as PDF
                </button>
            </p>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.getElementById('backToFiles').addEventListener('click', showFileSelection);
    document.getElementById('backToExercises').addEventListener('click', showExerciseSelection);

    // Test actions
    document.getElementById('startTestBtn').addEventListener('click', startTest);
    document.getElementById('submitTestBtn').addEventListener('click', submitTest);
    document.getElementById('cancelTestBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel the test? Your progress will be lost.')) {
            showTestStart();
        }
    });

    // Results actions
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            filterResults(filter);
        });
    });

    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('retakeTestBtn').addEventListener('click', () => {
        startTest();
    });

    // Add SVG gradient for score circle
    const svg = document.querySelector('.score-circle svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'scoreGradient');
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Initialize
    init();
});
