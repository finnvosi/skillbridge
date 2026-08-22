// Phone-first worker sign-in (blueprint §12): enter your number, we send a
// 6-digit code. Email/password remains available as a secondary path via the
// "Use email & password instead" link (email is recovery, not first access).
import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth';
import { useT } from '../../hooks/useT';
import type { RootStackParamList } from '../../navigation';
import { colors, spacing, typography, radius, TAP_MIN } from '../../theme';
import { AppText, Button, Card } from '../../components/ui';
import { Icon } from '../../components/Icon';

type PhoneSignInNav = NativeStackNavigationProp<RootStackParamList, 'PhoneSignIn'>;
interface Props {
  navigation: PhoneSignInNav;
}

export default function PhoneSignInScreen({ navigation }: Props) {
  const { t } = useT();
  const [phone, setPhone] = React.useState('');
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  React.useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      clearError();
    }
  }, [error, clearError, t]);

  const handleContinue = async () => {
    const cleaned = phone.replace(/[\s\-().]/g, '');
    if (cleaned.length < 8) {
      Alert.alert(t('common.error'), t('phone.invalid'));
      return;
    }
    const result = await requestOtp(cleaned);
    if (result) {
      navigation.navigate('OtpVerify', {
        phone: cleaned,
        demoCode: result.demoCode,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Icon name="phone" size={28} color={colors.primary} />
            </View>
            <AppText weight="display" style={styles.title}>
              {t('phone.title')}
            </AppText>
            <AppText style={styles.subtitle}>{t('phone.subtitle')}</AppText>
          </View>

          <AppText style={styles.label}>{t('phone.label')}</AppText>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder={t('phone.placeholder')}
              placeholderTextColor={colors.mutedLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoFocus
              accessibilityLabel={t('phone.label')}
            />
          </View>

          <Card style={styles.demoNote}>
            <Icon name="info" size={16} color={colors.muted} />
            <AppText style={styles.demoNoteText}>{t('phone.smsNote')}</AppText>
          </Card>

          <Button
            fullWidth
            loading={loading}
            disabled={loading || phone.trim().length < 8}
            onPress={handleContinue}
            style={styles.cta}
          >
            {t('phone.continue')}
          </Button>

          <Pressable
            style={styles.emailLink}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
          >
            <AppText style={styles.emailLinkText}>{t('phone.useEmail')}</AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  hero: { marginBottom: spacing.xl, alignItems: 'flex-start', gap: spacing.sm },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.muted,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    minHeight: TAP_MIN,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.ink,
    fontFamily: typography.fontFamily.regular,
    paddingVertical: spacing.md,
  },
  demoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.demoSoft,
  },
  demoNoteText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.muted,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  cta: { marginTop: spacing.xl },
  emailLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
    minHeight: TAP_MIN,
    justifyContent: 'center',
  },
  emailLinkText: {
    fontSize: typography.size.base,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
});
