# 📚 Exam Practice Platform

A beautiful, modern web application for practicing exam questions with instant feedback and detailed results analysis. Perfect for students preparing for computer science and other technical exams.

## ✨ Features

### 🎯 Core Functionality
- **Multiple Question Papers**: Organize questions by subject/topic papers
- **Exercise-Based Practice**: Break down each paper into manageable exercises
- **Interactive Testing**: Clean, distraction-free test interface
- **Real-time Progress Tracking**: Visual progress bar showing answered questions
- **Smart Submission**: Warns before submitting with unanswered questions
- **Instant Results**: Immediate scoring and detailed feedback

### 📊 Results & Analytics
- **Visual Score Display**: Circular progress indicator showing percentage score
- **Detailed Breakdown**: Summary of correct, incorrect, and unanswered questions
- **Question-by-Question Review**: See which questions you got right/wrong with correct answers highlighted
- **Filterable Results**: View all questions, only correct, or only incorrect answers
- **PDF Export**: Download results for offline review
- **Retake Option**: Instantly retake tests to improve your score

### 🎨 Design
- **Modern UI**: Beautiful dark theme with gradient accents
- **Smooth Animations**: Engaging micro-interactions throughout
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Color-Coded Feedback**: Green for correct, red for incorrect, gray for unanswered
- **Premium Aesthetics**: Professional design with glassmorphism effects

## 🚀 Quick Start

### Prerequisites
- Python 3.x (for running local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download this repository**
   ```bash
   cd exam-practice-website
   ```

2. **Start the local server**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

That's it! No dependencies to install, no build process needed.

## 📖 How to Use

1. **Select a Question Paper**: Choose from available papers on the home screen
2. **Pick an Exercise**: Select an exercise to practice
3. **Start the Test**: Review the question count and click "Start Test"
4. **Answer Questions**: Click on any option to select your answer
5. **Submit**: Click "Submit Test" when done (or leave questions for later)
6. **Review Results**: See your score and review each question's correct answer

## 📁 Project Structure

```
exam-practice-website/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css         # All styling and animations
├── js/
│   └── app.js            # Application logic and state management
├── data/
│   └── questions.json    # Question database
├── extract_pdf.py        # Script to extract text from PDF question papers
├── parse_questions.py    # Script to parse extracted text into JSON format
└── README.md            # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS Grid, Flexbox, animations
- **Vanilla JavaScript**: No frameworks - pure JS for maximum performance
- **SVG**: Circular progress indicators
- **Python**: PDF extraction and question parsing scripts

## ➕ Adding Your Own Questions

### Method 1: Using PDF Extraction (Recommended)

1. **Place your PDF** in the project directory

2. **Extract text from PDF**:
   ```bash
   python3 extract_pdf.py your-questions.pdf
   ```
   This creates `your-questions.txt`

3. **Parse into JSON format**:
   ```bash
   python3 parse_questions.py your-questions.txt
   ```
   This updates `data/questions.json`

### Method 2: Manual JSON Editing

Edit `data/questions.json` following this structure:

```json
{
  "files": [
    {
      "name": "Your Paper Name",
      "exercises": [
        {
          "name": "Exercise 1",
          "totalQuestions": 2,
          "questions": [
            {
              "id": "unique-id-1",
              "question": "What is 2+2?",
              "options": [
                "3",
                "4",
                "5",
                "6"
              ],
              "correctAnswer": 1
            }
          ]
        }
      ]
    }
  ]
}
```

**Important Notes**:
- `correctAnswer` is zero-indexed (0 = first option, 1 = second option, etc.)
- Each question needs a unique `id`
- `totalQuestions` should match the number of questions in the array

## 🎓 Use Cases

- **Exam Preparation**: Practice for computer science, engineering, or other technical exams
- **Self-Assessment**: Test your knowledge and identify weak areas
- **Teaching**: Create custom quizzes for students
- **Interview Prep**: Practice technical interview questions

## 🔧 Customization

### Changing Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #6366f1;    /* Main purple */
    --secondary-color: #8b5cf6;  /* Light purple */
    --success-color: #10b981;    /* Green */
    --error-color: #ef4444;      /* Red */
    /* ... more colors */
}
```

### Modifying UI Elements
- **Layouts**: Edit HTML structure in `index.html`
- **Styling**: Modify classes in `css/styles.css`
- **Behavior**: Update logic in `js/app.js`

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🐛 Known Issues

- PDF export opens in new window (requires manual print-to-PDF)
- Circular score animation may not work in older browsers

## 🤝 Contributing

Feel free to fork this project and customize it for your needs! Some ideas for enhancements:

- [ ] Timer functionality for timed tests
- [ ] User accounts and progress tracking
- [ ] Randomize question order
- [ ] Difficulty levels
- [ ] Explanations for correct answers
- [ ] Performance analytics over time

## 📄 License

This project is open source and available for educational purposes.

## 💡 Tips for Best Results

1. **Regular Practice**: Take tests multiple times to reinforce learning
2. **Review Mistakes**: Always review incorrect answers to understand why
3. **Track Progress**: Use the PDF export to keep records of your improvement
4. **Focus on Weak Areas**: Use the filter feature to review only incorrect answers

## 🙋 Support

If you encounter any issues or have questions:
1. Check the console for error messages (F12 in browser)
2. Verify `questions.json` is properly formatted
3. Ensure Python server is running on port 8000

---

**Made with ❤️ for students everywhere**

Happy practicing! 🎉
