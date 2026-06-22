import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { checkUserAccess } from '@/lib/userService';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseProtectedRouteReturn {
  isLoading: boolean;
  isAccessDenied: boolean;
  denialReason: string;
}

export const useProtectedRoute = (): UseProtectedRouteReturn => {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (!currentUser) {
          navigate('/', { replace: true });
          return;
        }

        const accessCheck = await checkUserAccess(currentUser.id);

        if (!accessCheck.allowed) {
          if (accessCheck.status === 'pending') {
            setDenialReason(accessCheck.message);
            navigate('/waiting-for-approval', { replace: true });
          } else if (accessCheck.status === null) {
            try {
              await setDoc(doc(db, 'users', currentUser.id), {
                ...currentUser,
                createdAt: new Date().toISOString()
              });
              const recheckAccess = await checkUserAccess(currentUser.id);
              if (recheckAccess.allowed) {
                setIsLoading(false);
                return;
              }
              if (recheckAccess.status === 'pending') {
                navigate('/waiting-for-approval', { replace: true });
              }
            } catch (error) {
              setIsAccessDenied(true);
              setDenialReason('Unable to verify account. Please contact support.');
              setTimeout(() => navigate('/', { replace: true }), 5000);
            }
          } else {
            setIsAccessDenied(true);
            setDenialReason(accessCheck.message);
            setTimeout(() => navigate('/', { replace: true }), 5000);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying access:', error);
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  return { isLoading, isAccessDenied, denialReason };
};