import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle, Award, X, AlertCircle } from 'lucide-react';
import { Quiz, QuizQuestion } from '../types';
import { studentApi } from '../services/api';

interface QuizRunnerModalProps {
  quizId: number;
  onClose: () => void;
  onSubmitted: () => void;
}

export const QuizRunnerModal: React.FC<QuizRunnerModalProps> = ({ quizId, onClose, onSubmitted }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; totalMarks: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins default

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, result]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getQuizDetails(quizId);
      if (res.success) {
        setQuiz(res.quiz);
        setQuestions(res.quiz.questions || []);
        setTimeLeft((res.quiz.time_limit_mins || 20) * 60);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await studentApi.submitQuiz(quizId, answers);
      if (res.success) {
        setResult({ score: res.score, totalMarks: res.totalMarks });
        onSubmitted();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center text-xs text-slate-500">
          Loading interactive quiz runner...
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                {quiz?.title}
              </h3>
              <p className="text-xs text-slate-400">Autograded via Factory Method Assessment Pattern</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!result && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Screen */}
        {result ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Quiz Completed!
            </h4>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Your Autograded Score: <span className="font-bold text-emerald-600 text-lg">{result.score} / {result.totalMarks}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your quiz response has been evaluated by the Factory Method Assessment Engine and stored in your grade history.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-700 transition-all"
            >
              Close Quiz Runner
            </button>
          </div>
        ) : (
          /* Question View */
          <div className="space-y-6">
            {/* Stepper */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{currentQ?.marks || 10} Marks</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {currentQ?.question_text}
              </h4>
            </div>

            {/* Options */}
            {currentQ?.question_type === 'MCQ' ? (
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <textarea
                  rows={3}
                  placeholder="Type your answer explanation here..."
                  value={answers[currentQ?.id] || ''}
                  onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                  className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            )}

            {/* Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
                >
                  {submitting ? 'Evaluating...' : 'Submit & Autograde'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
