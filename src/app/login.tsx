import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import AuthService from '@/services/authService';
import { AuthContext } from '@/utils/authContext';
import { useLocalization } from '@/utils/i18n';
import Utils from '@/utils/Utils';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useContext, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const authContext = useContext(AuthContext);
  const { t: translateModule } = useLocalization();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage(translateModule('pleaseAllFields'));
      return;
    }

    if (!Utils.isValidEmail(email)) {
      setErrorMessage(translateModule('enterValidEmail'));
      return;
    }

    if (!Utils.isValidPassword(password)) {
      setErrorMessage(translateModule('passwordRequirements'));
      return;
    }

    try {
      await AuthService.login(email, password);

      setErrorMessage('');
      setSuccessMessage(translateModule('loginSuccessful'));

      setTimeout(() => {
        authContext.logIn();
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || translateModule('loginError'));
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <AppText size="extraHeading" center bold className="mb-4">
        {translateModule('login')}
      </AppText>
      <TextInput
        placeholder={translateModule('email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
      />
      <View className="relative mb-4">
        <View className="flex-row items-center border border-gray-300 rounded-md bg-white px-4 py-3">
          <TextInput
            placeholder={translateModule('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{ flex: 1 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>
      {errorMessage ? (
        <AppText size="small" center bold color="danger" className="text-red-500 mb-4">
          {errorMessage}
        </AppText>
      ) : null}
      {successMessage ? (
        <AppText size="small" center bold color="success" className="mb-4">
          {successMessage}
        </AppText>
      ) : null}
      <Button
        title={translateModule('logIn')}
        onPress={handleLogin}
        disabled={!email || !password}
      />
      <Link href="/register" asChild>
        <Button title={translateModule('dontHaveAccount')} theme="tertiary" />
      </Link>
    </View>
  );
}
