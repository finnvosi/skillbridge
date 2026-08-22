// Welcome / language choice. Khmer-first, with an English switch.
// Fully usable without a backend — choosing a language enters the worker app.
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../hooks/useT';
import { Locale } from '../types';
import { Icon } from '../components/Icon';
import { StatusPill } from '../components/ui';

import { AppText } from './../components/ui';
export default function WelcomeScreen() {
  const { t } = useT();
  const chooseLanguage = useAppStore((s) => s.chooseLanguage);
  const locale = useAppStore((s) => s.locale);

  const pick = (l: Locale) => chooseLanguage(l);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.badgeWrap}>
          <StatusPill icon="info" label={t('common.demo')} tone="neutral" />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="shieldCheck" size={40} color={colors.primary} />
          </View>
          <AppText weight="display" style={styles.title}>{t('welcome.title')}</AppText>
          <AppText style={styles.subtitle}>{t('welcome.subtitle')}</AppText>
          <AppText style={styles.uvp}>{t('app.uvp')}</AppText>
        </View>

        <View style={styles.chooseWrap}>
          <AppText style={styles.chooseLabel}>{t('welcome.chooseLanguage')}</AppText>

          <Pressable
            accessibilityRole="button"
            onPress={() => pick('km')}
            style={({ pressed }) => [styles.langCard, pressed && styles.langCardPressed, locale === 'km' && styles.langCardActive]}
          >
            <View style={[styles.langFlag, { backgroundColor: colors.primarySoft }]}>
              <Icon name="language" size={22} color={colors.primary} />
            </View>
            <View style={styles.langTextWrap}>
              <AppText style={styles.langName}>{t('welcome.khmer')}</AppText>
              <AppText style={styles.langHint}>Khmer</AppText>
            </View>
            {locale === 'km' ? <Icon name="checkCircle" size={20} color={colors.primary} /> : <Icon name="chevronRight" size={20} color={colors.muted} />}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => pick('en')}
            style={({ pressed }) => [styles.langCard, pressed && styles.langCardPressed, locale === 'en' && styles.langCardActive]}
          >
            <View style={[styles.langFlag, { backgroundColor: colors.primarySoft }]}>
              <Icon name="language" size={22} color={colors.primary} />
            </View>
            <View style={styles.langTextWrap}>
              <AppText style={styles.langName}>{t('welcome.english')}</AppText>
              <AppText style={styles.langHint}>English</AppText>
            </View>
            {locale === 'en' ? <Icon name="checkCircle" size={20} color={colors.primary} /> : <Icon name="chevronRight" size={20} color={colors.muted} />}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => pick(locale)}
          style={({ pressed }) => [styles.continue, pressed && styles.continuePressed]}
        >
          <Icon name="arrowRight" size={20} color={colors.white} />
          <AppText style={styles.continueText}>{t('welcome.continue')}</AppText>
        </Pressable>

        <AppText style={styles.demoNote}>{t('welcome.demoNote')}</AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  badgeWrap: { alignItems: 'flex-start' },
  hero: { alignItems: 'flex-start', gap: spacing.sm },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.muted,
  },
  uvp: {
    fontSize: typography.size.base,
    color: colors.primary,
    fontWeight: typography.weight.semibold as any,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginTop: spacing.xs,
  },
  chooseWrap: { gap: spacing.md },
  chooseLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.muted,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  langCardPressed: { backgroundColor: colors.primarySoft },
  langCardActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  langFlag: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTextWrap: { flex: 1 },
  langName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.ink,
  },
  langHint: { fontSize: typography.size.sm, color: colors.muted, marginTop: 2 },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 52,
    paddingVertical: spacing.md,
  },
  continuePressed: { opacity: 0.9 },
  continueText: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
  },
  demoNote: {
    fontSize: typography.size.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
});
