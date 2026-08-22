// Safety center — the worker's own reports with support status, and blocked
// jobs they can unblock. Reached from the Help tab (blueprint: report, block,
// and support-status flow).
import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useT } from '../hooks/useT';
import { useAuthStore } from '../store/auth';
import { BackBar } from '../components/BackBar';
import { AppText, Card, StatusPill, EmptyState, SectionLabel, Button } from '../components/ui';
import { Icon } from '../components/Icon';
import {
  fetchReports,
  fetchBlockedJobIds,
  unblockJob,
  fetchJobs,
  WorkerReport,
} from '../services/workerApi';
import { ApiError } from '../services/api';
import { USE_REMOTE_API } from '../config';
import { DemoJob } from '../types';

const STATUS_ICON: Record<string, 'clock' | 'alert' | 'checkCircle'> = {
  submitted: 'clock',
  under_review: 'alert',
  resolved: 'checkCircle',
};
const STATUS_TONE: Record<string, 'neutral' | 'warning' | 'success'> = {
  submitted: 'neutral',
  under_review: 'warning',
  resolved: 'success',
};

export default function SafetyCenterScreen({ onBack }: { onBack: () => void }) {
  const { t, formatDate } = useT();
  const token = useAuthStore((s) => s.token);
  const [reports, setReports] = useState<WorkerReport[]>([]);
  const [blocked, setBlocked] = useState<{ job: DemoJob }[]>([]);
  const [loading, setLoading] = useState(USE_REMOTE_API);

  const load = useCallback(async () => {
    if (!USE_REMOTE_API || !token) {
      setLoading(false);
      return;
    }
    try {
      const [rep, ids, jobs] = await Promise.all([
        fetchReports(token),
        fetchBlockedJobIds(token),
        fetchJobs(),
      ]);
      setReports(rep);
      const byId = new Map(jobs.map((j) => [j.id, j]));
      setBlocked(ids.map((id) => ({ job: byId.get(id)! })).filter((b) => b.job));
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!USE_REMOTE_API || !token) return;
    let alive = true;
    (async () => {
      try {
        const [rep, ids, jobs] = await Promise.all([
          fetchReports(token),
          fetchBlockedJobIds(token),
          fetchJobs(),
        ]);
        if (!alive) return;
        setReports(rep);
        const byId = new Map(jobs.map((j) => [j.id, j]));
        setBlocked(ids.map((id) => ({ job: byId.get(id)! })).filter((b) => b.job));
      } catch {
        // keep empty
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const handleUnblock = async (jobId: string) => {
    try {
      await unblockJob(jobId, token);
      setBlocked((prev) => prev.filter((b) => b.job.id !== jobId));
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('onboarding.saveError'),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={t('safety.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <SectionLabel>{t('safety.myReports')}</SectionLabel>
        {reports.length === 0 && !loading ? (
          <EmptyState icon="flag" title={t('safety.noReports')} subtitle={t('safety.noReportsSub')} />
        ) : (
          reports.map((r) => (
            <Card key={r.id} style={styles.card}>
              <View style={styles.rowTop}>
                <AppText style={styles.rowTitle}>{t(`help.cat.${r.category}`)}</AppText>
                <StatusPill
                  icon={STATUS_ICON[r.status]}
                  label={t(`report.status.${r.status}`)}
                  tone={STATUS_TONE[r.status]}
                />
              </View>
              <AppText style={styles.rowText}>{r.description}</AppText>
              <AppText style={styles.rowDate}>{formatDate(r.createdAt)}</AppText>
              {r.adminNote ? (
                <View style={styles.note}>
                  <Icon name="info" size={15} color={colors.muted} />
                  <AppText style={styles.noteText}>{r.adminNote}</AppText>
                </View>
              ) : null}
            </Card>
          ))
        )}

        <SectionLabel style={styles.sectionSpacer}>{t('safety.blockedJobs')}</SectionLabel>
        {blocked.length === 0 && !loading ? (
          <EmptyState icon="lock" title={t('safety.noBlocked')} subtitle={t('safety.noBlockedSub')} />
        ) : (
          blocked.map(({ job }) => (
            <Card key={job.id} style={styles.card}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.rowTitle}>{job.title}</AppText>
                  <AppText style={styles.rowText}>{job.company}</AppText>
                </View>
                <Button variant="secondary" onPress={() => handleUnblock(job.id)}>
                  {t('safety.unblock')}
                </Button>
              </View>
            </Card>
          ))
        )}
        {!USE_REMOTE_API || !token ? (
          <View style={styles.demoNote}>
            <Icon name="info" size={15} color={colors.muted} />
            <AppText style={styles.demoNoteText}>{t('passport.workRecordsDemo')}</AppText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, gap: spacing.md },
  card: { gap: spacing.xs },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowTitle: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.ink, flexShrink: 1 },
  rowText: { fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed, marginTop: spacing.xs },
  rowDate: { fontSize: typography.size.xs, color: colors.mutedLight, marginTop: spacing.xs },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.demoSoft, marginTop: spacing.sm },
  noteText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  sectionSpacer: { marginTop: spacing.lg },
  demoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.demoSoft },
  demoNoteText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
});
