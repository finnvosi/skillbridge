// Report a concern — category, what happened, optional evidence.
// When the API is reachable the report is stored with a worker-facing support
// status (tracked in Help → My reports); otherwise it stays a local demo.
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, TAP_MIN } from '../theme';
import { ReportCategory } from '../types';
import { useT } from '../hooks/useT';
import { useAuthStore } from '../store/auth';
import { Icon, IconName } from '../components/Icon';
import { Card, Button, DemoTag, StatusPill } from '../components/ui';
import { BackBar } from '../components/BackBar';
import { submitReport } from '../services/workerApi';
import { ApiError } from '../services/api';
import { USE_REMOTE_API } from '../config';

import { AppText } from './../components/ui';
const CATS: { cat: ReportCategory; icon: IconName; key: string }[] = [
  { cat: 'payment_requested', icon: 'money', key: 'help.cat.payment' },
  { cat: 'false_information', icon: 'alert', key: 'help.cat.false' },
  { cat: 'recruiter_identity', icon: 'user', key: 'help.cat.identity' },
  { cat: 'unsafe_contact', icon: 'flag', key: 'help.cat.unsafe' },
  { cat: 'other', icon: 'list', key: 'help.cat.other' },
];

export default function ReportScreen({
  initialCategory,
  onBack,
  onDone,
}: {
  initialCategory?: ReportCategory;
  onBack: () => void;
  onDone: () => void;
}) {
  const { t } = useT();
  const token = useAuthStore((s) => s.token);
  const [category, setCategory] = useState<ReportCategory | undefined>(initialCategory);
  const [what, setWhat] = useState('');
  const [evidence, setEvidence] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // True when the report actually reached the API (vs local demo fallback).
  const [realSubmission, setRealSubmission] = useState(false);

  const handleSend = async () => {
    if (!category || !what.trim()) return;
    if (!USE_REMOTE_API || !token) {
      // Local demo fallback.
      setRealSubmission(false);
      setSent(true);
      return;
    }
    setSending(true);
    try {
      await submitReport(
        { category, description: what.trim(), evidence: evidence.trim() || undefined },
        token,
      );
      setRealSubmission(true);
      setSent(true);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('onboarding.saveError'),
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <BackBar title={t('report.title')} onBack={onBack} right={<DemoTag onDark />} />
        <View style={styles.confirmWrap}>
          <View style={[styles.confirmIcon, { backgroundColor: colors.successSoft }]}>
            <Icon name="checkCircle" size={36} color={colors.success} />
          </View>
          <AppText style={styles.confirmTitle}>{t('report.confirmTitle')}</AppText>
          <Card style={styles.confirmBox}>
            <View style={styles.confirmRow}>
              <Icon name="lock" size={18} color={colors.muted} />
              <AppText style={styles.confirmText}>{t('report.notShown')}</AppText>
            </View>
            <View style={[styles.confirmRow, { marginTop: spacing.sm }]}>
              <Icon name="info" size={18} color={colors.muted} />
              <AppText style={styles.confirmText}>
                {realSubmission ? t('report.trackStatus') : t('report.demo')}
              </AppText>
            </View>
          </Card>
          <AppText style={styles.confirmSub}>
            {realSubmission ? t('report.confirmSubReal') : t('report.confirmSub')}
          </AppText>
          <View style={styles.confirmCta}>
            <Button variant="primary" icon="check" fullWidth onPress={onDone}>
              {t('report.done')}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const canSend = !!category && what.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={t('report.title')} onBack={onBack} right={<DemoTag onDark />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.label}>{t('help.scamTitle')}</AppText>
        <View style={styles.cats}>
          {CATS.map((c) => {
            const active = category === c.cat;
            return (
              <Pressable
                key={c.cat}
                accessibilityRole="button"
                onPress={() => setCategory(c.cat)}
                style={({ pressed }) => [
                  styles.cat,
                  active && styles.catActive,
                  pressed && styles.catPressed,
                ]}
              >
                <Icon name={c.icon} size={18} color={active ? colors.accent : colors.muted} />
                <AppText style={[styles.catText, active && styles.catTextActive]}>{t(c.key)}</AppText>
                {active ? <Icon name="checkCircle" size={18} color={colors.accent} /> : null}
              </Pressable>
            );
          })}
        </View>

        <AppText style={styles.label}>{t('report.whatHappened')}</AppText>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder={t('report.whatPlaceholder')}
            placeholderTextColor={colors.mutedLight}
            value={what}
            onChangeText={setWhat}
            multiline
            textAlignVertical="top"
            accessibilityLabel={t('report.whatHappened')}
          />
        </View>

        <AppText style={styles.label}>{t('report.addEvidence')}</AppText>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder={t('report.evidencePlaceholder')}
            placeholderTextColor={colors.mutedLight}
            value={evidence}
            onChangeText={setEvidence}
            multiline
            textAlignVertical="top"
            accessibilityLabel={t('report.addEvidence')}
          />
        </View>

        <Card style={styles.honesty}>
          <Icon name="info" size={16} color={colors.muted} />
          <AppText style={styles.honestyText}>{t('report.demo')}</AppText>
        </Card>

        <View style={styles.cta}>
          <Button variant="danger" icon="flag" fullWidth disabled={!canSend || sending} loading={sending} onPress={handleSend}>
            {t('report.send')}
          </Button>
          <StatusPill icon="lock" label={t('report.notShown')} tone="neutral" />
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold as any, color: colors.muted, marginTop: spacing.sm },
  cats: { gap: spacing.sm, marginTop: spacing.xs },
  cat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.lg,
    minHeight: TAP_MIN,
  },
  catActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  catPressed: { opacity: 0.85 },
  catText: { flex: 1, fontSize: typography.size.base, color: colors.ink },
  catTextActive: { fontWeight: typography.weight.semibold as any, color: colors.accent },
  inputBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    minHeight: TAP_MIN + 28,
  },
  input: { fontSize: typography.size.base, color: colors.ink, minHeight: 64, textAlignVertical: 'top' },
  honesty: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, marginTop: spacing.sm, backgroundColor: colors.demoSoft },
  honestyText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  cta: { gap: spacing.sm, marginTop: spacing.sm, alignItems: 'stretch' },
  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  confirmIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold as any, color: colors.ink, textAlign: 'center' },
  confirmBox: { width: '100%', gap: spacing.sm },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  confirmText: { flex: 1, fontSize: typography.size.sm, color: colors.ink, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  confirmSub: { fontSize: typography.size.sm, color: colors.muted, textAlign: 'center', lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  confirmCta: { width: '100%', marginTop: spacing.md },
});
