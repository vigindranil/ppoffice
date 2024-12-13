import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  // Check if the user is authenticated by checking the sessionStorage or localStorage
  const isAuthenticated = sessionStorage.getItem('AuthorityUserID') || localStorage.getItem('authToken');

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the requested component
  return element;
};

export default PrivateRoute;
