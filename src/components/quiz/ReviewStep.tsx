
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui2/card';
import { Badge } from '@/components/ui2/badge';
import { Separator } from '@/components/ui2/separator';
import { QuizData, Question } from './types';
import InfoBlock from './infoblock';
interface ReviewStepProps {
  quizData: QuizData;
  questions: Question[];
}



const ReviewStep = ({ quizData, questions }: ReviewStepProps) => {
  const totalAllocatedMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isValid = questions.length === quizData.totalQuestions && totalAllocatedMarks === quizData.totalMarks;

  return (
   <div className="space-y-6 px-2 sm:px-4">
  {/* Validation Summary */}
  <Card className={`border-2 ${isValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
    <CardContent className="pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800 text-base sm:text-lg">
          {isValid ? '✅ Quiz Ready for Submission' : '⚠️ Please Review'}
        </h3>
        <Badge className={isValid ? 'bg-green-600' : 'bg-orange-600'}>
          {questions.length}/{quizData.totalQuestions} Questions
        </Badge>
      </div>

      {!isValid && (
        <div className="mt-2 text-sm text-slate-600">
          {questions.length !== quizData.totalQuestions && (
            <p>• You have {questions.length} questions but specified {quizData.totalQuestions}</p>
          )}
          {totalAllocatedMarks !== quizData.totalMarks && (
            <p>• Total marks allocated: {totalAllocatedMarks} (Expected: {quizData.totalMarks})</p>
          )}
        </div>
      )}
    </CardContent>
  </Card>

  {/* Quiz Metadata */}
  <Card>
    <CardHeader>
      <CardTitle className="text-slate-800 text-lg sm:text-xl">Quiz Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBlock label="Title" value={quizData.title} />
        <InfoBlock label="Category" value={quizData.category} />
        <InfoBlock label="Grade" value={quizData.grades} />
        <InfoBlock label="Subject" value={quizData.subject} />
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoBlock label="Total Questions" value={quizData.totalQuestions} />
        <InfoBlock label="Total Marks" value={quizData.totalMarks} />
        <InfoBlock label="Start Date/Time" value={quizData.startDateTime ? new Date(quizData.startDateTime).toLocaleString() : 'Not specified'} />
        <InfoBlock label="End Date/Time" value={quizData.endDateTime ? new Date(quizData.endDateTime).toLocaleString() : 'Not specified'} />
      </div>
    </CardContent>
  </Card>

  {/* Questions Review */}
  <Card>
    <CardHeader>
      <CardTitle className="text-slate-800 text-lg sm:text-xl">Questions Overview</CardTitle>
    </CardHeader>
    <CardContent>
      {questions.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No questions added yet.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <h4 className="font-medium text-slate-800 text-base">Question {index + 1}</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-slate-600 text-white text-xs sm:text-sm">
                    {question.type.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline" className="border-slate-300 text-slate-700 text-xs sm:text-sm">
                    {question.marks} marks
                  </Badge>
                </div>
              </div>

              <p className="text-slate-700 mb-3 text-sm sm:text-base">{question.text}</p>

              {question.options && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 font-medium">Options:</p>
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`text-sm p-2 rounded ${
                        option.isCorrect 
                          ? 'bg-green-50 border border-green-200 text-green-800' 
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {option.text} {option.isCorrect && <span className="font-medium">(Correct)</span>}
                    </div>
                  ))}
                </div>
              )}

              {question.correctAnswer && !question.options && (
                <div className="bg-green-50 border border-green-200 p-2 rounded mt-2">
                  <p className="text-sm text-green-800">
                    <strong>Correct Answer:</strong> {question.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</div>

  );
};

export default ReviewStep;
