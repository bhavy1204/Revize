import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import Navbar from "../components/Navbar.jsx";
import ApiCLient from "../utils/api.js";
import QuizModal from "../components/QuizModal.jsx";

const apiClient = new ApiCLient();

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizTarget, setQuizTarget] = useState(null);
  const [openedQuestion, setOpenedQuestion] = useState(false);

  const handleOpenLeetcode = () => {
    window.open(task.link, "_blank");
    setOpenedQuestion(true);
  };

  const handleStartQuiz = (revisionIndex) => {
    setQuizTarget({ revisionIndex });
  };

  // Sidebar state (mirrors Dashboard)
  const todayDate = useRef(new Date()).current;
  const [activeNav, setActiveNav] = useState(() => {
    try {
      const pending = localStorage.getItem("showAllPending") === "true";
      const upcoming = localStorage.getItem("showAllUpcoming") === "true";
      if (pending) return "pending";
      if (upcoming) return "upcoming";
    } catch {
      // ignore
    }
    return "today";
  });

  // Calendar state (bottom of sidebar)
  const [calendarViewDate, setCalendarViewDate] = useState(todayDate);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayDate);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiClient.getTask(taskId);
        setTask(res.data || null);
      } catch (err) {
        setError(err.message || "Failed to load task details");
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) fetchTask();
  }, [taskId]);

  const calendarMonthStart = startOfMonth(calendarViewDate);
  const calendarGridStart = startOfWeek(calendarMonthStart, {
    weekStartsOn: 1,
  }); // Monday
  const calendarDays = Array.from({ length: 42 }, (_, idx) =>
    addDays(calendarGridStart, idx),
  );

  const revisions = useMemo(() => {
    if (!task?.revisions) return [];
    return [...task.revisions].sort(
      (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt),
    );
  }, [task]);

  const formatMaybe = (val) => {
    if (val === null || val === undefined || val === "") return "Not available";
    return val;
  };

  const formatDateMaybe = (val, fmt = "PPpp") => {
    if (!val) return "Not available";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "Not available";
    return format(d, fmt);
  };

  const handleSidebarToday = () => {
    setActiveNav("today");
    try {
      localStorage.setItem("showAllPending", "false");
      localStorage.setItem("showAllUpcoming", "false");
      window.dispatchEvent(new Event("showAllPendingChange"));
      window.dispatchEvent(new Event("showAllUpcomingChange"));
    } catch {
      // ignore
    }
    navigate("/");
  };

  const handleSidebarPending = () => {
    setActiveNav("pending");
    try {
      localStorage.setItem("showAllPending", "true");
      localStorage.setItem("showAllUpcoming", "false");
      window.dispatchEvent(new Event("showAllPendingChange"));
      window.dispatchEvent(new Event("showAllUpcomingChange"));
    } catch {
      // ignore
    }
    navigate("/");
  };

  const handleSidebarUpcoming = () => {
    setActiveNav("upcoming");
    try {
      localStorage.setItem("showAllUpcoming", "true");
      localStorage.setItem("showAllPending", "false");
      window.dispatchEvent(new Event("showAllPendingChange"));
      window.dispatchEvent(new Event("showAllUpcomingChange"));
    } catch {
      // ignore
    }
    navigate("/");
  };

  const handleSidebarSettings = () => {
    setActiveNav("settings");
    navigate("/settings");
  };

  const handleCompleteRevision = async (taskId) => {
    try {
      await apiClient.completeRevision(taskId);
    } catch (err) {
      setError(err.message || "Failed to complete revision");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="w-full px-4 py-4">
        <div className="lg:flex lg:gap-6 lg:items-start">
          {/* Large-screen sidebar */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sticky top-24 h-[calc(100vh-6rem)]">
            <div className="flex flex-col gap-1">
              <div className="text-neutral-50 font-semibold text-base px-2 mb-2">
                Menu
              </div>

              <button
                type="button"
                onClick={handleSidebarToday}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeNav === "today"
                    ? "bg-violet-600/15 text-violet-300 border-l-2 border-violet-500"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Today's tasks
              </button>

              <button
                type="button"
                onClick={handleSidebarPending}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeNav === "pending"
                    ? "bg-violet-600/15 text-violet-300 border-l-2 border-violet-500"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Pending
              </button>

              <button
                type="button"
                onClick={handleSidebarUpcoming}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeNav === "upcoming"
                    ? "bg-violet-600/15 text-violet-300 border-l-2 border-violet-500"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Upcoming tasks
              </button>

              <button
                type="button"
                onClick={handleSidebarSettings}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeNav === "settings"
                    ? "bg-violet-600/15 text-violet-300 border-l-2 border-violet-500"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Settings
              </button>
            </div>

            {/* Calendar at the bottom */}
            <div className="mt-auto pt-5 border-t border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  className="text-neutral-400 hover:text-neutral-100 px-2 py-1 rounded-lg hover:bg-neutral-800 transition"
                  onClick={() => {
                    const d = new Date(calendarViewDate);
                    d.setMonth(d.getMonth() - 1);
                    setCalendarViewDate(d);
                  }}
                  aria-label="Previous month"
                >
                  &lt;
                </button>

                <div className="text-neutral-100 text-sm font-medium">
                  {format(calendarViewDate, "MMMM yyyy")}
                </div>

                <button
                  type="button"
                  className="text-neutral-400 hover:text-neutral-100 px-2 py-1 rounded-lg hover:bg-neutral-800 transition"
                  onClick={() => {
                    const d = new Date(calendarViewDate);
                    d.setMonth(d.getMonth() + 1);
                    setCalendarViewDate(d);
                  }}
                  aria-label="Next month"
                >
                  &gt;
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] text-neutral-500 px-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 px-1">
                {calendarDays.map((day) => {
                  const isToday = isSameDay(day, todayDate);
                  const isSelected = isSameDay(day, selectedCalendarDate);
                  const inMonth = isSameMonth(day, calendarViewDate);

                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      onClick={() => setSelectedCalendarDate(day)}
                      className={[
                        "h-8 w-8 flex items-center justify-center rounded-lg transition text-sm",
                        isToday
                          ? "bg-violet-600 text-white font-medium hover:bg-violet-500"
                          : isSelected
                            ? "bg-neutral-800 text-white ring-2 ring-violet-500/40 hover:bg-neutral-700"
                            : inMonth
                              ? "text-neutral-200 hover:bg-neutral-800"
                              : "text-neutral-600 hover:bg-neutral-800",
                      ].join(" ")}
                      aria-label={`Select ${format(day, "yyyy-MM-dd")}`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-semibold text-neutral-50 mb-6">
                {task?.heading || "Task details"}
              </h1>

              {loading && (
                <p className="text-center text-sm text-neutral-400">Loading…</p>
              )}
              {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {!loading && !error && task && (
                <div className="space-y-4">
                  <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <h2 className="text-base font-semibold text-neutral-50 mb-4">
                      Details
                    </h2>

                    <div className="space-y-2.5 text-sm text-neutral-300">
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500">Description</span>
                        <span className="text-right">
                          {formatMaybe(task.description)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500">Link</span>
                        <span className="text-right">
                          {formatMaybe(task.link)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500">Created at</span>
                        <span className="text-right">
                          {formatDateMaybe(task.createdAt)}
                        </span>
                      </div>

                      <div className="pt-2">
                        <div className="text-neutral-500 mb-2">Document</div>

                        {task.document ? (
                          <div className="text-sm text-neutral-300 space-y-2">
                            <iframe
                              src={task.document.url}
                              width="100%"
                              height="400"
                              title="Document"
                              className="rounded-lg border border-neutral-800"
                            ></iframe>

                            <div>
                              <span className="text-neutral-500">URL:</span>{" "}
                              <a
                                href={task.document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-400 hover:text-violet-300"
                              >
                                {formatMaybe(task.document.url)}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-500">
                            Not available
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <h2 className="text-base font-semibold text-neutral-50 mb-4">
                      Revisions history
                    </h2>

                    {revisions.length === 0 ? (
                      <p className="text-sm text-neutral-500">Not available</p>
                    ) : (
                      <div className="space-y-3">
                        {revisions.map((rev, idx) => {
                          const scheduledText = formatDateMaybe(
                            rev?.scheduledAt,
                            "PP",
                          );
                          const completedAt = rev?.completedAt;
                          const completedText = completedAt
                            ? formatDateMaybe(completedAt, "PP")
                            : null;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                         const firstPendingIndex = revisions.findIndex(
                           (rev) => {
                             const scheduled = new Date(rev.scheduledAt);
                             scheduled.setHours(0, 0, 0, 0);

                             return !rev.completedAt && scheduled <= today;
                           },
                         );
                          {console.log("First pending index : ",firstPendingIndex)
                            console.log("today : ",today)
                            console.log("scheduled : ",scheduledText)
                          }
                          return (
                            <div
                              key={`${rev?.scheduledAt || idx}`}
                              className="bg-neutral-950 rounded-lg p-4 border border-neutral-800"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm text-neutral-300">
                                    Revision {idx + 1}
                                  </p>
                                  <p className="text-sm text-neutral-400 mt-1">
                                    Scheduled: {scheduledText}
                                  </p>
                                  <p className="text-sm text-neutral-400 mt-1">
                                    Completed: {completedText || "-"}
                                  </p>
                                </div>

                                <div className="text-right flex flex-col items-end gap-2">
                                  <p
                                    className={[
                                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                                      completedText
                                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50"
                                        : "bg-violet-600/15 text-violet-300 border border-violet-900/50",
                                    ].join(" ")}
                                  >
                                    {completedText ? "Completed" : "Pending"}
                                  </p>

                                  {!completedText &&
                                    idx === firstPendingIndex &&
                                    (task.type === "leetcode" ? (
                                      openedQuestion ? (
                                        <button
                                          onClick={() =>
                                            handleCompleteRevision(task._id)
                                          }
                                          className="text-xs px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-500"
                                        >
                                          Mark as Done
                                        </button>
                                      ) : (
                                        <button
                                          onClick={handleOpenLeetcode}
                                          className="text-xs px-3 py-1 rounded-md bg-yellow-600 text-white hover:bg-yellow-500"
                                        >
                                          Solve on LeetCode
                                        </button>
                                      )
                                    ) : (
                                      <button
                                        onClick={() => handleStartQuiz(idx)}
                                        className="text-xs px-3 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-500"
                                      >
                                        Take Quiz
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>

            {quizTarget && (
              <QuizModal
                taskId={task._id}
                revisionIndex={quizTarget.revisionIndex}
                onClose={() => setQuizTarget(null)}
                onPassed={() => {
                  // refetch this task's detail, not the whole task list
                  fetchTaskDetails(); // or whatever your detail-fetch function is called
                  setQuizTarget(null);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
