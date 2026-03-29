import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDays, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import Navbar from '../components/Navbar.jsx';
import ApiCLient from '../utils/api.js';

const apiClient = new ApiCLient();

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sidebar state (mirrors Dashboard)
  const todayDate = useRef(new Date()).current;
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

  // Calendar state (bottom of sidebar)
  const [calendarViewDate, setCalendarViewDate] = useState(todayDate);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayDate);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await apiClient.getTask(taskId);
        setTask(res.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load task details');
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) fetchTask();
  }, [taskId]);

  const calendarMonthStart = startOfMonth(calendarViewDate);
  const calendarGridStart = startOfWeek(calendarMonthStart, { weekStartsOn: 1 }); // Monday
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
    if (val === null || val === undefined || val === '') return 'Not available';
    return val;
  };

  const formatDateMaybe = (val, fmt = 'PPpp') => {
    if (!val) return 'Not available';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return 'Not available';
    return format(d, fmt);
  };

  const handleSidebarToday = () => {
    setActiveNav('today');
    try {
      localStorage.setItem('showAllPending', 'false');
      localStorage.setItem('showAllUpcoming', 'false');
      window.dispatchEvent(new Event('showAllPendingChange'));
      window.dispatchEvent(new Event('showAllUpcomingChange'));
    } catch {
      // ignore
    }
    navigate('/');
  };

  const handleSidebarPending = () => {
    setActiveNav('pending');
    try {
      localStorage.setItem('showAllPending', 'true');
      localStorage.setItem('showAllUpcoming', 'false');
      window.dispatchEvent(new Event('showAllPendingChange'));
      window.dispatchEvent(new Event('showAllUpcomingChange'));
    } catch {
      // ignore
    }
    navigate('/');
  };

  const handleSidebarUpcoming = () => {
    setActiveNav('upcoming');
    try {
      localStorage.setItem('showAllUpcoming', 'true');
      localStorage.setItem('showAllPending', 'false');
      window.dispatchEvent(new Event('showAllPendingChange'));
      window.dispatchEvent(new Event('showAllUpcomingChange'));
    } catch {
      // ignore
    }
    navigate('/');
  };

  const handleSidebarSettings = () => {
    setActiveNav('settings');
    navigate('/settings');
  };

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
                onClick={handleSidebarToday}
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
                onClick={handleSidebarPending}
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
                onClick={handleSidebarUpcoming}
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
                onClick={handleSidebarSettings}
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
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (d) => (
                    <div key={d} className="text-center">
                      {d}
                    </div>
                  ),
                )}
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
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-100 mb-6">
                {task?.heading || 'Task details'}
              </h1>

              {loading && <p className="text-center">Loading...</p>}
              {error && (
                <p className="text-red-400 text-center mb-4">{error}</p>
              )}

              {!loading && !error && task && (
                <div className="space-y-5">
                  <section className="bg-gray-800 rounded-lg shadow p-5">
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">
                      Task details
                    </h2>

                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Task ID</span>
                        <span className="text-right">
                          {formatMaybe(task._id)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Creator</span>
                        <span className="text-right">
                          {formatMaybe(task.creator)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Heading</span>
                        <span className="text-right">
                          {formatMaybe(task.heading)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Link</span>
                        <span className="text-right">
                          {formatMaybe(task.link)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Description</span>
                        <span className="text-right">
                          {formatMaybe(task.description)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Created at</span>
                        <span className="text-right">
                          {formatDateMaybe(task.createdAt)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Updated at</span>
                        <span className="text-right">
                          {formatDateMaybe(task.updatedAt)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">__v</span>
                        <span className="text-right">
                          {formatMaybe(task.__v)}
                        </span>
                      </div>

                      <div>
                        <div className="text-gray-400 mb-1">
                          Document
                        </div>
                        {task.document ? (
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>
                              <span className="text-gray-400">
                                URL:
                              </span>{' '}
                              {formatMaybe(task.document.url)}
                            </div>
                            <div>
                              <span className="text-gray-400">
                                Public ID:
                              </span>{' '}
                              {formatMaybe(task.document.publicId)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-300">
                            Not available
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="bg-gray-800 rounded-lg shadow p-5">
                    <h2 className="text-xl font-semibold text-gray-100 mb-3">
                      Revisions history
                    </h2>

                    {revisions.length === 0 ? (
                      <p className="text-gray-300">
                        Not available
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {revisions.map((rev, idx) => {
                          const scheduledText = formatDateMaybe(
                            rev?.scheduledAt,
                            'PP',
                          );
                          const completedAt = rev?.completedAt;
                          const completedText = completedAt
                            ? formatDateMaybe(completedAt, 'PP')
                            : null;

                          return (
                            <div
                              key={`${rev?.scheduledAt || idx}`}
                              className="bg-gray-900 rounded-md p-4 border border-gray-700"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-gray-300 text-sm">
                                    Revision {idx + 1}
                                  </p>
                                  <p className="text-gray-300 text-sm mt-1">
                                    Scheduled:{' '}
                                    {scheduledText}
                                  </p>
                                  <p className="text-gray-300 text-sm mt-1">
                                    Completed:{' '}
                                    {completedText || 'Not available'}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p
                                    className={[
                                      'inline-flex items-center px-3 py-1 rounded text-xs font-semibold',
                                      completedText
                                        ? 'bg-green-900 text-green-200 border border-green-700'
                                        : 'bg-blue-900 text-blue-200 border border-blue-700',
                                    ].join(' ')}
                                  >
                                    {completedText ? 'Completed' : 'Pending'}
                                  </p>
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

