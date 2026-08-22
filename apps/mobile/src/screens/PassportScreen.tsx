// Career Passport — identity, skills, one employer-verified work record,
// verification date/provenance, and a local demo share toggle.
// Stays on-device; nothing is sent to a server.
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useT } from '../hooks/useT';
import { useAppStore } from '../store/useAppStore';
import { Icon, IconName } from '../components/Icon';
import { Header } from '../components/Header';
import { Card, StatusPill, DemoTag, SectionLabel } from '../components/ui';
import { fetchPassport } from '../services/workerApi';
import { USE_REMOTE_API } from '../config';
import { DemoPassport } from '../types';
import { AppText } from './../components/ui';
export default function PassportScreen() {
  const { t, formatDate } = useT();
  const storePassport = useAppStore((s) => s.passport);
  const setShareEnabled = useAppStore((s) => s.setShareEnabled);
  const [remotePassport, setRemotePassport] = useState<DemoPassport | null>(null);

  useEffect(() => {
    if (!USE_REMOTE_API) return;
    let alive = true;
    fetchPassport()
      .then((data) => {
        if (alive && data) setRemotePassport(data);
      })
      .catch(() => {
        // keep store fallback
      });
    return () => {
      alive = false;
    };
  }, []);

  const passport = remotePassport ?? storePassport;

  const verifiedCount = passport.skills.filter((s) => s.verified).length;
  const record = passport.workRecords[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header right={<DemoTag onDark />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.identity}>
          <View style={styles.identityTop}>
            <View style={styles.avatar}>
              <Icon name="user" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.name} weight="display">{passport.fullName}</AppText>
              <AppText style={styles.role}>{passport.role}</AppText>
            </View>
            {passport.identityVerified ? (
              <StatusPill icon="shieldCheck" label={t('passport.identityVerified')} tone="success" />
            ) : null}
          </View>
          <View style={styles.idRow}>
            <Icon name="phone" size={15} color={colors.muted} />
            <AppText style={styles.idText}>{passport.phone}</AppText>
            <Icon name="pin" size={15} color={colors.muted} />
            <AppText style={styles.idText}>{passport.preferredArea}</AppText>
            <Icon name="clock" size={15} color={colors.muted} />
            <AppText style={styles.idText}>{passport.availability}</AppText>
          </View>
          <View style={[styles.provenance, { backgroundColor: colors.primarySoft }]}>
            <Icon name="lock" size={15} color={colors.primary} />
            <AppText style={styles.provenanceText}>
              {t('passport.identity')}: {passport.identityMethod} · {formatDate(passport.identityDate)}
            </AppText>
          </View>
        </Card>

        {/* Verified work record */}
        {record ? (
          <Card style={styles.card}>
            <SectionLabel>{t('passport.verifiedWork')}</SectionLabel>
            <View style={styles.recordHead}>
              <Icon name="building" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.recordRole}>{record.role}</AppText>
                <AppText style={styles.recordCompany}>{record.company} · {record.workplace}</AppText>
              </View>
              <StatusPill icon="shieldCheck" label={t('passport.verified')} tone="success" />
            </View>
            <AppText style={styles.recordMeta}>
              {record.startYear}–{record.endYear ?? 'Present'}{record.skills.length > 0 ? ` · ${record.skills.join(', ')}` : ''}
            </AppText>
            <View style={[styles.provenance, { backgroundColor: colors.successSoft }]}>
              <Icon name="checkCircle" size={15} color={colors.success} />
              <AppText style={[styles.provenanceText, { color: colors.ink }]}>
                {t('passport.verified')} {record.verifiedBy} · {formatDate(record.verifiedAt)}
              </AppText>
            </View>
          </Card>
        ) : (
          <Card style={styles.card}>
            <SectionLabel>{t('passport.verifiedWork')}</SectionLabel>
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('passport.noWorkRecords')}</AppText>
            </View>
          </Card>
        )}

        {/* Skills */}
        <Card style={styles.card}>
          <SectionLabel>{t('passport.skills')}</SectionLabel>
          {passport.skills.length > 0 ? (
            <View style={styles.skills}>
              {passport.skills.map((s, i) => (
                <View key={i} style={[styles.skill, s.verified ? styles.skillOn : styles.skillOff]}>
                  <Icon name={s.verified ? 'shieldCheck' : 'check'} size={14} color={s.verified ? colors.success : colors.mutedLight} />
                  <AppText style={[styles.skillText, s.verified ? styles.skillTextOn : styles.skillTextOff]}>{s.name}</AppText>
                  <AppText style={[styles.skillTag, s.verified ? styles.skillTagOn : styles.skillTagOff]}>
                    {s.verified ? t('passport.verified') : t('passport.selfDeclared')}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('passport.noSkills')}</AppText>
            </View>
          )}
        </Card>

        {/* Languages + safety */}
        <Card style={styles.card}>
          <SectionLabel>{t('passport.languages')}</SectionLabel>
          {passport.languages.length > 0 ? (
            <View style={styles.chips}>
              {passport.languages.map((l, i) => (
                <View key={i} style={styles.langChip}><AppText style={styles.langText}>{l}</AppText></View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('passport.noLanguages')}</AppText>
            </View>
          )}
          <SectionLabel>{t('passport.safety')}</SectionLabel>
          {passport.safetyQualifications.length > 0 ? (
            <View style={styles.chips}>
              {passport.safetyQualifications.map((q, i) => (
                <View key={i} style={styles.safetyChip}>
                  <Icon name="shieldCheck" size={14} color={colors.success} />
                  <AppText style={styles.safetyText}>{q}</AppText>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('passport.noSafety')}</AppText>
            </View>
          )}
        </Card>

        {/* Share toggle */}
        <Card style={styles.shareCard}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.shareTitle}>{t('passport.share')}</AppText>
            <AppText style={[styles.shareState, { color: passport.shareEnabled ? colors.success : colors.muted }]}>
              {passport.shareEnabled ? t('passport.shareOn') : t('passport.shareOff')}
            </AppText>
          </View>
          <Switch
            value={passport.shareEnabled}
            onValueChange={setShareEnabled}
            trackColor={{ true: colors.success, false: colors.border }}
            thumbColor={colors.white}
            accessibilityLabel={t('passport.share')}
          />
        </Card>
        {passport.shareEnabled ? (
          <View style={[styles.shareDemoNote, { backgroundColor: colors.successSoft }]}>
            <Icon name="info" size={15} color={colors.success} />
            <AppText style={styles.shareDemoText}>{t('passport.shareDemo')}</AppText>
          </View>
        ) : null}

        <View style={[styles.demoNote, { backgroundColor: colors.demoSoft }]}>
          <Icon name="info" size={16} color={colors.muted} />
          <AppText style={styles.demoNoteText}>{t('passport.demoNote')}</AppText>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  identity: { gap: spacing.md },
  identityTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: typography.size.lg, fontWeight: typography.weight.bold as any, color: colors.ink },
  role: { fontSize: typography.size.sm, color: colors.muted },
  idRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  idText: { fontSize: typography.size.sm, color: colors.muted, marginRight: spacing.sm },
  provenance: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: radius.sm },
  provenanceText: { flex: 1, fontSize: typography.size.xs, color: colors.primary, lineHeight: typography.size.xs * typography.lineHeight.relaxed },
  card: { gap: spacing.sm },
  recordHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recordRole: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink },
  recordCompany: { fontSize: typography.size.sm, color: colors.muted },
  recordMeta: { fontSize: typography.size.sm, color: colors.ink, marginTop: spacing.xs },
  emptyBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm },
  emptyText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1 },
  skillOn: { backgroundColor: colors.successSoft, borderColor: colors.success },
  skillOff: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  skillText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium as any },
  skillTextOn: { color: colors.ink },
  skillTextOff: { color: colors.muted },
  skillTag: { fontSize: typography.size.xs },
  skillTagOn: { color: colors.success },
  skillTagOff: { color: colors.mutedLight },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  langChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  langText: { fontSize: typography.size.sm, color: colors.ink },
  safetyChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success },
  safetyText: { fontSize: typography.size.sm, color: colors.ink },
  shareCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  shareTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink },
  shareState: { fontSize: typography.size.sm, marginTop: 2 },
  shareDemoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.success },
  shareDemoText: { flex: 1, fontSize: typography.size.sm, color: colors.ink, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  demoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm },
  demoNoteText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
});
