// OTP entry for phone-first worker sign-in. On success the auth gate in
// App.tsx flips to the worker tabs — no manual navigation needed.
import React from 'react';
import { View, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth';
import { useT } from '../../hooks/useT';
import type { RootStackParamList } from '../../navigation';
import { colors, spacing, typography, radius, TAP_MIN } from '../../theme';
import { AppText, Button, Card } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { BackBar } from '../../components/BackBar';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen({ navigation, route }: Props) {
  const { phone, demoCode } = route.params;
  const { t } = useT();
  const [code, setCode] = React.useState(demoCode ?? '');
  const [resending, setResending] = React.useState(false);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
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

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert(t('common.error'), t('otp.invalid'));
      return;
    }
    await verifyOtp(phone, code);
  };

  const handleResend = async () => {
    setResending(true);
    const result = await requestOtp(phone);
    setResending(false);
    if (result?.demoCode) setCode(result.demoCode);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={t('otp.title')} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <AppText style={styles.subtitle}>{t('otp.subtitle', { phone })}</AppText>

        <AppText style={styles.label}>{t('otp.placeholder')}</AppText>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor={colors.mutedLight}
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^\d]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            accessibilityLabel={t('otp.placeholder')}
          />
        </View>

        {demoCode ? (
          <Card style={styles.demoNote}>
            <Icon name="info" size={16} color={colors.muted} />
            <AppText style={styles.demoNoteText}>
              {t('otp.demoHint', { code: demoCode })}
            </AppText>
          </Card>
        ) : null}

        <Button
          fullWidth
          loading={loading}
          disabled={loading || code.length !== 6}
          onPress={handleVerify}
          style={styles.cta}
        >
          {t('otp.verify')}
        </Button>

        <Pressable
          style={styles.resend}
          onPress={handleResend}
          disabled={resending}
          accessibilityRole="button"
        >
          <AppText style={styles.resendText}>
            {resending ? t('common.loading') : t('otp.resend')}
          </AppText>
        </Pressable>

        <Pressable
          style={styles.resend}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <AppText style={styles.backLinkText}>{t('otp.back')}</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.muted,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    minHeight: TAP_MIN,
    justifyContent: 'center',
  },
  codeInput: {
    fontSize: typography.size.xl,
    letterSpacing: 10,
    color: colors.ink,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
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
  resend: {
    marginTop: spacing.lg,
    alignItems: 'center',
    minHeight: TAP_MIN,
    justifyContent: 'center',
  },
  resendText: {
    fontSize: typography.size.base,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
  backLinkText: {
    fontSize: typography.size.base,
    color: colors.muted,
  },
});
