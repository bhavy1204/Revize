import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ApiCLient from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AddTaskForm from '../components/AddTaskForm.jsx'; // Import AddTaskForm
import Button from  '../components/Button.jsx'; // Import Button for consistency
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

const apiClient = new ApiCLient();

const Dashboard = () => {
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [allPendingRevisions, setAllPendingRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [showAllPending, setShowAllPending] = useState(() => {
    try {
      const v = localStorage.getItem('showAllPending');
      return v === 'true';
    } catch {
      return false;
    }
  });
  const [showUpcoming, setShowUpcoming] = useState(() => {
    try {
      const v = localStorage.getItem('showAllUpcoming');
      return v === 'true';
    } catch {
      return false;
    }
  });
  const [error, setError] = useState('');
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
      const pending = localStorage.getItem('showAllPending') === 'true';
      const upcoming = localStorage.getItem('showAllUpcoming') === 'true';
      if (pending) return 'pending';
      if (upcoming) return 'upcoming';
    } catch {
      // ignore
    }
    return 'today';
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
    setError('');
    try {
      const todayData = await apiClient.getTodayRevision();
      setTodayRevisions(todayData.data || []);

      const allPendingData = await apiClient.getAllPendingRevision();
      setAllPendingRevisions(allPendingData.data || []);

      const upcomingData = await apiClient.getAllUpcomingRevisions();
      setUpcomingRevisions(upcomingData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
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
        const v = localStorage.getItem('showAllPending');
        setShowAllPending(v === 'true');
      } catch {
        // ignore
      }
    };

    const upcomingHandler = () => {
      try {
        const v = localStorage.getItem('showAllUpcoming');
        setShowUpcoming(v === 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('showAllPendingChange', handler);
    window.addEventListener('showAllUpcomingChange', upcomingHandler);
    window.addEventListener('storage', handler);
    window.addEventListener('storage', upcomingHandler);
    return () => {
      window.removeEventListener('showAllPendingChange', handler);
      window.removeEventListener('showAllUpcomingChange', upcomingHandler);
      window.removeEventListener('storage', handler);
      window.removeEventListener('storage', upcomingHandler);
    };
  }, []);

  const handleCompleteRevision = async (taskId) => {
    try {
      await apiClient.completeRevision(taskId);
      fetchTasks(); // Refresh tasks after completion
    } catch (err) {
      setError(err.message || 'Failed to complete revision');
    }
  };

  const handleViewDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const scrollToToday = () => {
    setActiveNav('today');
    setShowAllPending(false);
    setShowUpcoming(false);
    setTodayScrollRequested(true);
  };

  const showPendingSection = () => {
    setActiveNav('pending');
    setShowAllPending(true);
    setShowUpcoming(false);
    try {
      localStorage.setItem('showAllPending', 'true');
      window.dispatchEvent(new Event('showAllPendingChange'));
    } catch {
      // ignore
    }
    setPendingScrollRequested(true);
  };

  const showUpcomingSection = () => {
    setActiveNav('upcoming');
    setShowUpcoming(true);
    setShowAllPending(false);
    try {
      localStorage.setItem('showAllUpcoming', 'true');
      window.dispatchEvent(new Event('showAllUpcomingChange'));
    } catch {
      // ignore
    }
    setUpcomingScrollRequested(true);
  };

  useEffect(() => {
    if (todayScrollRequested && activeNav === 'today') {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTodayScrollRequested(false);
    }
  }, [todayScrollRequested, activeNav]);

  useEffect(() => {
    if (pendingScrollRequested && showAllPending) {
      pendingRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setPendingScrollRequested(false);
    }
  }, [pendingScrollRequested, showAllPending]);

  useEffect(() => {
    if (upcomingScrollRequested && showUpcoming) {
      upcomingRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setUpcomingScrollRequested(false);
    }
  }, [upcomingScrollRequested, showUpcoming]);

  // Keep the visible section in sync with the sidebar preferences
  useEffect(() => {
    if (showAllPending) setActiveNav('pending');
    else if (showUpcoming) setActiveNav('upcoming');
    else setActiveNav('today');
  }, [showAllPending, showUpcoming]);

  if (authLoading) {
    return <p className="text-center mt-8">Loading application...</p>;
  }

  const calendarMonthStart = startOfMonth(calendarViewDate);
  const calendarGridStart = startOfWeek(calendarMonthStart, { weekStartsOn: 1 }); // Monday
  const calendarDays = Array.from({ length: 42 }, (_, idx) =>
    addDays(calendarGridStart, idx),
  );

  return (
    <div>
      <Navbar />
      <div className="w-full px-4 py-4">
        <div className="lg:flex lg:gap-6 lg:items-start">
          {/* Large-screen sidebar */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col bg-gray-800 rounded-lg shadow p-4 sticky top-24 h-[calc(100vh-6rem)]">
            <div className="flex flex-col gap-3">
              <div className="text-gray-100 font-bold text-lg px-1">Menu</div>

              <button
                type="button"
                onClick={scrollToToday}
                className={`text-left px-3 py-2 rounded transition-colors ${
                  activeNav === 'today'
                    ? 'bg-gray-700 border-l-4 border-blue-500 pl-2'
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
              >
                todays task
              </button>

              <button
                type="button"
                onClick={showPendingSection}
                className={`text-left px-3 py-2 rounded transition-colors ${
                  activeNav === 'pending'
                    ? 'bg-gray-700 border-l-4 border-blue-500 pl-2'
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
              >
                pending
              </button>

              <button
                type="button"
                onClick={showUpcomingSection}
                className={`text-left px-3 py-2 rounded transition-colors ${
                  activeNav === 'upcoming'
                    ? 'bg-gray-700 border-l-4 border-blue-500 pl-2'
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
              >
                upcoming tasks
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/settings');
                }}
                className={`text-left px-3 py-2 rounded transition-colors ${
                  activeNav === 'settings'
                    ? 'bg-gray-700 border-l-4 border-blue-500 pl-2'
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
              >
                settings
              </button>
            </div>

            {/* Calendar at the bottom */}
            <div className="mt-auto pt-5 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  className="text-gray-200 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    const d = new Date(calendarViewDate);
                    d.setMonth(d.getMonth() - 1);
                    setCalendarViewDate(d);
                  }}
                  aria-label="Previous month"
                >
                  &lt;
                </button>
                <div className="text-gray-100 font-semibold">
                  {format(calendarViewDate, 'MMMM yyyy')}
                </div>
                <button
                  type="button"
                  className="text-gray-200 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
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

              <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] text-gray-400 px-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
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
                        'h-8 w-8 flex items-center justify-center rounded transition-colors text-sm',
                        isToday
                          ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                          : isSelected
                            ? 'bg-gray-700 text-white ring-2 ring-blue-300 hover:bg-gray-700'
                            : inMonth
                              ? 'text-gray-100 hover:bg-gray-700'
                              : 'text-gray-500 hover:bg-gray-700',
                      ].join(' ')}
                      aria-label={`Select ${format(day, 'yyyy-MM-dd')}`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>
            {loadingTasks && <p className="text-center">Loading tasks...</p>}
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}

            <div className="flex justify-end mb-4">
              <Button
                variant="primary"
                onClick={() => setShowAddTaskModal(true)}
              >
                Add New Task
              </Button>
            </div>

            {showAddTaskModal && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-100">
                  <AddTaskForm
                    onClose={() => setShowAddTaskModal(false)}
                    onTaskAdded={fetchTasks}
                  />
                </div>
              </div>
            )}

            {activeNav === 'today' && (
              <div ref={todayRef} className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">
                  Today's Revisions
                </h3>
                {todayRevisions.length === 0 ? (
                  <p>No revisions scheduled for today.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayRevisions.map((task) => (
                      <div
                        key={task._id}
                        className="bg-gray-800 p-4 rounded-lg shadow text-gray-100"
                      >
                        <h4 className="text-xl font-bold mb-2">
                          {task.heading}
                        </h4>
                        {task.revisions && task.revisions.length > 0 && (
                          <p className="text-gray-400 text-sm mb-4">
                            last studied{' '}
                            {(() => {
                              const latestCompleted = task.revisions
                                .filter((r) => r.completedAt)
                                .sort(
                                  (a, b) =>
                                    new Date(b.completedAt) -
                                    new Date(a.completedAt)
                                )[0];

                              return latestCompleted
                                ? formatDistance(
                                    new Date(latestCompleted.completedAt),
                                    new Date(),
                                    { addSuffix: true }
                                  )
                                : 'haven’t studied this yet';
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
                      view details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeNav === 'pending' && showAllPending && (
              <div ref={pendingRef}>
                {allPendingRevisions.length === 0 ? (
                  <p>No pending revisions.</p>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold mb-4">
                      Your Pending Revisions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allPendingRevisions.map((task) => (
                        <div
                          key={task._id}
                          className="bg-gray-800 p-4 rounded-lg shadow text-gray-100"
                        >
                          <h4 className="text-xl font-bold mb-2">
                            {task.heading}
                          </h4>
                          {task.revisions && task.revisions.length > 0 && (
                            <p className="text-gray-400 text-sm mb-4">
                              last studied{' '}
                              {(() => {
                                const latestCompleted = task.revisions
                                  .filter((r) => r.completedAt)
                                  .sort(
                                    (a, b) =>
                                      new Date(b.completedAt) -
                                      new Date(a.completedAt)
                                  )[0];

                                return latestCompleted
                                  ? formatDistance(
                                      new Date(latestCompleted.completedAt),
                                      new Date(),
                                      { addSuffix: true }
                                    )
                                  : 'haven’t studied this yet';
                              })()}
                            </p>
                          )}
                          <div className="flex justify-between gap-3">
                            <Button
                              variant="success"
                              onClick={() =>
                                handleCompleteRevision(task._id)
                              }
                              className="text-sm flex-1"
                            >
                              Complete
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetails(task._id)}
                              className="text-sm flex-1"
                            >
                              view details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeNav === 'upcoming' && showUpcoming && (
              <div ref={upcomingRef}>
                {upcomingRevisions.length === 0 ? (
                  <p>No upcoming revisions.</p>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold mb-4">
                      Your Upcoming Revisions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingRevisions.map((task) => (
                        <div
                          key={task._id}
                          className="bg-gray-800 p-4 rounded-lg shadow text-gray-100"
                        >
                          <h4 className="text-xl font-bold mb-2">
                            {task.heading}
                          </h4>
                          {task.revisions && task.revisions.length > 0 && (
                            <p className="text-gray-400 text-sm mb-4">
                              last studied{' '}
                              {(() => {
                                const latestCompleted = task.revisions
                                  .filter((r) => r.completedAt)
                                  .sort(
                                    (a, b) =>
                                      new Date(b.completedAt) -
                                      new Date(a.completedAt)
                                  )[0];

                                return latestCompleted
                                  ? formatDistance(
                                      new Date(latestCompleted.completedAt),
                                      new Date(),
                                      { addSuffix: true }
                                    )
                                  : 'haven’t studied this yet';
                              })()}
                            </p>
                          )}

                          <div className="mt-3">
                            <Button
                              variant="secondary"
                              onClick={() =>
                                handleViewDetails(task._id)
                              }
                              className="text-sm w-full"
                            >
                              view details
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