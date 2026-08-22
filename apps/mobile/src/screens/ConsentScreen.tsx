// Consent / safety-promise gate (blueprint flow: language -> safety promise
// and consent -> phone sign-in). Honest framing: we verify, but never claim
// "100% safe"; no one may ask a worker to pay to apply.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../hooks/useT';
import { colors, spacing, typography, radius } from '../theme';
import { AppText, Button, Card } from '../components/ui';
import { Icon, IconName } from '../components/Icon';

export default function ConsentScreen() {
  const { t } = useT();
  const consentToTerms = useAppStore((s) => s.consentToTerms);

  const rows: { icon: IconName; text: string }[] = [
    { icon: 'shieldCheck', text: t('consent.verify') },
    { icon: 'lock', text: t('consent.noPay') },
    { icon: 'user', text: t('consent.passport') },
    { icon: 'flag', text: t('consent.report') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="shield" size={28} color={colors.primary} />
          </View>
          <AppText weight="display" style={styles.title}>
            {t('consent.title')}
          </AppText>
          <AppText style={styles.subtitle}>{t('consent.subtitle')}</AppText>
        </View>

        <View style={styles.rows}>
          {rows.map((row) => (
            <Card key={row.icon} style={styles.row}>
              <Icon name={row.icon} size={20} color={colors.primary} />
              <AppText style={styles.rowText}>{row.text}</AppText>
            </Card>
          ))}
        </View>

        <Button fullWidth onPress={consentToTerms} style={styles.cta} icon="arrowRight">
          {t('consent.agree')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
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
  rows: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowText: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.ink,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  cta: { marginTop: spacing.xl },
});
