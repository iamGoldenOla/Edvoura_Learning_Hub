import React from 'react';
import StudentQuizBankWorkspace from './StudentQuizBankWorkspace';


export default async function StudentQuizBankPage() {
  return (
    <main className="w-full min-h-screen py-6 sm:py-8">
      <StudentQuizBankWorkspace
        initialRegion="NG"
        studentGradeName="Primary 3 (Grade 3)"
        studentGradeCode="grade_3"
        studentId="james_jedidiahz"
      />
    </main>
  );
}
