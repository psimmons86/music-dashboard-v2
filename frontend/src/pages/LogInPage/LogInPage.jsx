import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as authService from '../../services/authService';

export default function LogInPage({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  function handleChange(evt) {
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
    setErrorMsg('');
  }

  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(evt) {
    evt.preventDefault();
    setErrorMsg('');
    try {
      console.log('Submitting login form:', formData.email); // Debug log
      const user = await authService.logIn(formData);
      if (user) {
        console.log('Login successful, user:', user); // Debug log
        setUser(user);
        // Verify token is stored
        const token = localStorage.getItem('token');
        console.log('Token stored:', token ? 'Yes' : 'No'); // Debug log
        // Navigate after ensuring token is stored
        if (token) {
          console.log('Navigating to:', from); // Debug log
          navigate(from, { replace: true });
        } else {
          throw new Error('Token not stored after login');
        }
      } else {
        console.log('Login failed - no user returned'); // Debug log
        setErrorMsg('Login failed - please try again');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Try to extract error message from different possible locations
      const errorMessage = err.toString() || 'Login failed - please try again';
      setErrorMsg(errorMessage);
    }
  }

  return (
    <div className="min-h-screen bg-[#98e4d3] flex items-center justify-center p-6">
      <div className="bg-[#d4e7aa]/95 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98e4d3] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#98e4d3] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#98e4d3] text-gray-800 py-2 rounded-lg font-semibold hover:bg-[#7dcfbe] transition-colors"
          >
            LOG IN
          </button>
          {errorMsg && (
            <p className="text-red-500 text-sm text-center mt-4">{errorMsg}</p>
          )}
        </form>
      </div>
    </div>
  );
}
