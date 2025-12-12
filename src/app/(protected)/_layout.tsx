import { AuthContext } from '@/utils/authContext';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (authState.isReady && authState.isLoggedIn) {
      router.replace('/(protected)/(tabs)/(settings)');
    }
  }, [authState.isReady, authState.isLoggedIn, router]);

  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
