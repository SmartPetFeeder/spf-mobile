import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ProfileButton() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.navigate('profile')}>
      <MaterialCommunityIcons name="account-circle" size={22} color="#0853A9" />
    </TouchableOpacity>
  );
}
