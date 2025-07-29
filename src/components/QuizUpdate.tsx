"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Save, ArrowLeft, Edit3, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface EditableQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT' | 'LONG_TEXT' | 'NUMERICAL';
  options?: string[];
  points: number;
  correctAnswer?: string;
  studentAnswer?: string;
}

interface EditableQuiz {
  id: string;
  title: string;
  timeLimit: number;
  questions: EditableQuestion[];
  category: string;
  grade: string;
  subject: string;
  totalMarks: number;
  attemptId?: string;
}

interface QuizEditorProps {
  quizId: string;
  username?: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quizId, username = 'student' }) => {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<EditableQuiz | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [editedQuestions, setEditedQuestions] = useState<Set<string>>(new Set());
  const router = useRouter();

  
  function capitalizeSentences(text: string) {
    return text.split(/([.!?]\s*)/)
      .map((segment, index) => {
        if (index % 2 === 0) {
          return segment.charAt(0).toUpperCase() + segment.slice(1).trimStart();
        }
        return segment;
      }).join('');
  }

  const getQuestionsbyId = async () => {
    try {
      const response = await fetch('/api/getAttempt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({quizid:quizId}), // data you want to send
        });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const results = await response.json();
      return results;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (!quizId) return;
      const fetchStudentQuizzes = async () => {
        const loadedQuiz = await getQuestionsbyId();
        const data = JSON.parse(JSON.stringify(loadedQuiz));
        console.log(data);
      if (data) {
        setQuiz(data.quizData);
      } 
       else {
        toast({
          title: "Error",
          description: "Quiz not found",
          variant: "destructive",
        });
      }
      };
    if (quizId) {
      fetchStudentQuizzes();
    }
  }, [quizId]);


  // Helper function to check if all questions are attempted (answered)
  const allQuestionsAnswered = React.useMemo(() => {
    if (!quiz) return false;
    return quiz.questions.every((q) => {
      if (q.questionType === 'MULTIPLE_CHOICE' && q.options) {
        return q.studentAnswer !== undefined && q.studentAnswer !== '';
      }
      if (q.questionType === 'TRUE_FALSE') {
        return q.studentAnswer === "True" || q.studentAnswer === "False";
      }
      // Covers SHORT_TEXT, LONG_TEXT, NUMERICAL
      return q.studentAnswer !== undefined && q.studentAnswer !== '';
    });
  }, [quiz]);

  const markQuestionAsEdited = (questionId: string) => {
    setEditedQuestions(prev => new Set(prev).add(questionId));
  };

  const handleCorrectAnswerChange = (questionId: string, newAnswer: string) => {
    if (!quiz) return;
    
    setQuiz(prev => ({
      ...prev!,
      questions: prev!.questions.map(q => 
        q.id === questionId ? { ...q, studentAnswer: newAnswer } : q
      )
    }));
    
    markQuestionAsEdited(questionId);
  };

  const handleOptionChange = (questionId: string, optionIndex: number, newOption: string) => {
    if (!quiz) return;
    
    setQuiz(prev => ({
      ...prev!,
      questions: prev!.questions.map(q => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = newOption;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
    
    markQuestionAsEdited(questionId);
  };

 const saveQuiz = async () => {
    if (!quiz) return;

    setIsSaving(true);
    try {
      console.log('Saving quiz answer changes:', quiz);

      // Submit to Prisma via QuizService
      const result = await fetch('/api/quizz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({type:"updateanswers",uquizId:quiz.id,uattemptId:quiz.attemptId, urollNo: username,udata: quiz.questions }), // data you want to send
      });

      const attempt = await result.json(); 

      if (!result.ok) {
        toast({
          title: "Save Failed",
          description: "Failed to save answer changes. Please try again.",
          variant: "destructive",
        });
      }

      toast({
        title: "Answers Updated",
        description: "Quiz answers have been saved successfully!",
      });
      setTimeout(() => {
        router.back(); // or router.push('/your-target-page')
      }, 1000); // Delay optional

    } catch (error) {
      console.error('Failed to save quiz answers:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save answer changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

const renderAnswerEditor = (question: EditableQuestion) => {
  let isAnswered = true;
  if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
    isAnswered = question.studentAnswer !== undefined && question.studentAnswer !== '';
  } else if (question.questionType === 'TRUE_FALSE') {
    isAnswered = question.studentAnswer === "True" || question.studentAnswer === "False";
  } else {
    isAnswered = question.studentAnswer !== undefined && question.studentAnswer !== '';
  }

  return (
    <Card className={`border-slate-200 ${!isAnswered ? "border-red-400" : ""}`}>
      <CardHeader className="bg-slate-50/50 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-base md:text-lg text-slate-900">
              Question {question.questionNumber}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {capitalizeSentences(question.questionText)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editedQuestions.has(question.id) && (
              <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                <Check className="w-3 h-3 mr-1" />
                Edited
              </Badge>
            )}
            <Badge variant="outline" className="text-slate-600 border-slate-300">
              {question.questionType.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* MULTIPLE CHOICE */}
        {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
          <div>
            <Label className="text-sm font-medium">Answer Options</Label>
            <div className="space-y-3 mt-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Badge variant="outline" className="w-8 text-center shrink-0">
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(question.id, index, e.target.value)}
                    className="flex-1 w-full"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.studentAnswer === option}
                      onChange={() => handleCorrectAnswerChange(question.id, option)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <Label className="text-sm text-slate-600">Correct</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRUE FALSE */}
        {question.questionType === 'TRUE_FALSE' && (
          <div>
            <Label className="text-sm font-medium">Correct Answer</Label>
            <Select
              value={question.studentAnswer}
              onValueChange={(value) => handleCorrectAnswerChange(question.id, value)}
            >
              <SelectTrigger className="w-full sm:w-32 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="True">True</SelectItem>
                <SelectItem value="False">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* SHORT TEXT or NUMERICAL */}
        {(question.questionType === 'SHORT_TEXT' || question.questionType === 'NUMERICAL') && (
          <div>
            <Label htmlFor={`answer-${question.id}`} className="text-sm font-medium">
              Correct Answer
            </Label>
            <Input
              id={`answer-${question.id}`}
              value={question.studentAnswer || ''}
              onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
              className="mt-2 w-full"
              type={question.questionType === 'NUMERICAL' ? 'number' : 'text'}
            />
          </div>
        )}

        {/* LONG TEXT */}
        {question.questionType === 'LONG_TEXT' && (
          <div>
            <Label htmlFor={`answer-${question.id}`} className="text-sm font-medium">
              Correct Answer
            </Label>
            <Textarea
              id={`answer-${question.id}`}
              value={question.studentAnswer || ''}
              onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
              className="mt-2 w-full"
            />
          </div>
        )}

        {/* Warning Message */}
        {!isAnswered && (
          <div className="text-sm text-red-600 font-semibold">
            This question must be answered before saving.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const renderQuestionNavigator = () => {
  if (!quiz) return null;

  return (
    <div className="bg-white border-r border-slate-200 p-4 h-full overflow-y-auto w-full sm:w-72">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Questions</h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 gap-1">
          <span>Total: {quiz.questions.length}</span>
          <span className="text-emerald-600 font-medium">
            Edited: {editedQuestions.size}
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {quiz.questions.map((question, index) => {
          const isEdited = editedQuestions.has(question.id);
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-md border text-sm font-medium transition-all duration-200
                flex items-center justify-center relative
                ${isCurrent
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : isEdited
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              {question.questionNumber}
              {isEdited && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 mb-2">Progress</div>
        <div className="text-sm font-medium text-slate-700">
          {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {editedQuestions.size > 0 && (
          <div className="mt-3 p-2 bg-emerald-50 rounded-md border border-emerald-200">
            <div className="text-xs text-emerald-700 font-medium">
              {editedQuestions.size} question{editedQuestions.size !== 1 ? 's' : ''} modified
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

if (!quiz) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
        <p className="text-sm sm:text-base text-slate-600">Loading quiz editor...</p>
      </div>
    </div>
  );
}

const currentQuestion = quiz.questions[currentQuestionIndex];


  return (
   <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                  <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Edit Answers: {capitalizeSentences(quiz.title)}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-slate-600 border-slate-300">
                    {quiz.subject} • {quiz.grade}
                  </Badge>
                  <Badge variant="outline" className="text-slate-500 border-slate-200">
                    {quiz.questions.length} questions • {quiz.totalMarks} marks
                  </Badge>
                  {editedQuestions.size > 0 && (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                      {editedQuestions.size} edited
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={saveQuiz}
                disabled={isSaving || !allQuestionsAnswered}
                className={`bg-emerald-600 hover:bg-emerald-700 text-white ${!allQuestionsAnswered ? "opacity-60 cursor-not-allowed" : ""}`}
                title={!allQuestionsAnswered ? "Answer all questions to enable saving" : ""}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Answers'}
              </Button>
            </div>

            {!allQuestionsAnswered && (
              <div className="mt-2 text-sm text-red-700 font-medium">
                All questions must be answered to save changes.
              </div>
            )}
          </div>
        </div>

        {/* Question Editor */}
        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Editing Question {currentQuestion.questionNumber}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="border-slate-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="border-slate-300"
                >
                  Next
                </Button>
              </div>
            </div>

            {renderAnswerEditor(currentQuestion)}
          </div>
        </div>
      </div>

      {/* Sidebar Navigator */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200">
        {renderQuestionNavigator()}
      </div>
    </div>

  );
};

export default QuizEditor;