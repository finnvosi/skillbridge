import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '@skillbridge/ui';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../App';
import { colors, spacing, typography, radius } from '../../theme';

import { AppText } from './../../components/ui';
type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState<'student' | 'employer'>('student');
  const { register, error, clearError, loading } = useAuthStore();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    await register(email, password, name, role);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <AppText style={styles.logo}>Create account</AppText>
          <AppText style={styles.tagline}>Join SkillBridge in a few taps.</AppText>
        </View>

        <View style={styles.form}>
          <Input label="Full Name" placeholder="e.g. Sokha Chan" value={name} onChangeText={setName} />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={styles.roleBlock}>
            <AppText style={styles.roleLabel}>I am a</AppText>
            <View style={styles.roleOptions}>
              {(['student', 'employer'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, role === r && styles.roleOptionActive]}
                  onPress={() => setRole(r)}
                >
                  <AppText style={[styles.roleOptionText, role === r && styles.roleOptionTextActive]}>
                    {r === 'student' ? 'Student' : 'Employer'}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button onPress={handleRegister} loading={loading} disabled={loading} fullWidth>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </View>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
          <AppText style={styles.linkText}>
            Already have an account? <AppText style={styles.linkAccent}>Sign in</AppText>
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  brand: { marginBottom: spacing.xl },
  logo: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  tagline: { fontSize: typography.size.md, color: colors.textSecondary, marginTop: spacing.xs },
  form: { gap: spacing.sm },
  roleBlock: { marginTop: spacing.sm },
  roleLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  roleOptions: { flexDirection: 'row', gap: spacing.sm },
  roleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleOptionText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium as any,
  },
  roleOptionTextActive: { color: colors.primary, fontWeight: typography.weight.semibold as any },
  linkRow: { marginTop: spacing.xl, alignItems: 'center' },
  linkText: { fontSize: typography.size.base, color: colors.textSecondary },
  linkAccent: { color: colors.primary, fontWeight: typography.weight.semibold as any },
});
