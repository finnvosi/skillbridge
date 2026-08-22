import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Badge, Button } from '@skillbridge/ui';
import { apiRequest, errMessage } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { useAuthStore } from '../../store/auth';
import { colors, spacing, typography, radius } from '../../theme';

import { AppText } from './../../components/ui';
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmployerDashboard: undefined;
  TalentSearch: undefined;
  TeamManagement: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmployerDashboard'>;

interface Props {
  navigation: NavigationProp;
}

// Funnel step config
const FUNNEL_STEPS = [
  { label: 'Applied', key: 'applied', bg: '#E3F2FD' },
  { label: 'In Review', key: 'reviewing', bg: '#FEF3C7' },
  { label: 'Accepted', key: 'accepted', bg: '#DCFCE7' },
  { label: 'Rejected', key: 'rejected', bg: '#FEE2E2' },
] as const;

export default function EmployerDashboardScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

type ApiProject = Record<string, unknown>;

type ApiApplication = {
  id: string;
  status: string;
  student?: { user?: { name?: string } };
  project?: { title?: string };
};

type ApiAnalytics = {
  talentScore?: number;
  acceptanceRate?: number;
  funnel?: Record<string, number>;
};

  const [projects, setProjects] = React.useState<ApiProject[]>([]);
  const [applications, setApplications] = React.useState<ApiApplication[]>([]);
  const [analytics, setAnalytics] = React.useState<ApiAnalytics | null>(null);

  const load = React.useCallback(async () => {
    try {
      const [projRes, appsRes, anRes] = await Promise.all([
        apiRequest<{ projects: ApiProject[] }>(API_ENDPOINTS.employer.projects, {
          method: 'GET',
          token,
        }),
        apiRequest<{ applications: ApiApplication[] }>(API_ENDPOINTS.employer.applications, {
          method: 'GET',
          token,
        }),
        apiRequest<ApiAnalytics>(API_ENDPOINTS.employer.analytics, {
          method: 'GET',
          token,
        }).catch(() => null),
      ]);

      setProjects(projRes.projects ?? []);
      setApplications(appsRes.applications ?? []);
      setAnalytics(anRes);
    } catch (err: unknown) {
      Alert.alert('Error', errMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.greeting}>Dashboard</AppText>
        <AppText style={styles.subtitle}>Welcome back, {user?.name?.split(' ')[0] || 'employer'}</AppText>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="Active opportunities" value={projects.length} bgColor={colors.primaryLight} />
        <StatCard label="Total applicants" value={applications.length} bgColor={colors.primaryLight} />
        <StatCard label="Needs review" value={pendingCount} bgColor="#FEF3C7" />
        <StatCard
          label="Match strength"
          value={analytics?.talentScore ?? 0}
          suffix="%"
          bgColor={colors.primaryLight}
        />
      </View>

      {/* Hiring funnel */}
      {analytics && (
        <Card style={styles.card}>
          <AppText style={styles.sectionTitle}>Hiring funnel</AppText>
          <View style={styles.funnel}>
            {FUNNEL_STEPS.map((step, i) => {
              const val = analytics.funnel?.[step.key] ?? 0;
              const total = analytics.funnel?.applied ?? 1;
              const pct = total > 0 ? (val / total) * 100 : 0;
              return (
                <View key={step.label} style={styles.funnelStep}>
                  <View style={styles.funnelLabelRow}>
                    <AppText style={styles.funnelLabel}>{step.label}</AppText>
                    <AppText style={styles.funnelValue}>{val}</AppText>
                  </View>
                  <View style={[styles.funnelBar, { backgroundColor: '#E5E7EB' }]}>
                    <View
                      style={[
                        styles.funnelFill,
                        {
                          width: `${Math.max(pct, val > 0 ? 6 : 0)}%`,
                          backgroundColor: step.key === 'applied'
                            ? '#3B82F6'
                            : step.key === 'reviewing'
                              ? '#F59E0B'
                              : step.key === 'accepted'
                                ? '#22C55E'
                                : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
          {analytics.acceptanceRate !== undefined && (
            <View style={styles.acceptanceRow}>
              <AppText style={styles.acceptanceLabel}>Acceptance rate</AppText>
              <AppText style={styles.acceptanceValue}>{analytics.acceptanceRate}%</AppText>
            </View>
          )}
        </Card>
      )}

      {/* Candidates needing review */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>Needs your review</AppText>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate('TalentSearch')}
          >
            View all
          </Button>
        </View>

        {pendingCount === 0 ? (
          <AppText style={styles.empty}>No pending applications. 🎉</AppText>
        ) : (
          <View style={styles.candidates}>
            {applications
              .filter((a) => a.status === 'pending')
              .slice(0, 5)
              .map((app) => (
                <View key={app.id} style={styles.candidateRow}>
                  <View style={styles.candidateAvatar}>
                    <AppText style={styles.candidateInitials}>
                      {(app.student?.user?.name || 'CA')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AppText>
                  </View>
                  <View style={styles.candidateInfo}>
                    <AppText style={styles.candidateName}>
                      {app.student?.user?.name || 'Unnamed candidate'}
                    </AppText>
                    <AppText style={styles.candidateSub}>
                      {app.project?.title || 'Unknown project'} · {app.status}
                    </AppText>
                  </View>
                  <Badge
                    label={app.status}
                    color={colors.textSecondary}
                    backgroundColor="#F3F4F6"
                  />
                </View>
              ))}
          </View>
        )}
      </Card>

      {/* Quick actions */}
      <View style={styles.actions}>
        <Button
          variant="primary"
          onPress={() => {
            if (projects.length > 0) {
              Alert.alert('Coming soon', 'Project creation on mobile is in development.');
            }
          }}
          style={styles.actionBtn}
        >
          Post opportunity
        </Button>
        <Button
          variant="secondary"
          onPress={() => navigation.navigate('TeamManagement')}
          style={styles.actionBtn}
        >
          Manage team
        </Button>
      </View>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  suffix,
  bgColor,
}: {
  label: string;
  value: number;
  suffix?: string;
  bgColor?: string;
}) {
  return (
    <Card style={[styles.statCard, { backgroundColor: bgColor ?? colors.surfaceSecondary }]}>
      <AppText style={styles.statValue}>
        {value}
        {suffix}
      </AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  header: { marginBottom: spacing.sm },
  greeting: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: { fontSize: typography.size.base, color: colors.textSecondary, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  statCard: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.xs },
  card: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  funnel: { gap: spacing.sm },
  funnelStep: { gap: spacing.xs },
  funnelLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  funnelLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  funnelValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  funnelBar: { height: 6, borderRadius: radius.sm, overflow: 'hidden' },
  funnelFill: { height: '100%', borderRadius: radius.sm },
  acceptanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  acceptanceLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  acceptanceValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  candidates: { gap: spacing.sm },
  candidateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  candidateAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateInitials: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.background },
  candidateInfo: { flex: 1, minWidth: 0 },
  candidateName: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  candidateSub: { fontSize: typography.size.sm, color: colors.textSecondary },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.md, fontSize: typography.size.base },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { flex: 1 },
});
