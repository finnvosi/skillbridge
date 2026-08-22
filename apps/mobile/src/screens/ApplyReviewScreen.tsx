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
import { requestNotificationPermission, showLocalNotification } from '../services/notifications';
import { ApiError } from '../services/api';
import { USE_REMOTE_API } from '../config';
import { useAuthStore } from '../store/auth';
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
  const token = useAuthStore((s) => s.token);
  const [hideCert, setHideCert] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

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

    // Local notification on native devices (no-op on web); the first apply is
    // the natural moment to ask for notification permission.
    requestNotificationPermission().then((granted) => {
      if (granted) {
        showLocalNotification(t('apply.done'), `${job.title} · ${job.company}`);
      }
    });

    const finish = () => {
      setSubmitting(false);
      onSubmitted();
    };

    if (!USE_REMOTE_API) {
      // Local demo submit — no network, no backend.
      setTimeout(finish, 500);
      return;
    }
    // Real submit: POST to the worker API. Worker identity is derived from the
    // JWT server-side (SEC-1 fix) — we only forward the token, never a workerId.
    submitApplicationApi(job.id, displayedShared.length > 0, token)
      .then(finish)
      .catch((err) => {
        // The API guards against double-submit (409 "Already applied").
        // Surface that honestly instead of swallowing it as a silent success.
        if (err instanceof ApiError && err.status === 409) {
          setAlreadyApplied(true);
        }
        finish();
      });
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
          {alreadyApplied ? (
            <View style={styles.conflictNote}>
              <Icon name="shieldCheck" size={15} color={colors.warning} />
              <AppText style={styles.conflictNoteText}>{t('apply.alreadyApplied')}</AppText>
            </View>
          ) : null}
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
  jobTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.ink },
  jobCompany: { fontSize: typography.size.sm, color: colors.muted },
  field: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: spacing.md },
  fieldLabel: { fontSize: typography.size.sm, color: colors.muted },
  fieldValue: { fontSize: typography.size.base, color: colors.ink, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  toggleText: { fontSize: typography.size.base, color: colors.ink },
  noPay: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success },
  noPayTitle: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },
  copySmall: { fontSize: typography.size.sm, color: colors.muted, marginTop: spacing.xs, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  cta: { marginTop: spacing.sm },
  conflictNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.warningSoft, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.warning },
  conflictNoteText: { fontSize: typography.size.sm, color: colors.warningInk, flex: 1, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  hiddenNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  hiddenNoteText: { fontSize: typography.size.sm, color: colors.muted, flex: 1, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
});
