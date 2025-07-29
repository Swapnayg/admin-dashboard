'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from 'recharts';
import prisma from "@/lib/prisma";

interface ExamAttendanceData {
  examTitle: string;
  present: number;
  absent: number;
}

export default function ExamAttendanceChart() {
  const [data, setData] = useState<ExamAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  const [gradeId, setGradeId] = useState('all');
  const [subjectId, setSubjectId] = useState('all');

  const [grades, setGrades] = useState<{level: string; id: string; }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);


  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (gradeId !== 'all') params.append('gradeId', gradeId);
      if (subjectId !== 'all') params.append('subjectId', subjectId);

      
      const res = await fetch(`/api/exam-attendance?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetch("/api/grades").then(res => res.json()).then(setGrades);
    fetch("/api/subjects").then(res => res.json()).then(setSubjects);
  }, [ gradeId, subjectId]);

  return (
   <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-4">
  {/* Header and Filters */}
  <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">📊 Exam Details</h2>
    
    <div className="flex flex-wrap gap-2 justify-end">
      <select
        value={gradeId}
        onChange={(e) => setGradeId(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">All Grades</option>
        {grades.map((grade) => (
          <option key={grade.id} value={grade.id}>
            {grade.level}
          </option>
        ))}
      </select>

      <select
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">All Subjects</option>
        {subjects.map((subj) => (
          <option key={subj.id} value={subj.id}>
            {subj.name}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Chart or Messages */}
  {loading ? (
    <p className="text-gray-500">Loading...</p>
  ) : data.length === 0 ? (
    <p className="text-gray-500">No attendance data available.</p>
  ) : (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            barCategoryGap="20%"
            margin={{ top: 30, right: 30, left: 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="examTitle"
              interval={0}
              angle={-25}
              textAnchor="end"
              tick={{ fontSize: 11 }}
              height={80}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" stackId="a" fill="#FACC15" name="Present">
              <LabelList dataKey="present" position="top" fontSize={11} fill="#000" />
            </Bar>
            <Bar dataKey="absent" stackId="a" fill="#38BDF8" name="Absent">
              <LabelList dataKey="absent" position="top" fontSize={11} fill="#000" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )}
</div>

  );
}
