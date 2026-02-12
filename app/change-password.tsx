import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleChangePassword = async () => {
    // Validation
    if (!formData.currentPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe actuel');
      return;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez confirmer votre nouveau mot de passe');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent du mot de passe actuel');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      Alert.alert('Mot de passe faible', passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      await changePassword(formData.currentPassword, formData.newPassword);
      Alert.alert('Succès', 'Votre mot de passe a été changé avec succès', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de changer le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 'faible', color: '#999', percentage: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return { strength: 'Faible', color: '#FF3B30', percentage: 33 };
    if (score <= 4) return { strength: 'Moyen', color: '#FF9500', percentage: 66 };
    return { strength: 'Fort', color: '#34C759', percentage: 100 };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changer le mot de passe</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations utilisateur */}
        <View style={styles.userInfoSection}>
          <View style={styles.userInfoBox}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.userInfoText}>
              Connecté en tant que <Text style={styles.userEmail}>{user?.email}</Text>
            </Text>
          </View>
        </View>

        {/* Mot de passe actuel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité du compte</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe actuel</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                placeholder="Entrez votre mot de passe actuel"
                secureTextEntry={!showCurrentPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={loading}>
                <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Vous devez entrer votre mot de passe actuel pour des raisons de sécurité
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPasswordLink}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        {/* Nouveau mot de passe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nouveau mot de passe</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={formData.newPassword}
                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                placeholder="Entrez un nouveau mot de passe"
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}>
                <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Indicateur de force */}
          {formData.newPassword && (
            <View style={styles.strengthSection}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthIndicator,
                    {
                      width: `${passwordStrength.percentage}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                Force: {passwordStrength.strength}
              </Text>
            </View>
          )}

          {/* Critères de mot de passe */}
          <View style={styles.criteriaSection}>
            <Text style={styles.criteriaTitle}>Critères du mot de passe:</Text>
            <PasswordCriterion
              label="Au moins 8 caractères"
              met={formData.newPassword.length >= 8}
            />
            <PasswordCriterion
              label="Au moins une majuscule"
              met={/[A-Z]/.test(formData.newPassword)}
            />
            <PasswordCriterion
              label="Au moins une minuscule"
              met={/[a-z]/.test(formData.newPassword)}
            />
            <PasswordCriterion
              label="Au moins un chiffre"
              met={/[0-9]/.test(formData.newPassword)}
            />
            <PasswordCriterion
              label="Au moins un caractère spécial (optionnel)"
              met={/[!@#$%^&*]/.test(formData.newPassword)}
              optional
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Confirmez votre nouveau mot de passe"
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}>
                <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
            )}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <Text style={styles.successText}>Les mots de passe correspondent ✓</Text>
            )}
          </View>
        </View>

        {/* Conseils de sécurité */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Conseils de sécurité</Text>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Utilisez un mot de passe unique que vous n'utilisez nulle part ailleurs
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Ne partagez jamais votre mot de passe avec quiconque
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Changez régulièrement votre mot de passe pour plus de sécurité
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Utilisez l'authentification à deux facteurs si disponible
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.changeButton]}
          onPress={handleChangePassword}
          disabled={loading || !formData.currentPassword || !formData.newPassword}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Changer le mot de passe</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PasswordCriterion({
  label,
  met,
  optional = false,
}: {
  label: string;
  met: boolean;
  optional?: boolean;
}) {
  return (
    <View style={styles.criterion}>
      <View
        style={[
          styles.criterionDot,
          {
            backgroundColor: met ? '#34C759' : '#ddd',
          },
        ]}>
        {met && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={[styles.criterionText, !met && styles.criterionTextUnmet]}>
        {label}
        {optional && <Text style={styles.optionalText}> (optionnel)</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  userInfoSection: {
    padding: 16,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  userInfoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userEmail: {
    fontWeight: '600',
    color: '#007AFF',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  forgotPasswordLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    paddingHorizontal: 20,
    textDecorationLine: 'underline',
  },
  strengthSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthIndicator: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  criteriaSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  criterion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  criterionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  criterionText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  criterionTextUnmet: {
    color: '#999',
  },
  optionalText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 8,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB200',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tip: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  changeButton: {
    backgroundColor: '#4ECDC4',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
