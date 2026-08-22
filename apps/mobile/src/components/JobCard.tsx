// Job card — feed representation of a reviewed demo factory job.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { DemoJob } from '../types';
import { useT } from '../hooks/useT';
import { Icon } from './Icon';
import { Card, VerifyBadge, StatusPill, AppText } from './ui';

const SHIFT_LABEL: Record<DemoJob['shift'], string> = {
  day: 'job.day',
  night: 'job.night',
  rotating: 'job.rotating',
  flexible: 'job.flexible',
};

const VERIFY_LABEL: Record<DemoJob['verificationLevel'], string> = {
  job_checked: 'jobs.jobChecked',
  company_checked: 'jobs.companyChecked',
  identity_checked: 'jobs.identityChecked',
};

export function JobCard({ job, onPress }: { job: DemoJob; onPress: () => void }) {
  const { t, formatDate } = useT();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed]}>
      <Card elevated style={styles.card}>
        <View style={styles.topRow}>
          <VerifyBadge level={job.verificationLevel} label={t(VERIFY_LABEL[job.verificationLevel])} />
          <AppText style={styles.checkedDate}>{t('job.lastChecked', { date: formatDate(job.lastCheckedDate) })}</AppText>
        </View>

        <AppText style={styles.title} weight="display">{job.title}</AppText>
        <AppText style={styles.company}>
          <Icon name="building" size={14} color={colors.muted} /> {job.company}
        </AppText>

        <View style={styles.facts}>
          <View style={styles.fact}>
            <AppText style={styles.factLabel}>{t('job.pay')}</AppText>
            <AppText style={styles.factValue}>${job.payPerMonth}{job.currency === 'USD' ? '' : 'K'}</AppText>
            <AppText style={styles.factUnit}>/mo</AppText>
          </View>
          <View style={[styles.fact, styles.factDivider]}>
            <AppText style={styles.factLabel}>{t('job.shift')}</AppText>
            <AppText style={styles.factValue}>{t(SHIFT_LABEL[job.shift])}</AppText>
          </View>
          <View style={[styles.fact, styles.factDivider]}>
            <AppText style={styles.factLabel}>{t('job.distance')}</AppText>
            <View style={styles.distRow}>
              <Icon name="pin" size={13} color={colors.muted} />
              <AppText style={styles.factValue}>{job.distanceKm} {t('jobs.km')}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.matchRow}>
          <Icon name="checkCircle" size={16} color={colors.success} />
          <AppText style={styles.matchText}>
            {t('jobs.youMatch', { n: job.skillsMatched, m: job.skillsTotal })}
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText style={styles.weChecked}>{t('job.weChecked')}</AppText>
          <View style={styles.viewRow}>
            <AppText style={styles.viewLabel}>{t('jobs.viewJob')}</AppText>
            <Icon name="arrowRight" size={16} color={colors.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  wrapPressed: { opacity: 0.97 },
  card: { gap: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkedDate: { fontSize: typography.size.xs, color: colors.muted },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  company: {
    fontSize: typography.size.base,
    color: colors.muted,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facts: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  fact: { flex: 1, flexDirection: 'column', gap: 2 },
  factDivider: { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: spacing.md },
  factLabel: {
    fontSize: typography.size.xs,
    color: colors.muted,
  },
  factValue: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink },
  factUnit: { fontSize: typography.size.xs, color: colors.muted },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  matchText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
    color: colors.success,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weChecked: {
    flex: 1,
    fontSize: typography.size.xs,
    color: colors.muted,
    fontStyle: 'italic',
  },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  viewLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary,
  },
});
