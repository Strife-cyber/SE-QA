# Exam Preparation Application

![Exam Prep App](https://via.placeholder.com/1200x630?text=Exam+Preparation+Application)

A beautiful, interactive web application for creating and studying flashcards and quizzes. Perfect for students, teachers, and anyone looking to enhance their learning experience with a modern, customizable study tool.

## ✨ Features

- **Multiple Question Types**:
  - Multiple choice questions
  - True/False questions
  - Short answer questions
  - Practical questions with code examples
  
- **Flashcards System**:
  - Create and manage flashcards
  - Track known vs. review cards
  - Flip animation for interactive learning
  
- **Progress Tracking**:
  - Visual statistics on your learning progress
  - Topic-by-topic performance analysis
  - Session history to track improvement over time
  
- **Content Management**:
  - Create and edit questions and flashcards
  - Organize content by subjects and topics
  - Import/export functionality for sharing or backup
  
- **Modern UI/UX**:
  - Beautiful Scarlight theme with vibrant gradients
  - Dark/Light mode toggle
  - Responsive design for all devices
  - Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of HTML, CSS, and JavaScript (for customization)

### Installation

1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/yourusername/exam-prep-app.git
   cd exam-prep-app
   \`\`\`

2. **Open the application**:
   - Simply open the `index.html` file in your web browser
   - Alternatively, you can use a local development server:
     \`\`\`bash
     # Using Python
     python -m http.server
     
     # Using Node.js with http-server
     npx http-server
     \`\`\`

3. **Start studying!**

## 📖 Usage Guide

### Creating a New Subject

1. Click the "Ajouter un sujet" button next to the subject selector
2. Enter a name and optional description for your subject
3. Click "Enregistrer"

### Adding Topics to a Subject

1. Select your subject from the dropdown
2. Click the "+" button next to the topic selector
3. Enter a name and optional description for your topic
4. Click "Enregistrer"

### Creating Questions

1. Go to the "Gérer le contenu" tab
2. Ensure "Questions" is selected in the content type selector
3. Choose a question type (Multiple choice, True/False, Short answer, or Pratique)
4. Select a topic for your question
5. Fill in the question text, options (for multiple choice), and explanation
6. Click "Enregistrer la question"

### Creating Flashcards

1. Go to the "Gérer le contenu" tab
2. Click on "Cartes mémoire" in the content type selector
3. Select a topic for your flashcard
4. Enter the front (question) and back (answer) text
5. Click "Enregistrer la carte"

### Taking a Quiz

1. Go to the "Quiz" tab
2. Select your desired topic and question type
3. Answer the questions and check your answers
4. View your progress and statistics in the "Progression" tab

### Studying with Flashcards

1. Go to the "Cartes mémoire" tab
2. Select your desired topic
3. Click on the flashcard to flip between question and answer
4. Mark cards as "Je connais" or "À revoir" to track your progress

### Importing/Exporting Data

1. Use the "Exporter" button to save your current data as a JSON file
2. Use the "Importer des données" button to load data from a JSON file

## 🎨 Customization

### Changing Colors

The application uses CSS variables for theming. To change the color scheme:

1. Open `style.css`
2. Locate the `:root` section at the top
3. Modify the hue values for primary, secondary, and accent colors

\`\`\`css
:root {
  /* Base Colors */
  --primary-hue: 330;    /* Change this for primary color */
  --secondary-hue: 260;  /* Change this for secondary color */
  --accent-hue: 200;     /* Change this for accent color */
  
  /* Rest of the variables... */
}
\`\`\`

### Adding Custom Question Types

To add a new question type:

1. Update the HTML to include the new type in select elements
2. Modify the JavaScript to handle the new question type in:
   - `saveQuestion()`
   - `loadQuestion()`
   - `checkAnswer()`
3. Add appropriate styling in CSS

## 🔧 Technologies Used

- **HTML5** - Structure and content
- **CSS3** - Styling with custom properties and animations
- **JavaScript** - Core functionality and interactivity
- **LocalStorage API** - Data persistence
- **Chart.js** - For progress visualization
- **Highlight.js** - For code syntax highlighting

## 📁 Project Structure

\`\`\`
exam-prep-app/
├── index.html          # Main HTML file
├── style.css           # Styles and theme
├── script.js           # Core application logic
├── theme-switch.js     # Dark/light mode functionality
├── data.json           # (Optional) Initial data
└── README.md           # This file
\`\`\`

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Font Awesome for icons
- Google Fonts for typography
- Highlight.js for code syntax highlighting
- Chart.js for data visualization

---

Made with ❤️ for better learning experiences

