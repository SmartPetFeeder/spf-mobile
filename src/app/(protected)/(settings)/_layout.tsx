import { useLocalization } from '@/utils/i18n';
import { Stack } from 'expo-router';

export default function Layout() {
  const { t: translateModule } = useLocalization();

  return (
    <Stack>
      <Stack.Screen
        name="settings"
        options={{
          title: translateModule('settings'),
        }}
      />
    </Stack>
  );
}
