import { useEffect, useState } from "react";
import { studentService } from "../../services";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

const statusStyles = {
  scheduled: "bg-primary-100 text-primary-700",
  live: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function StudentLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getLiveClasses()
      .then((res) => setClasses(res.data.classes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Live Classes</h1>
        <p className="text-gray-500 mt-1">Join your scheduled classes in one click</p>
      </div>

      {classes.length === 0 ? (
        <div className="card text-center py-20">
          <VideoCameraIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No live classes available right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <div key={cls._id} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                <VideoCameraIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-gray-900">{cls.title}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[cls.status] || statusStyles.scheduled}`}>
                    {cls.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{cls.course?.title}</p>
                <p className="text-sm text-gray-500">
                  Teacher: {cls.teacher?.name || "Instructor"}
                </p>
                <p className="text-sm text-primary-600 font-medium mt-2">
                  Class time: {new Date(cls.scheduledAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex-shrink-0">
                {cls.meetingLink ? (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    <VideoCameraIcon className="w-4 h-4" />
                    Join Class
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Join link will be available soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
