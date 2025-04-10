import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role');
  
  const getTitle = () => {
    switch (role) {
      case 'professional':
        return 'Professional Builder Login';
      case 'contractor':
        return 'Contractor Login';
      case 'worker':
        return 'Worker Login';
      default:
        return 'Login';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <LoginForm 
          title={getTitle()}
          showPasswordToggle={true}
          alternateActionText="Don't have an account?"
          alternateActionLink="/signup"
          alternateActionLinkText="Sign up now"
        />
      </div>
    </div>
  );
};

export default Login;
