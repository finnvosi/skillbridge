// Edit Passport — worker edits their own self-declared profile fields.
// Identity and verified work records are NOT editable here (verifier-controlled).
// On save, the change is written to the worker's own WorkerProfile via the
// identity-derived PATCH endpoint (SEC-1: no client-supplied workerId).
import React, { useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useT } from '../hooks/useT';
import { useAuthStore } from '../store/auth';
import { Icon } from '../components/Icon';
import { Header } from '../components/Header';
import { Card, Button, SectionLabel, AppText } from '../components/ui';
import { updatePassport } from '../services/workerApi';
import { USE_REMOTE_API } from '../config';
import { DemoPassport } from '../types';

interface ProfileEditScreenProps {
  passport: DemoPassport;
  onSaved: (next: DemoPassport) => void;
  onCancel: () => void;
}

function TagEditor({
  label,
  items,
  onItemsChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onItemsChange: (next: string[]) => void;
  placeholder: string;
}) {
  const { t } = useT();
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) {
      setDraft('');
      return;
    }
    onItemsChange([...items, v]);
    setDraft('');
  };
  const remove = (s: string) => onItemsChange(items.filter((x) => x !== s));

  return (
    <Card style={styles.card}>
      <SectionLabel>{label}</SectionLabel>
      <View style={styles.chips}>
        {items.map((s) => (
          <PressableOpacity key={s} onPress={() => remove(s)}>
            <View style={styles.chip}>
              <AppText style={styles.chipText}>{s}</AppText>
              <Icon name="close" size={14} color={colors.muted} />
            </View>
          </PressableOpacity>
        ))}
      </View>
      <View style={styles.tagRow}>
        <TextInput
          style={styles.tagInput}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedLight}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <PressableOpacity onPress={add} hitSlop={styles.hit}>
          <View style={styles.addBtn}>
            <AppText style={styles.addBtnText}>{t('profile.addOne')}</AppText>
          </View>
        </PressableOpacity>
      </View>
    </Card>
  );
}

// Local Pressable wrapper — keeps the file dependency-light and matches the
// existing screens that import Pressable directly from react-native.
import { Pressable } from 'react-native';
function PressableOpacity({
  children,
  onPress,
  hitSlop,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  hitSlop?: import('react-native').Insets | number;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={hitSlop} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {children}
    </Pressable>
  );
}

export default function ProfileEditScreen({ passport, onSaved, onCancel }: ProfileEditScreenProps) {
  const { t } = useT();
  const token = useAuthStore((s) => s.token);

  const [fullName, setFullName] = useState(passport.fullName ?? '');
  const [preferredArea, setPreferredArea] = useState(passport.preferredArea ?? '');
  const [availability, setAvailability] = useState(passport.availability ?? '');
  const [skills, setSkills] = useState<string[]>(passport.skills.map((s) => s.name));
  const [languages, setLanguages] = useState<string[]>(passport.languages);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    const body = {
      fullName: fullName.trim() || undefined,
      preferredArea: preferredArea.trim() || undefined,
      availability: availability.trim() || undefined,
      skills: skills.length ? skills : undefined,
      languages: languages.length ? languages : undefined,
    };

    // No remote API / no token: keep the edit local so the demo loop still works.
    if (!USE_REMOTE_API || !token) {
      onSaved({
        ...passport,
        fullName: body.fullName ?? passport.fullName,
        preferredArea: body.preferredArea ?? passport.preferredArea,
        availability: body.availability ?? passport.availability,
        skills: (body.skills ?? passport.skills.map((s) => s.name)).map((name) => ({ name, verified: false })),
        languages: body.languages ?? passport.languages,
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePassport(body, token);
      if (!updated) {
        setError(t('profile.saveError'));
        return;
      }
      onSaved(updated);
    } catch {
      setError(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header right={<DemoTag />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.title} weight="display">
          {t('passport.editTitle')}
        </AppText>
        <AppText style={styles.subtitle}>{t('passport.editSubtitle')}</AppText>

        <Card style={styles.card}>
          <SectionLabel>{t('profile.fullName')}</SectionLabel>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('profile.fullNameHint')}
            placeholderTextColor={colors.mutedLight}
          />
          <SectionLabel>{t('profile.preferredArea')}</SectionLabel>
          <TextInput
            style={styles.input}
            value={preferredArea}
            onChangeText={setPreferredArea}
            placeholder="e.g. Phnom Penh"
            placeholderTextColor={colors.mutedLight}
          />
          <SectionLabel>{t('profile.availability')}</SectionLabel>
          <TextInput
            style={styles.input}
            value={availability}
            onChangeText={setAvailability}
            placeholder={t('profile.availabilityHint')}
            placeholderTextColor={colors.mutedLight}
          />
        </Card>

        <TagEditor
          label={t('profile.skills')}
          items={skills}
          onItemsChange={setSkills}
          placeholder={t('profile.addOne')}
        />
        <TagEditor
          label={t('profile.languages')}
          items={languages}
          onItemsChange={setLanguages}
          placeholder={t('profile.addOne')}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Icon name="alert" size={16} color={colors.danger} />
            <AppText style={[styles.errorText, { color: colors.danger }]}>{error}</AppText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button variant="secondary" onPress={onCancel} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onPress={save} loading={saving} disabled={saving} fullWidth>
            {saving ? t('profile.saving') : t('profile.save')}
          </Button>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Local DemoTag mirror so we don't disturb the shared ui import list above.
import { DemoTag } from '../components/ui';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.ink },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.muted,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  card: { gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.base,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: typography.size.sm, color: colors.ink },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.base,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  addBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  addBtnText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.primary },
  hit: { top: 8, bottom: 8, left: 12, right: 12 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: { fontSize: typography.size.sm, flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  spacer: { height: spacing.xxxl },
});
