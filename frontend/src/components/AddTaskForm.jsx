import React, { useState } from 'react';
import ApiCLient from '../utils/api.js';
import Button from './Button';
import InputField from './InputField';

const apiClient = new ApiCLient();

const AddTaskForm = ({ onClose, onTaskAdded }) => {
  const [heading, setHeading] = useState('');
  const [link, setLink] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [description, setDescription] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setDocumentFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.createTask(
        heading,
        link,
        startDate,
        description || undefined,
        documentFile || undefined,
      );
      setHeading('');
      setLink('');
      setStartDate(today);
      setDescription('');
      setDocumentFile(null);
      if (onTaskAdded) {
        onTaskAdded();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-gray-100">
      <h3 id="add-task-title" className="text-xl font-bold mb-4 text-gray-100">
        Add New Task
      </h3>
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
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-bold mb-2 text-gray-200"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-100 border-gray-600"
            placeholder="Notes or context for this task"
          />
        </div>
        <InputField
          label="Document (optional)"
          id="document"
          type="file"
          onChange={handleDocumentChange}
          className="bg-gray-700 text-gray-100 border-gray-600 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-600 file:text-gray-100"
          labelClassName="text-gray-200"
          accept="image/*,.pdf,.doc,.docx"
        />
        {documentFile && (
          <p className="text-gray-400 text-xs mb-4 -mt-2">
            Selected: {documentFile.name}
          </p>
        )}
        <InputField
          label="Link (optional)"
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
