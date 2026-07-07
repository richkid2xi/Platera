import { useState } from 'react';

const triviaQuestions = [
  {
    question: 'What is the main ingredient in Jollof rice?',
    options: ['Rice', 'Pasta', 'Potatoes', 'Bread'],
    correctIndex: 0,
    funFact: 'Jollof rice is a beloved dish across West Africa, and each country claims their version is the best!',
  },
  {
    question: 'What gives Waakye its distinctive dark color?',
    options: ['Food coloring', 'Millet leaves', 'Soy sauce', 'Cocoa powder'],
    correctIndex: 1,
    funFact: 'Millet leaves (or sorghum leaves) give Waakye its signature deep burgundy-brown color and a subtle earthy flavor.',
  },
  {
    question: 'Which country is famous for the "Jollof Wars" rivalry with Ghana?',
    options: ['Kenya', 'South Africa', 'Nigeria', 'Senegal'],
    correctIndex: 2,
    funFact: 'The friendly Jollof rivalry between Ghana and Nigeria is legendary — both claim to make the best Jollof, but we all know who wins!',
  },
  {
    question: 'What is Kelewele primarily made from?',
    options: ['Yam', 'Plantain', 'Cassava', 'Sweet potato'],
    correctIndex: 1,
    funFact: 'Kelewele is made from ripe plantains seasoned with ginger, cayenne, and spices, then fried to golden perfection.',
  },
  {
    question: 'What is the base of Fufu?',
    options: ['Wheat flour', 'Pounded cassava and plantain', 'Corn dough', 'Rice flour'],
    correctIndex: 1,
    funFact: 'Fufu is made by pounding boiled cassava and plantain until smooth and stretchy. It is a staple across West Africa!',
  },
  {
    question: 'Which Ghanaian drink is made from hibiscus flowers?',
    options: ['Chapman', 'Sobolo', 'Emudro', 'Pito'],
    correctIndex: 1,
    funFact: 'Sobolo (hibiscus tea) is not only refreshing but also packed with antioxidants and vitamin C!',
  },
  {
    question: 'What does "Akwaaba" mean?',
    options: ['Goodbye', 'Thank you', 'Welcome', 'Delicious'],
    correctIndex: 2,
    funFact: '"Akwaaba" means "Welcome" in Twi. It reflects the warmth and hospitality Ghanaians are famous for!',
  },
  {
    question: 'Red Red gets its name from...',
    options: ['The red pepper used', 'The red palm oil and plantains', 'The red tomatoes only', 'The chef who created it'],
    correctIndex: 1,
    funFact: 'Red Red is named for the vibrant red color from palm oil and the fried ripe plantains served alongside the bean stew.',
  },
];

export default function TriviaGame() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const question = triviaQuestions[questionIndex];

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === question.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    setShowResult(true);
    setTimeout(() => {
      if (questionIndex < triviaQuestions.length - 1) {
        setQuestionIndex((q) => q + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameStarted(true);
    setGameOver(false);
  };

  if (!gameStarted) {
    return (
      <div className="px-4">
        <div className="bg-background-100 rounded-2xl p-5 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent-100 flex items-center justify-center">
            <i className="ri-lightbulb-flash-line text-2xl text-accent-500"></i>
          </div>
          <h4 className="font-heading font-bold text-lg text-foreground-900 mb-1">
            Ghana Food Trivia
          </h4>
          <p className="font-body text-sm text-foreground-500 mb-4">
            Test your knowledge of Ghanaian cuisine while you wait!
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-accent-500 text-white font-heading font-bold text-sm py-3 px-6 rounded-xl active:scale-95 transition-transform"
          >
            Play Now
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="px-4">
        <div className="bg-accent-100 rounded-2xl p-5 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent-500 flex items-center justify-center">
            <i className="ri-trophy-line text-2xl text-white"></i>
          </div>
          <h4 className="font-heading font-bold text-lg text-foreground-900 mb-1">
            You scored {score}/{triviaQuestions.length}!
          </h4>
          <p className="font-body text-sm text-foreground-600 mb-4">
            {score === triviaQuestions.length
              ? 'Perfect score! You are a true Ghanaian food expert!'
              : score >= triviaQuestions.length / 2
                ? 'Great job! You know your Ghanaian food well!'
                : 'Keep learning — Ghanaian cuisine is full of amazing flavors!'}
          </p>
          <button
            onClick={resetGame}
            className="bg-accent-500 text-white font-heading font-bold text-sm py-2.5 px-5 rounded-xl active:scale-95 transition-transform"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="bg-background-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-label text-xs font-semibold text-accent-500">
            Question {questionIndex + 1}/{triviaQuestions.length}
          </span>
          <span className="font-label text-xs font-semibold text-foreground-600 bg-background-200 rounded-full px-2.5 py-1">
            Score: {score}
          </span>
        </div>

        {showResult && (
          <div
            className={`mb-3 p-3 rounded-xl text-sm font-body ${
              selectedAnswer === question.correctIndex
                ? 'bg-accent-100 text-accent-800'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            <p className="font-semibold mb-1">
              {selectedAnswer === question.correctIndex
                ? 'Correct!'
                : `Nope! The answer is: ${question.options[question.correctIndex]}`}
            </p>
            <p className="text-xs opacity-80">{question.funFact}</p>
          </div>
        )}

        <h4 className="font-heading font-semibold text-base text-foreground-900 mb-3">
          {question.question}
        </h4>

        <div className="space-y-2">
          {question.options.map((option, idx) => {
            let btnStyle = 'bg-background-200 text-foreground-800';
            if (selectedAnswer !== null) {
              if (idx === question.correctIndex) {
                btnStyle = 'bg-accent-500 text-white';
              } else if (idx === selectedAnswer) {
                btnStyle = 'bg-primary-500 text-white';
              } else {
                btnStyle = 'bg-background-200 text-foreground-400';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={`w-full p-3 rounded-xl font-body text-sm text-left transition-all duration-200 active:scale-[0.99] ${btnStyle} ${
                  selectedAnswer === null ? 'hover:bg-background-300' : ''
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
