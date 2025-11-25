import React, { useState, useEffect } from 'react';

interface Country {
  name: { common: string };
  flags: { png: string };
}

type Level = 'easy' | 'medium' | 'hard';

const FlagGame: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[]>([]);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [usedCountries, setUsedCountries] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
      const data = await response.json();
      
      const validCountries = data.filter((country: Country) => 
        country.flags?.png && country.name?.common
      );
      
      setCountries(validCountries);
      setLoading(false);
      setShowLevelSelector(true);
    } catch (error) {
      console.error('Error loading countries:', error);
      setLoading(false);
    }
  };

  const getRandomCountries = (correct: Country, count = 4): Country[] => {
    const optionsList = [correct];
    const available = countries.filter(c => c.name.common !== correct.name.common);
    
    while (optionsList.length < count && available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const country = available.splice(randomIndex, 1)[0];
      optionsList.push(country);
    }
    
    return shuffleArray(optionsList);
  };

  const shuffleArray = (array: Country[]): Country[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const nextQuestion = () => {
    const maxQuestions = { easy: 5, medium: 10, hard: 15 };
    
    if (currentQuestion >= maxQuestions[level!]) {
      setGameOver(true);
      return;
    }
    
    const available = countries.filter(c => !usedCountries.includes(c.name.common));
    
    if (available.length === 0) {
      setGameOver(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const newCountry = available[randomIndex];
    
    setCurrentCountry(newCountry);
    setUsedCountries([...usedCountries, newCountry.name.common]);
    setOptions(getRandomCountries(newCountry));
    setSelectedAnswer(null);
    setShowNext(false);
    setCurrentQuestion(currentQuestion + 1);
    setTimeLeft(7);
  };

  const selectAnswer = (selectedCountry: Country) => {
    const isCorrect = selectedCountry.name.common === currentCountry?.name.common;
    
    setSelectedAnswer(selectedCountry.name.common);
    setShowNext(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const startGame = (selectedLevel: Level) => {
    const maxQuestions = { easy: 5, medium: 10, hard: 15 };
    setLevel(selectedLevel);
    setTotalQuestions(maxQuestions[selectedLevel]);
    setShowLevelSelector(false);
    setScore(0);
    setCurrentQuestion(0);
    setUsedCountries([]);
    setSelectedAnswer(null);
    setShowNext(false);
    setGameOver(false);
  };
  
  const resetGame = () => {
    setShowLevelSelector(true);
    setLevel(null);
    setScore(0);
    setCurrentQuestion(0);
    setTotalQuestions(0);
    setUsedCountries([]);
    setSelectedAnswer(null);
    setShowNext(false);
    setGameOver(false);
    setCurrentCountry(null);
    setTimeLeft(7);
  };

  useEffect(() => {
    if (countries.length > 0 && level && !currentCountry) {
      nextQuestion();
    }
  }, [countries, level]);

  useEffect(() => {
    if (currentCountry && !selectedAnswer && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !selectedAnswer) {
      setShowNext(true);
    }
  }, [timeLeft, currentCountry, selectedAnswer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="text-xl text-gray-600">Memuat bendera...</div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const levelNames = { easy: 'MUDAH', medium: 'SEDANG', hard: 'SULIT' };
    const percentage = Math.round((score/totalQuestions) * 100);
    let medal = '';
    
    if (percentage >= 90) medal = '🥇';
    else if (percentage >= 70) medal = '🥈';
    else if (percentage >= 50) medal = '🥉';
    else medal = '😢';
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold mb-4">{medal} Game Selesai!</h1>
          <div className="text-lg mb-4 text-gray-600">
            Level: {levelNames[level!]}
          </div>
          <div className="text-5xl font-bold mb-4 text-blue-600">
            {score}/{totalQuestions}
          </div>
          <div className="text-xl mb-6 text-gray-600">
            Akurasi: {Math.round((score/totalQuestions) * 100)}%
          </div>
          <button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Main Lagi
          </button>
        </div>
      </div>
    );
  }
  
  if (showLevelSelector) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-lg w-full mx-4">
          <h1 className="text-2xl font-bold mb-6">🏁 Pilih Level Kesulitan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => startGame('easy')}
              className="p-6 border-2 border-green-400 rounded-xl hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">😊</div>
              <div className="font-bold text-lg">MUDAH</div>
              <div className="text-gray-600">5 Bendera</div>
            </button>
            
            <button
              onClick={() => startGame('medium')}
              className="p-6 border-2 border-yellow-400 rounded-xl hover:bg-yellow-50 transition-colors"
            >
              <div className="text-2xl mb-2">🤔</div>
              <div className="font-bold text-lg">SEDANG</div>
              <div className="text-gray-600">10 Bendera</div>
            </button>
            
            <button
              onClick={() => startGame('hard')}
              className="p-6 border-2 border-red-400 rounded-xl hover:bg-red-50 transition-colors"
            >
              <div className="text-2xl mb-2">😤</div>
              <div className="font-bold text-lg">SULIT</div>
              <div className="text-gray-600">15 Bendera</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-lg w-full mx-4">
        <div className={`text-4xl font-bold mb-4 ${timeLeft <= 3 ? 'text-red-500' : 'text-blue-500'}`}>
          ⏰ {timeLeft}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">🏁 Tebak Bendera</h1>
        
        <div className="text-lg mb-4 text-gray-600">
          Soal <span className="font-semibold text-blue-600">{currentQuestion}</span> dari {totalQuestions}
          <div className="text-sm mt-1">
            Skor: {score} | Level: {level === 'easy' ? 'MUDAH' : level === 'medium' ? 'SEDANG' : 'SULIT'}
          </div>
        </div>

        {currentCountry && (
          <>
            <div className="mb-6">
              <img
                src={currentCountry.flags.png}
                alt="Bendera negara"
                className="w-48 h-32 object-cover border-4 border-gray-200 rounded-lg mx-auto shadow-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {options.map((country, index) => {
                let buttonClass = "p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer";
                
                if (selectedAnswer) {
                  if (country.name.common === currentCountry.name.common) {
                    buttonClass += " bg-green-500 text-white border-green-500";
                  } else if (country.name.common === selectedAnswer) {
                    buttonClass += " bg-red-500 text-white border-red-500";
                  } else {
                    buttonClass += " opacity-50 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !selectedAnswer && selectAnswer(country)}
                    disabled={!!selectedAnswer}
                    className={buttonClass}
                  >
                    {country.name.common}
                  </button>
                );
              })}
            </div>

            {showNext && (
              <button
                onClick={nextQuestion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Soal Berikutnya
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FlagGame;