import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import ApiCLient from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AddTaskForm from "../components/AddTaskForm.jsx"; // Import AddTaskForm
import Button from "../components/Button.jsx"; // Import Button for consistency
import { useNavigate } from "react-router-dom";
import { formatDistance } from "date-fns";
import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const apiClient = new ApiCLient();

const Dashboard = () => {
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [allPendingRevisions, setAllPendingRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [showAllPending, setShowAllPending] = useState(() => {
    try {
      const v = localStorage.getItem("showAllPending");
      return v === "true";
    } catch {
      return false;
    }
  });
  const [showUpcoming, setShowUpcoming] = useState(() => {
    try {
      const v = localStorage.getItem("showAllUpcoming");
      return v === "true";
    } catch {
      return false;
    }
  });
  const [error, setError] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false); // State for modal visibility
  const { isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Sidebar section navigation refs
  const todayRef = useRef(null);
  const pendingRef = useRef(null);
  const upcomingRef = useRef(null);
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
  const [todayScrollRequested, setTodayScrollRequested] = useState(false);
  const [pendingScrollRequested, setPendingScrollRequested] = useState(false);
  const [upcomingScrollRequested, setUpcomingScrollRequested] = useState(false);

  // Calendar state (bottom of sidebar)
  const todayDate = useRef(new Date()).current;
  const [calendarViewDate, setCalendarViewDate] = useState(todayDate);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayDate);

  const fetchTasks = async () => {
    if (!isLoggedIn) return; // Only fetch if logged in

    setLoadingTasks(true);
    setError("");
    try {
      const todayData = await apiClient.getTodayRevision();
      setTodayRevisions(todayData.data || []);

      const allPendingData = await apiClient.getAllPendingRevision();
      setAllPendingRevisions(allPendingData.data || []);

      const upcomingData = await apiClient.getAllUpcomingRevisions();
      setUpcomingRevisions(upcomingData.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn]); // Re-fetch tasks when login status changes

  // Listen for changes to the showAllPending preference set in Settings
  useEffect(() => {
    const handler = () => {
      try {
        const v = localStorage.getItem("showAllPending");
        setShowAllPending(v === "true");
      } catch {
        // ignore
      }
    };

    const upcomingHandler = () => {
      try {
        const v = localStorage.getItem("showAllUpcoming");
        setShowUpcoming(v === "true");
      } catch {
        // ignore
      }
    };

    window.addEventListener("showAllPendingChange", handler);
    window.addEventListener("showAllUpcomingChange", upcomingHandler);
    window.addEventListener("storage", handler);
    window.addEventListener("storage", upcomingHandler);
    return () => {
      window.removeEventListener("showAllPendingChange", handler);
      window.removeEventListener("showAllUpcomingChange", upcomingHandler);
      window.removeEventListener("storage", handler);
      window.removeEventListener("storage", upcomingHandler);
    };
  }, []);

  const handleCompleteRevision = async (taskId) => {
    try {
      await apiClient.completeRevision(taskId);
      fetchTasks(); // Refresh tasks after completion
    } catch (err) {
      setError(err.message || "Failed to complete revision");
    }
  };

  const handleViewDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const scrollToToday = () => {
    setActiveNav("today");
    setShowAllPending(false);
    setShowUpcoming(false);
    setTodayScrollRequested(true);
  };

  const showPendingSection = () => {
    setActiveNav("pending");
    setShowAllPending(true);
    setShowUpcoming(false);
    try {
      localStorage.setItem("showAllPending", "true");
      window.dispatchEvent(new Event("showAllPendingChange"));
    } catch {
      // ignore
    }
    setPendingScrollRequested(true);
  };

  const showUpcomingSection = () => {
    setActiveNav("upcoming");
    setShowUpcoming(true);
    setShowAllPending(false);
    try {
      localStorage.setItem("showAllUpcoming", "true");
      window.dispatchEvent(new Event("showAllUpcomingChange"));
    } catch {
      // ignore
    }
    setUpcomingScrollRequested(true);
  };

  useEffect(() => {
    if (todayScrollRequested && activeNav === "today") {
      todayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTodayScrollRequested(false);
    }
  }, [todayScrollRequested, activeNav]);

  useEffect(() => {
    if (pendingScrollRequested && showAllPending) {
      pendingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPendingScrollRequested(false);
    }
  }, [pendingScrollRequested, showAllPending]);

  useEffect(() => {
    if (upcomingScrollRequested && showUpcoming) {
      upcomingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setUpcomingScrollRequested(false);
    }
  }, [upcomingScrollRequested, showUpcoming]);

  // Keep the visible section in sync with the sidebar preferences
  useEffect(() => {
    if (showAllPending) setActiveNav("pending");
    else if (showUpcoming) setActiveNav("upcoming");
    else setActiveNav("today");
  }, [showAllPending, showUpcoming]);

  if (authLoading) {
    return <p className="text-center mt-8">Loading application...</p>;
  }

  const calendarMonthStart = startOfMonth(calendarViewDate);
  const calendarGridStart = startOfWeek(calendarMonthStart, {
    weekStartsOn: 1,
  }); // Monday
  const calendarDays = Array.from({ length: 42 }, (_, idx) =>
    addDays(calendarGridStart, idx),
  );

  const TaskCard = ({ task }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <h4 className="text-base font-semibold text-neutral-50 mb-2">
        {task.heading}
      </h4>
      {task.revisions && task.revisions.length > 0 && (
        <p className="text-sm text-neutral-400 mb-4">
          last studied{" "}
          {(() => {
            const latestCompleted = task.revisions
              .filter((r) => r.completedAt)
              .sort(
                (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
              )[0];

            return latestCompleted
              ? formatDistance(
                  new Date(latestCompleted.completedAt),
                  new Date(),
                  {
                    addSuffix: true,
                  },
                )
              : "haven't studied this yet";
          })()}
        </p>
      )}
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="w-full px-4 py-4">
        <div className="lg:flex lg:gap-6 lg:items-start">
          {/* Large-screen sidebar */}
          {/* Sub-navbar: horizontal scroll, shown below main navbar on <lg screens */}
          <div className="lg:hidden sticky top-16 z-20 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
            <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
              <button
                type="button"
                onClick={scrollToToday}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeNav === "today"
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={showPendingSection}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeNav === "pending"
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Pending
              </button>

              <button
                type="button"
                onClick={showUpcomingSection}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeNav === "upcoming"
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Upcoming
              </button>

              <button
                type="button"
                onClick={() => navigate("/settings")}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeNav === "settings"
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Sidebar: lg screens and up */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sticky top-24 h-[calc(100vh-6rem)]">
            <div className="flex flex-col gap-1">
              <div className="text-neutral-50 font-semibold text-base px-2 mb-2">
                Menu
              </div>

              <button
                type="button"
                onClick={scrollToToday}
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
                onClick={showPendingSection}
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
                onClick={showUpcomingSection}
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
                onClick={() => navigate("/settings")}
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
            <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-50">
              Dashboard
            </h2>

            {loadingTasks && (
              <p className="text-center text-sm text-neutral-400">
                Loading tasks…
              </p>
            )}
            {error && (
              <div className="mb-5 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 max-w-md mx-auto">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <div className="flex justify-end mb-6">
              <Button
                variant="primary"
                onClick={() => setShowAddTaskModal(true)}
              >
                Add new task
              </Button>
            </div>

            {showAddTaskModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-task-title"
                onClick={() => setShowAddTaskModal(false)}
              >
                <div
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto text-neutral-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AddTaskForm
                    onClose={() => setShowAddTaskModal(false)}
                    onTaskAdded={fetchTasks}
                  />
                </div>
              </div>
            )}

            {activeNav === "today" && (
              <div ref={todayRef} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-neutral-100">
                  Today's revisions
                </h3>
                {todayRevisions.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No revisions scheduled for today.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayRevisions.map((task) => (
                      <div
                        key={task._id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
                      >
                        <h4 className="text-base font-semibold text-neutral-50 mb-2">
                          {task.heading}
                        </h4>
                        {task.revisions && task.revisions.length > 0 && (
                          <p className="text-sm text-neutral-400 mb-4">
                            last studied{" "}
                            {(() => {
                              const latestCompleted = task.revisions
                                .filter((r) => r.completedAt)
                                .sort(
                                  (a, b) =>
                                    new Date(b.completedAt) -
                                    new Date(a.completedAt),
                                )[0];

                              return latestCompleted
                                ? formatDistance(
                                    new Date(latestCompleted.completedAt),
                                    new Date(),
                                    {
                                      addSuffix: true,
                                    },
                                  )
                                : "haven't studied this yet";
                            })()}
                          </p>
                        )}

                        <div className="flex justify-between gap-3">
                          <Button
                            variant="success"
                            onClick={() => handleCompleteRevision(task._id)}
                            className="text-sm flex-1"
                          >
                            Complete
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleViewDetails(task._id)}
                            className="text-sm flex-1"
                          >
                            View details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeNav === "pending" && showAllPending && (
              <div ref={pendingRef}>
                {allPendingRevisions.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No pending revisions.
                  </p>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-neutral-100">
                      Your pending revisions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allPendingRevisions.map((task) => (
                        <div
                          key={task._id}
                          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
                        >
                          <h4 className="text-base font-semibold text-neutral-50 mb-2">
                            {task.heading}
                          </h4>
                          {task.revisions && task.revisions.length > 0 && (
                            <p className="text-sm text-neutral-400 mb-4">
                              last studied{" "}
                              {(() => {
                                const latestCompleted = task.revisions
                                  .filter((r) => r.completedAt)
                                  .sort(
                                    (a, b) =>
                                      new Date(b.completedAt) -
                                      new Date(a.completedAt),
                                  )[0];

                                return latestCompleted
                                  ? formatDistance(
                                      new Date(latestCompleted.completedAt),
                                      new Date(),
                                      {
                                        addSuffix: true,
                                      },
                                    )
                                  : "haven't studied this yet";
                              })()}
                            </p>
                          )}
                          <div className="flex justify-between gap-3">
                            <Button
                              variant="success"
                              onClick={() => handleCompleteRevision(task._id)}
                              className="text-sm flex-1"
                            >
                              Complete
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetails(task._id)}
                              className="text-sm flex-1"
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeNav === "upcoming" && showUpcoming && (
              <div ref={upcomingRef}>
                {upcomingRevisions.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No upcoming revisions.
                  </p>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-neutral-100">
                      Your upcoming revisions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingRevisions.map((task) => (
                        <div
                          key={task._id}
                          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
                        >
                          <h4 className="text-base font-semibold text-neutral-50 mb-2">
                            {task.heading}
                          </h4>
                          {task.revisions && task.revisions.length > 0 && (
                            <p className="text-sm text-neutral-400 mb-4">
                              last studied{" "}
                              {(() => {
                                const latestCompleted = task.revisions
                                  .filter((r) => r.completedAt)
                                  .sort(
                                    (a, b) =>
                                      new Date(b.completedAt) -
                                      new Date(a.completedAt),
                                  )[0];

                                return latestCompleted
                                  ? formatDistance(
                                      new Date(latestCompleted.completedAt),
                                      new Date(),
                                      {
                                        addSuffix: true,
                                      },
                                    )
                                  : "haven't studied this yet";
                              })()}
                            </p>
                          )}

                          <div className="mt-3">
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetails(task._id)}
                              className="text-sm w-full"
                            >
                              View details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
