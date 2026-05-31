import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { studentService } from "../../services";
import { getAssetUrl } from "../../utils/urls";
import { ChevronDownIcon, ChevronRightIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";

export default function StudentVideoPlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState({});
  const [videoError, setVideoError] = useState("");

  const dedupeItems = (items, key) => {
    const seen = new Set();
    return (items || []).filter((item) => {
      const value = item[key] ?? item.title ?? item._id;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  };

  useEffect(() => {
    studentService.getCourseContent(id)
      .then((res) => {
        const c = res.data.course;
        const sections = dedupeItems(c.sections, '_id').map((section) => ({
          ...section,
          lectures: dedupeItems(section.lectures, '_id'),
        }));
        const normalizedCourse = { ...c, sections };
        setCourse(normalizedCourse);
        // Auto-open first section and select first lecture
        if (sections.length > 0) {
          setOpenSections({ [sections[0]._id]: true });
          if (sections[0].lectures?.length > 0) {
            setActiveLecture(sections[0].lectures[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleLectureComplete = () => {
    // Update progress when lecture ends
    const totalLectures = course?.sections?.reduce((acc, s) => acc + s.lectures.length, 0) || 1;
    const newProgress = Math.round((1 / totalLectures) * 100);
    studentService.updateProgress(id, newProgress).catch(console.error);
  };

  const handleVideoProgress = ({ played }) => {
    if (!activeLecture?._id) return;
    const watchedPercent = Math.round((played || 0) * 100);
    if (watchedPercent < 70 || attendanceMarked[activeLecture._id]) return;
    setAttendanceMarked((prev) => ({ ...prev, [activeLecture._id]: true }));
    studentService.markVideoAttendance({
      courseId: id,
      lectureId: activeLecture._id,
      watchedPercent,
    }).catch(console.error);
  };

  const handleNativeVideoProgress = (event) => {
    const video = event.currentTarget;
    if (!video.duration) return;
    handleVideoProgress({ played: video.currentTime / video.duration });
  };

  const activeVideoUrl = activeLecture?.videoUrl ? getAssetUrl(activeLecture.videoUrl) : "";
  const isUploadedVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(activeVideoUrl);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-96 skeleton rounded-2xl" />
      <div className="h-8 w-80 skeleton" />
    </div>
  );

  if (!course) return <div className="card text-center py-20 text-gray-500">Course not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Video Player */}
      <div className="flex-1 min-w-0">
        <div className="bg-black rounded-2xl overflow-hidden aspect-video mb-4">
          {activeLecture?.videoUrl ? (
            videoError ? (
              <div className="w-full h-full flex items-center justify-center text-white/70 p-6 text-center">
                <div>
                  <div className="text-4xl mb-3">!</div>
                  <p className="font-semibold">Video file not found or cannot be played.</p>
                  <p className="mt-2 text-sm text-white/50 break-all">{activeVideoUrl}</p>
                </div>
              </div>
            ) : isUploadedVideo ? (
              <video
                src={activeVideoUrl}
                className="h-full w-full"
                controls
                controlsList="nodownload"
                onTimeUpdate={handleNativeVideoProgress}
                onEnded={handleLectureComplete}
                onError={() => setVideoError("Video file not found or cannot be played.")}
              />
            ) : (
              <ReactPlayer
                url={activeVideoUrl}
                width="100%"
                height="100%"
                controls
                onProgress={handleVideoProgress}
                onEnded={handleLectureComplete}
                onError={() => setVideoError("Video file not found or cannot be played.")}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <div className="text-center">
                <div className="text-5xl mb-3">🎬</div>
                <p>Select a lecture to start watching</p>
              </div>
            </div>
          )}
        </div>

        {activeLecture && (
          <div className="card">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">{activeLecture.title}</h2>
            {activeLecture.description && (
              <p className="text-gray-600 text-sm mb-4">{activeLecture.description}</p>
            )}
            {activeLecture.resources?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">📎 Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {activeLecture.resources.map((r, i) => (
                    <a
                      key={i}
                      href={getAssetUrl(r.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      {r.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Curriculum Sidebar */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <div className="card h-full lg:max-h-[calc(100vh-140px)] flex flex-col">
          <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">{course.title}</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {course.sections?.map((section) => (
              <div key={section._id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenSections(prev => ({ ...prev, [section._id]: !prev[section._id] }))}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="font-semibold text-sm text-gray-800">{section.title}</span>
                  {openSections[section._id]
                    ? <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    : <ChevronRightIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  }
                </button>
                {openSections[section._id] && (
                  <div className="divide-y divide-gray-50">
                    {section.lectures?.map((lecture) => (
                      <button
                        key={lecture._id}
                        onClick={() => {
                          setVideoError("");
                          setActiveLecture(lecture);
                        }}
                        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-primary-50 transition-colors ${
                          activeLecture?._id === lecture._id ? "bg-primary-50 text-primary-700" : "text-gray-700"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          activeLecture?._id === lecture._id ? "bg-primary-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}>▶</div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{lecture.title}</p>
                          {lecture.duration && (
                            <p className="text-xs text-gray-400">{Math.floor(lecture.duration / 60)}m {lecture.duration % 60}s</p>
                          )}
                        </div>
                        {lecture.isFree && <span className="badge-success ml-auto text-xs flex-shrink-0">Free</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
