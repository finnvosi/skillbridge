// Help — safety categories + entry to the report flow. No apply required.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, TAP_MIN } from '../theme';
import { ReportCategory } from '../types';
import { useT } from '../hooks/useT';
import { Header } from '../components/Header';
import { Card, Button, DemoTag } from '../components/ui';
import { Icon, IconName } from '../components/Icon';
import { useAuthStore } from '../store/auth';

import { AppText } from './../components/ui';
const CATEGORIES: { cat: ReportCategory; icon: IconName; key: string }[] = [
  { cat: 'payment_requested', icon: 'money', key: 'help.cat.payment' },
  { cat: 'false_information', icon: 'alert', key: 'help.cat.false' },
  { cat: 'recruiter_identity', icon: 'user', key: 'help.cat.identity' },
  { cat: 'unsafe_contact', icon: 'flag', key: 'help.cat.unsafe' },
  { cat: 'other', icon: 'list', key: 'help.cat.other' },
];

export default function HelpScreen({
  onReport,
  onSafetyCenter,
}: {
  onReport: (cat?: ReportCategory) => void;
  onSafetyCenter?: () => void;
}) {
  const { t } = useT();
  const logout = useAuthStore((s) => s.logout);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header right={<DemoTag onDark />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <AppText style={styles.title} weight="display">{t('help.title')}</AppText>
          <AppText style={styles.subtitle}>{t('help.subtitle')}</AppText>
        </View>

        <Card style={styles.promise}>
          <Icon name="shield" size={18} color={colors.primary} />
          <AppText style={styles.promiseText}>{t('help.promise')}</AppText>
        </Card>

        <AppText style={styles.scamTitle}>{t('help.scamTitle')}</AppText>
        <View style={styles.cats}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.cat}
              accessibilityRole="button"
              onPress={() => onReport(c.cat)}
              style={({ pressed }) => [styles.cat, pressed && styles.catPressed]}
            >
              <View style={[styles.catIcon, { backgroundColor: colors.accentSoft }]}>
                <Icon name={c.icon} size={20} color={colors.accent} />
              </View>
              <AppText style={styles.catText}>{t(c.key)}</AppText>
              <Icon name="chevronRight" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.cta}>
          <Button variant="danger" icon="flag" fullWidth onPress={() => onReport()}>
            {t('help.report')}
          </Button>
          <AppText style={styles.noApply}>{t('help.noApplyNeeded')}</AppText>
        </View>

        {onSafetyCenter ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSafetyCenter}
            style={({ pressed }) => [styles.cat, pressed && styles.catPressed]}
          >
            <View style={[styles.catIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="shieldCheck" size={20} color={colors.primary} />
            </View>
            <AppText style={styles.catText}>{t('safety.entry')}</AppText>
            <Icon name="chevronRight" size={18} color={colors.muted} />
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => logout()}
          style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        >
          <Icon name="arrowRight" size={18} color={colors.muted} />
          <AppText style={styles.logoutText}>{t('auth.logout')}</AppText>
        </Pressable>
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  head: { gap: spacing.xs },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.ink },
  subtitle: { fontSize: typography.size.base, color: colors.muted },
  promise: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  promiseText: { flex: 1, fontSize: typography.size.sm, color: colors.primary, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  scamTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.muted },
  cats: { gap: spacing.sm },
  cat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    minHeight: TAP_MIN + 8,
  },
  catPressed: { backgroundColor: colors.surfaceMuted },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catText: { flex: 1, fontSize: typography.size.base, fontWeight: typography.weight.medium, color: colors.ink },
  cta: { gap: spacing.sm, marginTop: spacing.sm },
  noApply: { fontSize: typography.size.sm, color: colors.muted, textAlign: 'center', lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  logoutPressed: { backgroundColor: colors.surfaceMuted },
  logoutText: { fontSize: typography.size.base, color: colors.muted, fontWeight: typography.weight.medium },
});
