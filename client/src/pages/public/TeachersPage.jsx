import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { publicService } from "../../services";
import { AcademicCapIcon, BookOpenIcon, SparklesIcon } from "@heroicons/react/24/outline";

export function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getTeachers()
      .then((res) => setTeachers(res.data.teachers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="hero-grid bg-white py-16 dark:bg-gray-950">
        <div className="page-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge-primary mb-4">Expert Faculty</span>
            <h1 className="section-heading mb-3 dark:text-white">Meet Our Teachers</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Learn from educators who make complex subjects simple, practical, and exam-ready.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="page-container py-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 skeleton rounded-2xl" />)}
          </div>
        ) : teachers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">
            No teachers found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher, idx) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="h-20 bg-gradient-to-r from-primary-500 to-accent-500" />
                <div className="-mt-10 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary-100 font-heading text-3xl font-bold text-primary-700 shadow-md dark:border-gray-800">
                    {teacher.avatar ? (
                      <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
                    ) : (
                      teacher.name?.[0]?.toUpperCase() || <AcademicCapIcon className="h-10 w-10" />
                    )}
                  </div>
                  <h3 className="mb-1 font-heading text-xl font-bold text-gray-900 dark:text-white">{teacher.name}</h3>
                  <p className="mb-4 text-sm text-gray-500 line-clamp-3">{teacher.bio || "Expert educator"}</p>

                  {teacher.expertise?.length > 0 && (
                    <div className="mb-5 flex flex-wrap justify-center gap-2">
                      {teacher.expertise.slice(0, 3).map((e) => (
                        <span key={e} className="badge-primary text-xs">{e}</span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                      <BookOpenIcon className="mx-auto mb-1 h-5 w-5 text-primary-600" />
                      <p className="font-semibold text-gray-900 dark:text-white">{teacher.teachingCourses?.length || 0}</p>
                      <p className="text-xs text-gray-500">Courses</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                      <SparklesIcon className="mx-auto mb-1 h-5 w-5 text-primary-600" />
                      <p className="font-semibold text-gray-900 dark:text-white">4.8</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TeachersPage;
