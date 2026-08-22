// Applications tab — local demo applications with a status tracker.
// Honest label: this is a local demo; nothing was sent to a real employer.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { ApplicationStatus, DemoApplication } from '../types';
import { useT } from '../hooks/useT';
import { useAppStore, effectiveStatus } from '../store/useAppStore';
import { Icon, IconName } from '../components/Icon';
import { Header } from '../components/Header';
import { Card, StatusPill, DemoTag, EmptyState } from '../components/ui';
import { fetchApplications } from '../services/workerApi';
import { USE_REMOTE_API } from '../config';
import { useAuthStore } from '../store/auth';

import { AppText } from './../components/ui';
const STATUS_ORDER: ApplicationStatus[] = ['submitted', 'under_review', 'interview', 'accepted'];
const STATUS_KEY: Record<ApplicationStatus, string> = {
  submitted: 'applications.submitted',
  under_review: 'applications.underReview',
  interview: 'applications.interview',
  accepted: 'applications.accepted',
  declined: 'applications.declined',
  withdrawn: 'applications.withdrawn',
};
const STATUS_ICON: Record<ApplicationStatus, IconName> = {
  submitted: 'doc',
  under_review: 'clock',
  interview: 'user',
  accepted: 'checkCircle',
  declined: 'close',
  withdrawn: 'arrowLeft',
};
const STATUS_TONE: Record<ApplicationStatus, 'info' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  submitted: 'info',
  under_review: 'warning',
  interview: 'info',
  accepted: 'success',
  declined: 'danger',
  withdrawn: 'neutral',
};

export default function ApplicationsScreen({ onOpenJob }: { onOpenJob?: (jobId: string) => void }) {
  const { t, formatDate } = useT();
  const storeApps = useAppStore((s) => s.applications);
  const token = useAuthStore((s) => s.token);
  const [remoteApps, setRemoteApps] = useState<DemoApplication[] | null>(null);

  useEffect(() => {
    if (!USE_REMOTE_API || !token) return;
    let alive = true;
    fetchApplications(token)
      .then((data) => {
        if (alive) setRemoteApps(data);
      })
      .catch(() => {
        // keep store fallback
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const applications = remoteApps ?? storeApps;
  // Re-render periodically so the status tracker advances while the tab is open.
  const [, forceTick] = useState(Date.now());
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (applications.length === 0) return;
    tickRef.current = setInterval(() => forceTick(Date.now()), 5000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [applications.length]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header right={<DemoTag onDark />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleWrap}>
          <AppText style={styles.title} weight="display">{t('applications.title')}</AppText>
          <AppText style={styles.subtitle}>{t('applications.demo')} · {applications.length}</AppText>
        </View>

        {applications.length === 0 ? (
          <EmptyState
            icon="doc"
            title={t('applications.empty')}
            subtitle={t('applications.emptySub')}
          />
        ) : (
          applications.map((a) => {
            // Derive the live stage from submission time so the tracker visibly
            // advances (submitted -> under review -> interview -> accepted).
            const status = effectiveStatus(a);
            const stepIndex = STATUS_ORDER.indexOf(status);
            return (
              <Card key={a.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.jobTitle}>{a.jobTitle}</AppText>
                    <AppText style={styles.company}>{a.company}</AppText>
                  </View>
                  <StatusPill icon={STATUS_ICON[status]} label={t(STATUS_KEY[status])} tone={STATUS_TONE[status]} />
                </View>

                <View style={styles.tracker}>
                  {STATUS_ORDER.map((s, i) => {
                    const done = i <= stepIndex;
                    return (
                      <View key={s} style={styles.step}>
                        <View style={[styles.dot, done ? styles.dotDone : styles.dotTodo]}>
                          <Icon name={STATUS_ICON[s]} size={14} color={done ? colors.white : colors.mutedLight} />
                        </View>
                        <AppText style={[styles.stepLabel, done ? styles.stepLabelDone : styles.stepLabelTodo]}>
                          {t(STATUS_KEY[s])}
                        </AppText>
                        {i < STATUS_ORDER.length - 1 ? (
                          <View style={[styles.connector, i < stepIndex ? styles.connectorDone : styles.connectorTodo]} />
                        ) : null}
                      </View>
                    );
                  })}
                </View>

                <View style={styles.meta}>
                  <Icon name="clock" size={14} color={colors.muted} />
                  <AppText style={styles.metaText}>{t('applications.submittedAt', { date: formatDate(a.submittedAt) })}</AppText>
                  {onOpenJob ? (
                    <PressableRow onPress={() => onOpenJob(a.jobId)} label={t('applications.viewJob')} />
                  ) : null}
                </View>
              </Card>
            );
          })
        )}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PressableRow({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <View style={styles.viewRow}>
      <AppText style={styles.viewLabel} onPress={onPress as any}>{label}</AppText>
      <Icon name="arrowRight" size={16} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  titleWrap: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold as any, color: colors.ink },
  subtitle: { fontSize: typography.size.sm, color: colors.muted },
  card: { gap: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  jobTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink },
  company: { fontSize: typography.size.sm, color: colors.muted, marginTop: 2 },
  tracker: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  step: { flex: 1, alignItems: 'center', position: 'relative' },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotDone: { backgroundColor: colors.primary },
  dotTodo: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  stepLabel: { fontSize: typography.size.xs, marginTop: spacing.xs, textAlign: 'center' },
  stepLabelDone: { color: colors.ink, fontWeight: typography.weight.semibold as any },
  stepLabelTodo: { color: colors.mutedLight },
  connector: { position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, zIndex: 0 },
  connectorDone: { backgroundColor: colors.primary },
  connectorTodo: { backgroundColor: colors.border },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  metaText: { fontSize: typography.size.sm, color: colors.muted },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginLeft: 'auto' },
  viewLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold as any, color: colors.primary },
});
