// StudentResults.jsx
import { useEffect, useState } from "react";
import { studentService } from "../../services";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getResults()
      .then((res) => setResults(res.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">My Results</h1>
      {results.length === 0 ? (
        <div className="card text-center py-20 text-gray-500">No quiz results yet. Take a quiz to see your results!</div>
      ) : (
        <div className="space-y-3">
          {results.map((r, i) => {
            const attempt = r.attempt;
            if (!attempt) return null;
            const pct = Math.round(attempt.percentage || 0);
            return (
              <div key={i} className="card flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-xl flex-shrink-0 ${
                  attempt.isPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}>
                  {pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.course?.title}</p>
                  <p className="text-sm mt-1">
                    Score: <strong>{attempt.score}/{r.totalMarks}</strong> ·
                    {attempt.isPassed
                      ? <span className="text-green-600 font-semibold ml-1">✅ Passed</span>
                      : <span className="text-red-500 font-semibold ml-1">❌ Failed</span>
                    }
                  </p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(attempt.submittedAt).toLocaleDateString("en-IN")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
