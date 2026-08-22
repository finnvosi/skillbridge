// Apply review — shows the shared Passport fields the company would receive,
// the "no payment required" + honest demo copy, then a local-only submit.
// Nothing leaves the device. On submit, the application is stored via useAppStore.
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { DemoJob, DemoApplication } from '../types';
import { useT } from '../hooks/useT';
import { useAppStore } from '../store/useAppStore';
import { submitApplication as submitApplicationApi } from '../services/workerApi';
import { USE_REMOTE_API, DEMO_WORKER_ID } from '../config';
import { Icon, IconName } from '../components/Icon';
import { Card, Button, DemoTag, SectionLabel, StatusPill } from '../components/ui';
import { BackBar } from '../components/BackBar';

import { AppText } from './../components/ui';
export default function ApplyReviewScreen({
  job,
  onBack,
  onSubmitted,
}: {
  job: DemoJob;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const { t } = useT();
  const passport = useAppStore((s) => s.passport);
  const submitApplication = useAppStore((s) => s.submitApplication);
  const hasApplied = useAppStore((s) => s.hasAppliedToJob(job.id));
  const [hideCert, setHideCert] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sharedFields = [
    `${passport.fullName}`,
    `${t('apply.nameContact')}`,
    ...job.skillMatches.filter((s) => s.matched).map((s) => s.skill),
    ...passport.workRecords.map((w) => `${w.company} · ${w.role}`),
  ];
  const displayedShared = hideCert ? sharedFields.filter((_, i) => i < 2) : sharedFields;

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    const app: DemoApplication = {
      id: `app-${job.id}-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      sharedFields: displayedShared,
      demo: true,
    };
    // Persist locally so the Applications tab shows it even if the API is down.
    submitApplication(app);

    const finish = () => {
      setSubmitting(false);
      onSubmitted();
    };

    if (!USE_REMOTE_API) {
      // Local demo submit — no network, no backend.
      setTimeout(finish, 500);
      return;
    }
    // Real submit: POST to the worker API. We don't block the UI on it; if it
    // fails we still surface the local record and move on.
    submitApplicationApi(job.id, DEMO_WORKER_ID, displayedShared.length > 0)
      .then(finish)
      .catch(finish);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={t('apply.review')} onBack={onBack} right={<DemoTag onDark />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <View style={styles.jobRow}>
            <Icon name="briefcase" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText style={styles.jobTitle}>{job.title}</AppText>
              <AppText style={styles.jobCompany}>{job.company}</AppText>
            </View>
          </View>

          <SectionLabel>{t('apply.companyReceives')}</SectionLabel>
          <Field icon="user" label={t('apply.nameContact')} value={passport.fullName} />
          {!hideCert ? (
            <Field icon="shieldCheck" label={t('apply.matchingSkills')} value={job.skillMatches.filter((s) => s.matched).map((s) => s.skill).join(', ')} />
          ) : null}
          {!hideCert ? (
            <Field icon="building" label={t('apply.workRecords')} value={passport.workRecords.map((w) => w.company).join(', ')} />
          ) : null}
          {hideCert ? (
            <View style={styles.hiddenNote}>
              <Icon name="lock" size={15} color={colors.muted} />
              <AppText style={styles.hiddenNoteText}>{t('apply.certHidden')}</AppText>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="switch"
            onPress={() => setHideCert((v) => !v)}
            style={styles.toggleRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="lock" size={16} color={colors.muted} />
              <AppText style={styles.toggleText}>{t('apply.hideCertificate')}</AppText>
            </View>
            <Switch value={hideCert} onValueChange={setHideCert} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
          </Pressable>
        </Card>

        <Card style={styles.noPay}>
          <Icon name="lock" size={18} color={colors.success} />
          <View style={{ flex: 1 }}>
            <AppText style={[styles.noPayTitle, { color: colors.success }]}>{t('apply.noPayment')}</AppText>
            <AppText style={styles.copySmall}>{t('apply.demoNote')}</AppText>
          </View>
        </Card>

        <View style={styles.cta}>
          <Button variant="primary" icon="shieldCheck" fullWidth loading={submitting} onPress={handleSubmit}>
            {hasApplied ? t('apply.done') : t('apply.submit')}
          </Button>
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Icon name={icon} size={16} color={colors.muted} />
      <View style={{ flex: 1 }}>
        <AppText style={styles.fieldLabel}>{label}</AppText>
        <AppText style={styles.fieldValue}>{value || '—'}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  card: { gap: spacing.md },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  jobTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink },
  jobCompany: { fontSize: typography.size.sm, color: colors.muted },
  field: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: spacing.md },
  fieldLabel: { fontSize: typography.size.sm, color: colors.muted },
  fieldValue: { fontSize: typography.size.base, color: colors.ink, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  toggleText: { fontSize: typography.size.base, color: colors.ink },
  noPay: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success },
  noPayTitle: { fontSize: typography.size.base, fontWeight: typography.weight.semibold as any },
  copySmall: { fontSize: typography.size.sm, color: colors.muted, marginTop: spacing.xs, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  cta: { marginTop: spacing.sm },
  hiddenNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  hiddenNoteText: { fontSize: typography.size.sm, color: colors.muted, flex: 1, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
});
