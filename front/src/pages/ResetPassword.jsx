import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://nodejstask-servver.vercel.app/api';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, formData);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/');
      }, 2000); // Redirect to login after success
    } catch (err) {
      setError(err.response?.data?.message || 'Reset password failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleResetPassword} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="text"
          name="token"
          placeholder="Reset Token"
          value={formData.token}
          onChange={handleInputChange}
          className="block w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleInputChange}
          className="block w-full mb-3 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
