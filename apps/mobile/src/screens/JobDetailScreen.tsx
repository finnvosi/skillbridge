// Job detail — title, pay/shift/location, what we verified and cannot guarantee,
// match reasons, and the two actions: Apply with Passport, Report a concern.
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { DemoJob } from '../types';
import { useT } from '../hooks/useT';
import { Icon, IconName } from '../components/Icon';
import { Card, VerifyBadge, StatusPill, Button, DemoTag, SectionLabel, AppText } from '../components/ui';
import { BackBar } from '../components/BackBar';

const VERIFY_LABEL: Record<DemoJob['verificationLevel'], string> = {
  none: 'jobs.notVerified',
  job_checked: 'jobs.jobChecked',
  company_checked: 'jobs.companyChecked',
  identity_checked: 'jobs.identityChecked',
};
const SHIFT_LABEL: Record<DemoJob['shift'], string> = {
  day: 'job.day',
  night: 'job.night',
  rotating: 'job.rotating',
  flexible: 'job.flexible',
};
const EMP_LABEL: Record<DemoJob['employmentType'], string> = {
  full_time: 'job.fullTime',
  contract: 'job.contract',
  seasonal: 'job.seasonal',
};

export default function JobDetailScreen({
  job,
  onApply,
  onReport,
  onBlock,
  onBack,
}: {
  job: DemoJob;
  onApply: () => void;
  onReport: () => void;
  onBlock?: () => void;
  onBack: () => void;
}) {
  const { t, formatDate } = useT();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={job.title} onBack={onBack} right={<DemoTag onDark />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title card: verification level first, then company, then summary. */}
        <Card elevated style={styles.head}>
          <View style={styles.headTop}>
            <VerifyBadge level={job.verificationLevel} label={t(VERIFY_LABEL[job.verificationLevel])} />
            <AppText style={styles.checked}>{t('job.lastChecked', { date: formatDate(job.lastCheckedDate) })}</AppText>
          </View>
          <AppText style={styles.title} weight="display">{job.title}</AppText>
          <View style={styles.company}>
            <Icon name="building" size={15} color={colors.muted} />
            <AppText style={styles.companyText}>{job.company}</AppText>
          </View>
          <AppText style={styles.summary}>{job.summary}</AppText>
        </Card>

        {/* Pay / shift / location / employment */}
        <Card style={styles.factsCard}>
          <View style={styles.facts}>
            <Fact icon="money" label={t('job.pay')} value={`$${job.payPerMonth}${job.currency === 'USD' ? '' : 'K'}`} sub="/mo" />
            <Fact icon="clock" label={t('job.shift')} value={t(SHIFT_LABEL[job.shift])} />
            <Fact icon="pin" label={t('job.distance')} value={`${job.location} · ${job.distanceKm}${t('jobs.km')}`} />
            <Fact icon="briefcase" label={t('job.type')} value={t(EMP_LABEL[job.employmentType])} />
          </View>
        </Card>

        {/* What we checked + honest empty state */}
        <Card style={styles.card}>
          <SectionLabel>{t('job.whatChecked')}</SectionLabel>
          {job.evidence.length > 0 ? (
            job.evidence.map((e, i) => (
              <Row key={i} icon={e.checked ? 'checkCircle' : 'info'} tone={e.checked ? colors.success : colors.muted}>
                <AppText style={styles.evLabel}>{e.label}</AppText>
                <AppText style={styles.evDetail}>{e.detail}</AppText>
              </Row>
            ))
          ) : (
            <View style={styles.emptyEvidence}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={styles.emptyEvidenceText}>{t('job.noChecksListed')}</AppText>
            </View>
          )}
          <View style={styles.gap} />
          <View style={[styles.dangerLabel, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}>
            <Icon name="alert" size={16} color={colors.danger} />
            <AppText style={[styles.dangerLabelText, { color: colors.danger }]}>{t('job.cannotGuarantee')}</AppText>
          </View>

          {job.cannotGuarantee.length > 0 ? (
            <View style={[styles.noteBox, { backgroundColor: colors.warningSoft, borderColor: colors.warning }]}>
              <Icon name="alert" size={18} color={colors.warningInk} />
              <View style={{ flex: 1 }}>
                {job.cannotGuarantee.map((c, i) => (
                  <AppText key={i} style={[styles.noteText, { color: colors.warningInk }]}>
                    • {c}
                  </AppText>
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.noteBox, { backgroundColor: colors.successSoft, borderColor: colors.success }]}>
              <Icon name="checkCircle" size={18} color={colors.success} />
              <AppText style={[styles.noteText, { color: colors.ink }]}>{t('job.cannotGuaranteeEmpty')}</AppText>
            </View>
          )}
        </Card>

        {/* Conditions */}
        <Card style={styles.card}>
          <SectionLabel>{t('job.conditions')}</SectionLabel>
          <View style={styles.condGrid}>
            <Cond icon="building" label={t('job.accommodation')} on={job.accommodation} />
            <Cond icon="pin" label={t('job.transport')} on={job.transportProvided} />
            <Cond icon="clock" label={t('job.overtime')} on={job.overtimePaid} />
          </View>
        </Card>

        {/* Match reasons */}
        <Card style={styles.card}>
          <SectionLabel>{t('job.whyMatches')}</SectionLabel>
          <View style={[styles.matchBox, { backgroundColor: colors.successSoft, borderColor: colors.success }]}>
            <Icon name="checkCircle" size={18} color={colors.success} />
            <AppText style={[styles.matchReason, { color: colors.ink }]}>{job.matchReason}</AppText>
          </View>

          <SectionLabel>{t('job.matchingSkills')}</SectionLabel>
          {job.skillMatches.length > 0 ? (
            <View style={styles.skills}>
              {job.skillMatches.map((s, i) => (
                <View key={i} style={[styles.skill, s.matched ? styles.skillOn : styles.skillOff]}>
                  <Icon name={s.matched ? 'checkCircle' : 'close'} size={14} color={s.matched ? colors.success : colors.mutedLight} />
                  <AppText style={[styles.skillText, s.matched ? styles.skillTextOn : styles.skillTextOff]}>{s.skill}</AppText>
                  {s.verified ? (
                    <StatusPill icon="shieldCheck" label={t('passport.verified')} tone="success" />
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('job.noSkillsListed')}</AppText>
            </View>
          )}

          {job.missingRequirements.length > 0 ? (
            <>
              <SectionLabel>{t('job.missingRequirements')}</SectionLabel>
              {job.missingRequirements.map((m, i) => (
                <AppText key={i} style={styles.missing}>• {m}</AppText>
              ))}
            </>
          ) : null}
        </Card>

        <View style={styles.cta}>
          <Button variant="primary" icon="shieldCheck" fullWidth onPress={onApply}>
            {t('job.applyWithPassport')}
          </Button>
          <Button variant="ghost" icon="flag" fullWidth onPress={onReport}>
            {t('job.reportConcern')}
          </Button>
          {onBlock ? (
            <Pressable
              accessibilityRole="button"
              onPress={onBlock}
              style={({ pressed }) => [styles.blockLink, pressed && { opacity: 0.7 }]}
            >
              <Icon name="close" size={15} color={colors.muted} />
              <AppText style={styles.blockLinkText}>{t('job.blockJob')}</AppText>
            </Pressable>
          ) : null}
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Fact({ icon, label, value, sub }: { icon: IconName; label: string; value: string; sub?: string }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factHead}>
        <Icon name={icon} size={16} color={colors.primary} />
        <AppText style={styles.factLabel}>{label}</AppText>
      </View>
      <AppText style={styles.factValue}>
        {value}
        {sub ? <AppText style={styles.factSub}> {sub}</AppText> : null}
      </AppText>
    </View>
  );
}

function Row({ icon, tone, children }: { icon: IconName; tone: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} color={tone} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function Cond({ icon, label, on }: { icon: IconName; label: string; on: boolean }) {
  const { t } = useT();
  return (
    <View style={styles.cond}>
      <Icon name={icon} size={16} color={on ? colors.success : colors.mutedLight} />
      <AppText style={[styles.condText, on ? styles.condOn : styles.condOff]}>{label}</AppText>
      <AppText style={[styles.condState, on ? styles.condOn : styles.condOff]}>{on ? t('common.yes') : t('common.no')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  blockLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 40,
    marginTop: spacing.xs,
  },
  blockLinkText: { fontSize: typography.size.sm, color: colors.muted },
  head: { gap: spacing.sm },
  headTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checked: { fontSize: typography.size.xs, color: colors.muted },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.ink, marginTop: spacing.xs },
  company: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  companyText: { fontSize: typography.size.base, color: colors.muted },
  summary: { fontSize: typography.size.base, color: colors.ink, lineHeight: typography.size.base * typography.lineHeight.relaxed },
  factsCard: { ...shadow.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  fact: { width: '47%', gap: spacing.xs },
  factHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  factLabel: { fontSize: typography.size.sm, color: colors.muted },
  factValue: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.ink, flexShrink: 1 },
  factSub: { fontSize: typography.size.xs, color: colors.muted, fontWeight: typography.weight.regular },
  card: { gap: spacing.sm },
  gap: { height: spacing.md },
  evLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.ink },
  evDetail: { fontSize: typography.size.sm, color: colors.muted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteBox: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1 },
  noteText: { fontSize: typography.size.sm, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  dangerLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1 },
  dangerLabelText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  condGrid: { gap: spacing.sm },
  cond: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: spacing.md },
  condText: { flex: 1, fontSize: typography.size.base },
  condState: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  condOn: { color: colors.success },
  condOff: { color: colors.mutedLight },
  matchBox: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, marginBottom: spacing.md },
  matchReason: { flex: 1, fontSize: typography.size.base, lineHeight: typography.size.base * typography.lineHeight.normal },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1 },
  skillOn: { backgroundColor: colors.successSoft, borderColor: colors.success },
  skillOff: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  skillText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  skillTextOn: { color: colors.ink },
  skillTextOff: { color: colors.muted },
  missing: { fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  cta: { gap: spacing.sm, marginTop: spacing.sm },
  emptyEvidence: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm },
  emptyEvidenceText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  emptyBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm },
  emptyText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
});
