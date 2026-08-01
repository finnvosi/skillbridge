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

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login, error, clearError, loading } = useAuthStore();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    await login(email, password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.logo}>SkillBridge</Text>
          <Text style={styles.tagline}>Bridge your skills to real work.</Text>
        </View>

        <View style={styles.form}>
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
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </View>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkAccent}>Create an account</Text>
          </Text>
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
  brand: { marginBottom: spacing.xxxl, alignItems: 'flex-start' },
  logo: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold as any,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: { gap: spacing.sm },
  linkRow: { marginTop: spacing.xl, alignItems: 'center' },
  linkText: { fontSize: typography.size.base, color: colors.textSecondary },
  linkAccent: {
    color: colors.primary,
    fontWeight: typography.weight.semibold as any,
  },
});
