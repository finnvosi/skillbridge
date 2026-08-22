// Jobs tab — verified factory jobs.
// Uses the real worker API when USE_REMOTE_API is on, falling back to local
// fixtures if the API is unreachable (keeps the prototype demoable).
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, TAP_MIN } from '../theme';
import { DEMO_JOBS } from '../data/fixtures';
import { DemoJob } from '../types';
import { useT } from '../hooks/useT';
import { Header } from '../components/Header';
import { JobCard } from '../components/JobCard';
import { Icon } from '../components/Icon';
import { DemoTag } from '../components/ui';
import { AppText } from './../components/ui';
import { fetchJobs } from '../services/workerApi';
import { USE_REMOTE_API } from '../config';
type Filter = 'none' | 'near' | 'day' | 'salary';

export default function JobsScreen({
  onOpenJob,
  onOpenNotifications,
}: {
  onOpenJob: (job: DemoJob) => void;
  onOpenNotifications?: () => void;
}) {
  const { t } = useT();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('none');
  const [jobs, setJobs] = useState<DemoJob[]>(DEMO_JOBS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!USE_REMOTE_API) return;
    let alive = true;
    setLoading(true);
    fetchJobs()
      .then((data) => {
        // A remote EMPTY array is a real result — show the honest empty state,
        // don't silently keep the demo fixtures.
        if (alive) setJobs(data.length ? data : []);
      })
      .catch(() => {
        // API unreachable — keep fixture fallback.
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filter === 'near' && j.distanceKm > 10) return false;
      if (filter === 'day' && j.shift !== 'day') return false;
      if (filter === 'salary' && j.payPerMonth < 220) return false;
      if (q) {
        const hay = `${j.title} ${j.company} ${j.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'near', label: t('jobs.filterNear') },
    { key: 'day', label: t('jobs.filterDay') },
    { key: 'salary', label: t('jobs.filterSalary') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header showBell={!!onOpenNotifications} onBell={onOpenNotifications} />
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('jobs.search')}
            placeholderTextColor={colors.mutedLight}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel={t('jobs.search')}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        style={styles.filterScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        keyboardShouldPersistTaps="handled"
      >
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              accessibilityRole="button"
              onPress={() => setFilter(active ? 'none' : f.key)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
            >
              <AppText style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.resultsHeader}>
        <AppText style={styles.resultsText} weight="display">{t('jobs.results', { n: filtered.length })}</AppText>
        {loading ? <ActivityIndicator size="small" color={colors.muted} /> : <DemoTag />}
      </View>

      <FlashList
        data={filtered}
        renderItem={({ item }) => <JobCard job={item} onPress={() => onOpenJob(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={styles.emptyTitle} weight="display">{t('jobs.empty')}</AppText>
            <AppText style={styles.emptySub}>{t('jobs.emptySub')}</AppText>
          </View>
        }
        ListFooterComponent={<View style={{ height: spacing.xxxl }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: TAP_MIN,
  },
  searchInput: { flex: 1, fontSize: typography.size.base, color: colors.ink, paddingVertical: spacing.sm },
  filterScroll: { flexGrow: 0 },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: TAP_MIN,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipPressed: { opacity: 0.85 },
  chipText: {
    fontSize: typography.size.sm,
    lineHeight: 22,
    fontWeight: typography.weight.semibold as any,
    color: colors.muted,
  },
  chipTextActive: { color: colors.accent },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: TAP_MIN,
  },
  resultsText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 22,
    fontWeight: typography.weight.semibold as any,
    color: colors.muted,
  },
  list: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold as any, color: colors.ink, textAlign: 'center' },
  emptySub: { fontSize: typography.size.base, color: colors.muted, textAlign: 'center', marginTop: spacing.sm },
});
