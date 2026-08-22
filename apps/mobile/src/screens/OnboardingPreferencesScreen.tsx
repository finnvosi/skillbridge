// Worker preferences onboarding (blueprint §7 must-ship): after consent +
// phone sign-in, the worker chooses area / shift / skills / languages before
// browsing jobs. Saves to the identity-derived PATCH endpoint, then marks
// onboarding complete — the App gate flips to the four tabs.
import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, TAP_MIN } from '../theme';
import { useT } from '../hooks/useT';
import { useAuthStore } from '../store/auth';
import { AppText, Button, Card, SectionLabel } from '../components/ui';
import { Icon } from '../components/Icon';
import { updatePassport, completeOnboarding } from '../services/workerApi';
import { ApiError } from '../services/api';

interface Option {
  value: string;
  labelKey: string;
}

const AREAS: Option[] = [
  { value: 'Phnom Penh', labelKey: 'onboarding.area.phnomPenh' },
  { value: 'Kandal', labelKey: 'onboarding.area.kandal' },
  { value: 'Kampong Speu', labelKey: 'onboarding.area.kampongSpeu' },
  { value: 'Sihanoukville', labelKey: 'onboarding.area.sihanoukville' },
];

// Shift values match the API's ShiftType; labels reuse the job.* strings.
const SHIFTS: Option[] = [
  { value: 'day', labelKey: 'job.day' },
  { value: 'night', labelKey: 'job.night' },
  { value: 'rotating', labelKey: 'job.rotating' },
  { value: 'flexible', labelKey: 'job.flexible' },
];

const SKILLS: Option[] = [
  { value: 'Sewing', labelKey: 'onboarding.skill.sewing' },
  { value: 'Quality control', labelKey: 'onboarding.skill.qualityControl' },
  { value: 'Cutting', labelKey: 'onboarding.skill.cutting' },
  { value: 'Packing', labelKey: 'onboarding.skill.packing' },
  { value: 'Warehouse', labelKey: 'onboarding.skill.warehouse' },
  { value: 'Forklift', labelKey: 'onboarding.skill.forklift' },
  { value: 'Machine operator', labelKey: 'onboarding.skill.machineOperator' },
];

const LANGS: Option[] = [
  { value: 'Khmer', labelKey: 'welcome.khmer' },
  { value: 'English', labelKey: 'welcome.english' },
];

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Icon name="check" size={14} color={active ? colors.white : colors.mutedLight} />
      <AppText style={[styles.chipText, active ? styles.chipTextActive : null]}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function OnboardingPreferencesScreen() {
  const { t } = useT();
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [area, setArea] = useState<string | null>(null);
  const [shift, setShift] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>(['Khmer']);
  const [saving, setSaving] = useState(false);

  const toggle = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const handleSave = async () => {
    if (!area || !shift) {
      Alert.alert(t('common.error'), t('onboarding.required'));
      return;
    }
    setSaving(true);
    try {
      await updatePassport(
        { preferredArea: area, availability: shift, skills, languages: langs },
        token,
      );
      await completeOnboarding(token);
      // The App gate reads onboardingCompleted and flips to the tabs.
      updateUser({ onboardingCompleted: true });
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('onboarding.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const section = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <SectionLabel>{title}</SectionLabel>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="user" size={28} color={colors.primary} />
          </View>
          <AppText weight="display" style={styles.title}>{t('onboarding.title')}</AppText>
          <AppText style={styles.subtitle}>{t('onboarding.subtitle')}</AppText>
        </View>

        {section(
          t('onboarding.area'),
          AREAS.map((o) => (
            <Chip key={o.value} label={t(o.labelKey)} active={area === o.value} onPress={() => setArea(o.value)} />
          )),
        )}

        {section(
          t('onboarding.availability'),
          SHIFTS.map((o) => (
            <Chip key={o.value} label={t(o.labelKey)} active={shift === o.value} onPress={() => setShift(o.value)} />
          )),
        )}

        {section(
          t('onboarding.skills'),
          SKILLS.map((o) => (
            <Chip
              key={o.value}
              label={t(o.labelKey)}
              active={skills.includes(o.value)}
              onPress={() => setSkills((prev) => toggle(prev, o.value))}
            />
          )),
        )}

        {section(
          t('onboarding.languages'),
          LANGS.map((o) => (
            <Chip
              key={o.value}
              label={t(o.labelKey)}
              active={langs.includes(o.value)}
              onPress={() => setLangs((prev) => toggle(prev, o.value))}
            />
          )),
        )}

        <Button fullWidth loading={saving} disabled={saving} onPress={handleSave} style={styles.cta} icon="arrowRight">
          {saving ? t('onboarding.saving') : t('onboarding.save')}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  hero: { marginBottom: spacing.xl, gap: spacing.sm },
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
  section: { marginBottom: spacing.xl },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    minHeight: 40,
  },
  chipActive: { backgroundColor: colors.primary },
  chipInactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.muted },
  chipTextActive: { color: colors.white },
  cta: { marginTop: spacing.md },
});
