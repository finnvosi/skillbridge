// Add a past job (self-declared) to the Career Passport, then request employer
// verification from the record (blueprint §5: worker_draft ->
// employer_requested -> employer_verified).
import React, { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, TAP_MIN } from '../theme';
import { useT } from '../hooks/useT';
import { useAuthStore } from '../store/auth';
import { AppText, Button } from '../components/ui';
import { BackBar } from '../components/BackBar';
import { addWorkRecord } from '../services/workerApi';
import { ApiError } from '../services/api';

export default function AddWorkRecordScreen({
  onBack,
  onSaved,
}: {
  onBack: () => void;
  onSaved: () => void;
}) {
  const { t } = useT();
  const token = useAuthStore((s) => s.token);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!role.trim() || !company.trim() || !/^\d{4}-\d{2}$/.test(start.trim())) {
      Alert.alert(t('common.error'), t('workrecord.required'));
      return;
    }
    setSaving(true);
    try {
      await addWorkRecord(
        {
          role: role.trim(),
          company: company.trim(),
          workplace: workplace.trim() || undefined,
          startDate: start.trim(),
          endDate: end.trim() || null,
        },
        token,
      );
      Alert.alert(t('common.demo'), t('workrecord.saved'), [
        { text: 'OK', onPress: () => onSaved() },
      ]);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('onboarding.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    keyboardType?: 'default' | 'numbers-and-punctuation',
  ) => (
    <View style={styles.field}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedLight}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={t('workrecord.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {field(t('workrecord.role'), role, setRole, t('workrecord.rolePlaceholder'))}
        {field(t('workrecord.company'), company, setCompany, t('workrecord.companyPlaceholder'))}
        {field(t('workrecord.workplace'), workplace, setWorkplace, '')}
        {field(t('workrecord.start'), start, setStart, '2022-03', 'numbers-and-punctuation')}
        {field(t('workrecord.end'), end, setEnd, '2025-01', 'numbers-and-punctuation')}

        <AppText style={styles.hint}>{t('passport.workRecordsDemo')}</AppText>

        <Button fullWidth loading={saving} disabled={saving} onPress={handleSave} style={styles.cta} icon="check">
          {t('workrecord.save')}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  field: { marginBottom: spacing.lg },
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
  input: {
    fontSize: typography.size.base,
    color: colors.ink,
    fontFamily: typography.fontFamily.regular,
    paddingVertical: spacing.md,
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.muted,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  cta: { marginTop: spacing.sm },
});
