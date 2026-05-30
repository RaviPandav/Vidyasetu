// TeachersPage.jsx
import { useEffect, useState } from "react";
import { publicService } from "../../services";
import { StarIcon } from "@heroicons/react/24/outline";

export function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService.getTeachers()
      .then((res) => setTeachers(res.data.teachers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-14">
      <div className="text-center mb-12">
        <h1 className="section-heading mb-3">Meet Our Expert Teachers</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Learn from experienced educators with proven track records in their respective subjects</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No teachers found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="card-hover text-center">
              <div className="w-20 h-20 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-heading font-bold text-3xl mx-auto mb-4">
                {teacher.avatar
                  ? <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
                  : teacher.name?.[0]?.toUpperCase()
                }
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-1">{teacher.name}</h3>
              {teacher.expertise?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {teacher.expertise.slice(0, 3).map((e) => <span key={e} className="badge-primary text-xs">{e}</span>)}
                </div>
              )}
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{teacher.bio || "Expert educator"}</p>
              <p className="text-sm font-medium text-gray-700">{teacher.teachingCourses?.length || 0} courses</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeachersPage;
