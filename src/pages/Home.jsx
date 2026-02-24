import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';

export default function Home() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return <Landing />;
}