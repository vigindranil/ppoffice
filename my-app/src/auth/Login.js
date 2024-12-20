import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);  // New state for toggling password visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/authenticate', {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.status === 0 && response.data.message === "Data found") {
        localStorage.setItem('authToken', response.data.access_token);

        const userData = response.data.data[0];
        sessionStorage.setItem('AuthorityUserID', userData.AuthorityUserID);
        sessionStorage.setItem('AuthorityTypeID', userData.AuthorityTypeID);
        sessionStorage.setItem('AuthorityName', userData.AuthorityName || userData.StaffName || 'Unknown');
        sessionStorage.setItem('BoundaryID', userData.BoundaryID || 'Unknown');

        console.log("AuthorityUserID stored in sessionStorage:", userData.AuthorityUserID);
        console.log("AuthorityName stored in sessionStorage:", userData.AuthorityName || userData.StaffName || 'Unknown');
        console.log("BoundaryID stored in sessionStorage:", userData.BoundaryID || 'Unknown');
        console.log("Full response data:", JSON.stringify(response.data, null, 2));
        console.log("Navigating with AuthorityTypeID:", userData.AuthorityTypeID);

        switch (parseInt(userData.AuthorityTypeID)) {
          case 20:
            navigate('/ppoadmin');
            break;
          case 10:
            navigate('/ppostaff');
            break;
          case 30:
            navigate('/SPCPDashboard');
            break;
          case 50:
            navigate('/psdash');
            break;
          default:
            console.log("Unknown AuthorityTypeID:", userData.AuthorityTypeID);
            navigate('/login');
        }
      } else {
        setErrorMessage('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(prevState => !prevState);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/ppoimage.webp")',
          filter: 'brightness(0.4)',
        }}
      />

      <div className="w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl z-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Login to your account</h1>

        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              required
            />
          </div>

          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}  // Conditionally toggle between 'text' and 'password'
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 text-gray-600"
            >
              {passwordVisible ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
