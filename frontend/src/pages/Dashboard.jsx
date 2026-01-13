import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ApiCLient from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AddTaskForm from '../components/AddTaskForm.jsx'; // Import AddTaskForm
import Button from '../components/Button.jsx'; // Import Button for consistency

const apiClient = new ApiCLient();

const Dashboard = () => {
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [allPendingRevisions, setAllPendingRevisions] = useState([]);
  const [showAllPending, setShowAllPending] = useState(false);
  const [error, setError] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false); // State for modal visibility
  const { isLoggedIn, loading: authLoading } = useAuth();

  const fetchTasks = async () => {
    if (!isLoggedIn) return; // Only fetch if logged in

    setLoadingTasks(true);
    setError('');
    try {
      const todayData = await apiClient.getTodayRevision();
      setTodayRevisions(todayData.data || []);

      const allPendingData = await apiClient.getAllPendingRevision();
      setAllPendingRevisions(allPendingData.data || []);
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

  const handleCompleteRevision = async (taskId) => {
    try {
      await apiClient.completeRevision(taskId);
      fetchTasks(); // Refresh tasks after completion
    } catch (err) {
      setError(err.message || 'Failed to complete revision');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.deleteTask(taskId);
      fetchTasks(); // Refresh tasks after deletion
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  if (authLoading) {
    return <p className="text-center mt-8">Loading application...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>
        {loadingTasks && <p className="text-center">Loading tasks...</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button
            variant="primary"
            onClick={() => setShowAddTaskModal(true)}
          >
            Add New Task
          </Button>
        </div>

        {showAddTaskModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <AddTaskForm
                onClose={() => setShowAddTaskModal(false)}
                onTaskAdded={fetchTasks}
              />
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Today's Revisions</h3>
          {todayRevisions.length === 0 ? (
            <p>No revisions scheduled for today.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayRevisions.map((task) => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-xl font-bold mb-2">{task.heading}</h4>
                  <p className="text-gray-600 mb-2"><a href={task.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a></p>
                  {task.revisions && task.revisions.length > 0 && (
                    <p className="text-gray-500 text-sm mb-4">
                      Start Date: {new Date(task.revisions[0].scheduledAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="success"
                      onClick={() => handleCompleteRevision(task._id)}
                      className="text-sm"
                    >
                      Complete
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 flex justify-between items-center">
            All Pending Revisions
            <Button
              variant="secondary"
              onClick={() => setShowAllPending(!showAllPending)}
              className="text-sm"
            >
              {showAllPending ? 'Hide' : 'Show'}
            </Button>
          </h3>
          {showAllPending && (allPendingRevisions.length === 0 ? (
            <p>No pending revisions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPendingRevisions.map((task) => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-xl font-bold mb-2">{task.heading}</h4>
                  <p className="text-gray-600 mb-2"><a href={task.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a></p>
                  {task.revisions && task.revisions.length > 0 && (
                    <p className="text-gray-500 text-sm mb-4">
                      Start Date: {
                        new Date(task.revisions[0].scheduledAt).toString() !== 'Invalid Date'
                          ? new Date(task.revisions[0].scheduledAt).toLocaleDateString()
                          : 'N/A'
                      }
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;