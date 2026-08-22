// Career Passport — identity, skills, work history with verification states,
// and a local demo share toggle.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useT } from '../hooks/useT';
import { useAppStore } from '../store/useAppStore';
import { Icon, IconName } from '../components/Icon';
import { Header } from '../components/Header';
import { Card, StatusPill, DemoTag, SectionLabel, Button } from '../components/ui';
import {
  fetchPassport,
  requestWorkRecordVerification,
  deleteWorkRecord,
  createPassportShare,
  listPassportShares,
  revokePassportShare,
  PassportShare,
} from '../services/workerApi';
import { ApiError } from '../services/api';
import { USE_REMOTE_API } from '../config';
import { useAuthStore } from '../store/auth';
import { DemoPassport, WorkRecord } from '../types';
import { AppText } from './../components/ui';
export default function PassportScreen({
  onEditPassport,
  onAddWorkRecord,
}: {
  onEditPassport?: () => void;
  onAddWorkRecord?: () => void;
}) {
  const { t, formatDate } = useT();
  const storePassport = useAppStore((s) => s.passport);
  const setPassport = useAppStore((s) => s.setPassport);
  const token = useAuthStore((s) => s.token);
  const [remotePassport, setRemotePassport] = useState<DemoPassport | null>(null);

  const load = useCallback(async () => {
    if (!USE_REMOTE_API || !token) return;
    const data = await fetchPassport(token);
    if (data) {
      setRemotePassport(data);
      setPassport(data);
    }
  }, [token, setPassport]);

  useEffect(() => {
    if (!USE_REMOTE_API || !token) return;
    let alive = true;
    fetchPassport(token)
      .then((data) => {
        if (alive && data) {
          setRemotePassport(data);
          // Sync the live remote passport into the store so the Edit screen
          // (which reads the store at navigation time) pre-fills with the
          // same data the tab is showing, not the local demo fallback.
          setPassport(data);
        }
      })
      .catch(() => {
        // keep store fallback
      });
    return () => {
      alive = false;
    };
  }, [token, setPassport]);

  const passport = remotePassport ?? storePassport;

  const verifiedCount = passport.skills.filter((s) => s.verified).length;
  const records = passport.workRecords;
  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = async (id: string, fn: () => Promise<unknown>, okKey: string) => {
    setBusyId(id);
    try {
      await fn();
      await load().catch(() => {});
      Alert.alert(t('common.demo'), t(okKey));
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('onboarding.saveError'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRequestVerification = (r: WorkRecord) =>
    runAction(r.id, () => requestWorkRecordVerification(r.id, token), 'workrecord.requested');

  const handleDelete = (r: WorkRecord) =>
    Alert.alert(t('workrecord.title'), t('passport.deleteRecord') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('passport.deleteRecord'),
        style: 'destructive',
        onPress: () => runAction(r.id, () => deleteWorkRecord(r.id, token), 'workrecord.deleted'),
      },
    ]);

  // ---- Passport sharing (expiring, revocable links) -------------------------
  const [shares, setShares] = useState<PassportShare[]>([]);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!USE_REMOTE_API || !token) return;
    let alive = true;
    listPassportShares(token)
      .then((data) => {
        if (alive) setShares(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [token]);

  const loadShares = useCallback(async () => {
    if (!USE_REMOTE_API || !token) return;
    const data = await listPassportShares(token);
    setShares(data);
  }, [token]);

  const handleCreateShare = async () => {
    setSharing(true);
    try {
      await createPassportShare(24, token);
      await loadShares().catch(() => {});
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('onboarding.saveError'),
      );
    } finally {
      setSharing(false);
    }
  };

  const handleRevoke = (shareId: string) =>
    Alert.alert(t('passport.revoke'), t('passport.revokeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('passport.revoke'),
        style: 'destructive',
        onPress: async () => {
          try {
            await revokePassportShare(shareId, token);
            await loadShares().catch(() => {});
          } catch (error) {
            Alert.alert(
              t('common.error'),
              error instanceof ApiError ? error.message : t('onboarding.saveError'),
            );
          }
        },
      },
    ]);

  const activeShares = shares.filter((s) => !s.revokedAt);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        right={
          <View style={styles.headerRight}>
            {onEditPassport ? (
              <Pressable
                accessibilityRole="button"
                onPress={onEditPassport}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.editBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Icon name="edit" size={16} color={colors.white} />
                <AppText style={styles.editBtnText}>{t('passport.edit')}</AppText>
              </Pressable>
            ) : null}
            <DemoTag onDark />
          </View>
        }
      />
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

        {/* Work history */}
        <Card style={styles.card}>
          <SectionLabel>{t('passport.verifiedWork')}</SectionLabel>
          {records.length > 0 ? (
            records.map((r) => {
              const verified = r.status === 'employer_verified';
              const requested = r.status === 'verification_requested';
              return (
                <View key={r.id} style={styles.recordBlock}>
                  <View style={styles.recordHead}>
                    <Icon name="building" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.recordRole}>{r.role}</AppText>
                      <AppText style={styles.recordCompany}>
                        {r.company}{r.workplace ? ` · ${r.workplace}` : ''}
                      </AppText>
                    </View>
                    {verified ? (
                      <StatusPill icon="shieldCheck" label={t('passport.verified')} tone="success" />
                    ) : requested ? (
                      <StatusPill icon="clock" label={t('passport.verificationRequested')} tone="warning" />
                    ) : (
                      <StatusPill icon="user" label={t('passport.selfDeclared')} tone="neutral" />
                    )}
                  </View>
                  <AppText style={styles.recordMeta}>
                    {r.startYear}–{r.endYear ?? 'Present'}{r.skills.length > 0 ? ` · ${r.skills.join(', ')}` : ''}
                  </AppText>

                  {verified ? (
                    <View style={[styles.provenance, { backgroundColor: colors.successSoft }]}>
                      <Icon name="checkCircle" size={15} color={colors.success} />
                      <AppText style={[styles.provenanceText, { color: colors.ink }]}>
                        {t('passport.verified')} {r.verifiedBy || r.company}
                      </AppText>
                    </View>
                  ) : (
                    <View style={styles.recordActions}>
                      {!requested ? (
                        <Pressable
                          accessibilityRole="button"
                          disabled={busyId === r.id}
                          onPress={() => handleRequestVerification(r)}
                          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
                        >
                          <Icon name="shieldCheck" size={15} color={colors.primary} />
                          <AppText style={styles.actionBtnText}>
                            {busyId === r.id ? t('common.loading') : t('passport.requestVerification')}
                          </AppText>
                        </Pressable>
                      ) : null}
                      <Pressable
                        accessibilityRole="button"
                        disabled={busyId === r.id}
                        onPress={() => handleDelete(r)}
                        style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
                      >
                        <Icon name="close" size={15} color={colors.danger} />
                        <AppText style={[styles.actionBtnText, { color: colors.danger }]}>
                          {t('passport.deleteRecord')}
                        </AppText>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('passport.noWorkRecords')}</AppText>
            </View>
          )}
          {onAddWorkRecord ? (
            <Button variant="secondary" icon="plus" fullWidth onPress={onAddWorkRecord} style={styles.addBtn}>
              {t('passport.addRecord')}
            </Button>
          ) : null}
        </Card>

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

        {/* Share your Passport — real expiring, revocable links */}
        <Card style={styles.card}>
          <SectionLabel>{t('passport.share')}</SectionLabel>
          {USE_REMOTE_API && token ? (
            <>
              <Button
                variant="secondary"
                icon="share"
                fullWidth
                loading={sharing}
                disabled={sharing}
                onPress={handleCreateShare}
                style={styles.addBtn}
              >
                {t('passport.shareCreate')}
              </Button>
              {activeShares.length > 0 ? (
                activeShares.map((s) => (
                  <View key={s.id} style={styles.shareRow}>
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.shareUrl} numberOfLines={1}>
                        {s.url}
                      </AppText>
                      <AppText style={styles.shareExpiry}>
                        {t('passport.shareExpires', { date: formatDate(s.expiresAt) })}
                      </AppText>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleRevoke(s.id)}
                      style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
                    >
                      <Icon name="close" size={15} color={colors.danger} />
                      <AppText style={[styles.actionBtnText, { color: colors.danger }]}>
                        {t('passport.revoke')}
                      </AppText>
                    </Pressable>
                  </View>
                ))
              ) : (
                <AppText style={styles.shareHint}>{t('passport.shareEmpty')}</AppText>
              )}
              <View style={styles.shareNote}>
                <Icon name="info" size={15} color={colors.muted} />
                <AppText style={styles.shareNoteText}>{t('passport.shareReal')}</AppText>
              </View>
            </>
          ) : (
            <View style={styles.emptyBox}>
              <Icon name="info" size={16} color={colors.muted} />
              <AppText style={[styles.emptyText, { color: colors.muted }]}>{t('passport.shareDemo')}</AppText>
            </View>
          )}
        </Card>

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
  recordBlock: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  recordHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recordRole: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink },
  recordCompany: { fontSize: typography.size.sm, color: colors.muted },
  recordActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xs },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 40, paddingVertical: spacing.xs, paddingRight: spacing.sm },
  actionBtnText: { fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.semibold },
  addBtn: { marginTop: spacing.sm },
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
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shareUrl: { fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.medium },
  shareExpiry: { fontSize: typography.size.xs, color: colors.muted, marginTop: 2 },
  shareHint: { fontSize: typography.size.sm, color: colors.muted },
  shareNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.demoSoft },
  shareNoteText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  demoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm },
  demoNoteText: { flex: 1, fontSize: typography.size.sm, color: colors.muted, lineHeight: typography.size.sm * typography.lineHeight.relaxed },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    minHeight: 36,
  },
  editBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.white,
  },
});
