import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Bookings = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user]);

  return <div>{user ? 'Your bookings...' : 'Redirecting...'}</div>;
};

export default Bookings;
