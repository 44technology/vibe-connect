import { useEffect } from 'react';
import { router } from 'expo-router';

export default function IndexScreen() {
  useEffect(() => {
    // Redirect to /projects for all users
    router.replace('/projects');
  }, []);

  return null;
}
