import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { User } from '@/models/User';
import AuthService from '@/services/authService';
import { useLocalization } from '@/utils/i18n';
import Utils from '@/utils/Utils';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { t: translateModule } = useLocalization();
  const [formData, setFormData] = useState<User>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: undefined,
    address: '',
    zip_code: undefined,
    country: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof User, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  useEffect(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: undefined,
      address: '',
      zip_code: undefined,
      country: '',
      password: '',
    });
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  }, [router]);

  const handleRegister = async () => {
    const { first_name, last_name, email, phone_number, address, zip_code, country, password } =
      formData;

    if (!first_name || !last_name || !email || !password) {
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

    if (password !== confirmPassword) {
      setErrorMessage(translateModule('passwordsDoNotMatch'));
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage(translateModule('registering'));

      await AuthService.register({
        first_name,
        last_name,
        email,
        phone_number,
        address,
        zip_code,
        country,
        password,
      });

      setSuccessMessage(translateModule('registrationSuccessful'));
      setTimeout(() => {
        router.navigate('/login');
      }, 1000);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMessage(translateModule('emailAlreadyExists'));
      } else {
        setErrorMessage(error.message || translateModule('registrationFailed'));
      }
      setSuccessMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 16,
        }}
        keyboardShouldPersistTaps="handled">
        <AppText size="extraHeading" center bold className="mb-4">
          {translateModule('signup')}
        </AppText>
        <TextInput
          placeholder={translateModule('firstName')}
          value={formData.first_name}
          onChangeText={(value) => handleInputChange('first_name', value)}
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <TextInput
          placeholder={translateModule('lastName')}
          value={formData.last_name}
          onChangeText={(value) => handleInputChange('last_name', value)}
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <TextInput
          placeholder={translateModule('email')}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <TextInput
          placeholder={translateModule('phoneNumber')}
          value={formData.phone_number?.toString()}
          onChangeText={(value) => handleInputChange('phone_number', value)}
          keyboardType="phone-pad"
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <TextInput
          placeholder={translateModule('address')}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <TextInput
          placeholder={translateModule('zipCode')}
          value={formData.zip_code?.toString()}
          onChangeText={(value) => handleInputChange('zip_code', value)}
          keyboardType="numeric"
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <TextInput
          placeholder={translateModule('country')}
          value={formData.country}
          onChangeText={(value) => handleInputChange('country', value)}
          className="border border-gray-300 rounded-md px-4 py-3 mb-4 bg-white"
        />
        <View className="relative mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-md bg-white px-4 py-3">
            <TextInput
              placeholder={translateModule('password')}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
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
        <View className="relative mb-4">
          <TextInput
            placeholder={translateModule('confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            className="border border-gray-300 rounded-md px-4 py-3 bg-white"
          />
        </View>
        {errorMessage ? (
          <AppText size="small" center className="text-red-500 mb-4">
            {errorMessage}
          </AppText>
        ) : null}
        {successMessage ? (
          <AppText size="small" center className="text-green-500 mb-4">
            {successMessage}
          </AppText>
        ) : null}
        <Button
          title={translateModule('signup')}
          onPress={handleRegister}
          disabled={
            !formData.first_name ||
            !formData.last_name ||
            !formData.email ||
            !formData.password ||
            !confirmPassword
          }
        />
        <Link href="/login" push asChild>
          <Button title={translateModule('alreadyHaveAccount')} theme="tertiary" />
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
