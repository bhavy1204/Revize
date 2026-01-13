import React, { useState } from 'react';
import ApiCLient from '../utils/api.js';
import Button from './Button';
import InputField from './InputField';

const apiClient = new ApiCLient();

const AddTaskForm = ({ onClose, onTaskAdded }) => {
  const [heading, setHeading] = useState('');
  const [link, setLink] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today); // YYYY-MM-DD format
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.createTask(heading, link, startDate);
      setHeading('');
      setLink('');
      setStartDate('');
      if (onTaskAdded) {
        onTaskAdded(); // Notify parent component (Dashboard) to refresh tasks
      }
      if (onClose) {
        onClose(); // Close the form/modal
      }
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-100">Add New Task</h3>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          label="Task Heading"
          id="heading"
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          required
          className="bg-gray-700 text-gray-100 border-gray-600"
          labelClassName="text-gray-200"
        />
        <InputField
          label="Link (Optional)"
          id="link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="bg-gray-700 text-gray-100 border-gray-600"
          labelClassName="text-gray-200"
        />
        <InputField
          label="Start Date"
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="bg-gray-700 text-gray-100 border-gray-600"
          labelClassName="text-gray-200"
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;