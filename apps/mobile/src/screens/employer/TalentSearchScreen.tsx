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
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Badge } from '@skillbridge/ui';
import { apiRequest, errMessage, ApiError } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { useAuthStore } from '../../store/auth';
import { colors, spacing, typography, radius, TAP_MIN } from '../../theme';

import { AppText } from './../../components/ui';
// Lightweight debounce for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmployerDashboard: undefined;
  TalentSearch: undefined;
  TeamManagement: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TalentSearch'>;

interface Props {
  navigation: NavigationProp;
}

interface Student {
  id: string;
  name: string;
  email: string;
  university?: string;
  major?: string;
  skills: string[];
  verifiedCertCount: number;
  applicationCount: number;
  graduationYear?: number;
}

export default function TalentSearchScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [search, setSearch] = React.useState('');

  // Debounced search so we don't refetch on every keystroke
  const debouncedSearch = useDebounce(search, 400);

  const load = React.useCallback(async (opts: { refresh?: boolean } = {}) => {
    if (!opts.refresh) setLoading(true);
    try {
      const qs = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
      const data = await apiRequest<{
        students: Student[];
        total: number;
      }>(`${API_ENDPOINTS.employer.talent}${qs}`, {
        method: 'GET',
        token,
      });
      setStudents(data.students ?? []);
    } catch (err: unknown) {
      // If the user isn't an employer, the API returns 403 — graceful empty state
      if (err instanceof ApiError && err.status === 403) {
        setStudents([]);
      } else {
        if (opts.refresh) {
          Alert.alert('Error', errMessage(err, 'Failed to load talent'));
        } else {
          setStudents([]);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase())) ||
      (s.university || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, skill, or university..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} tintColor={colors.primary} />
        }
      >
        {filtered.length === 0 ? (
          <AppText style={styles.empty}>
            {search ? 'No students match your search.' : 'No talent available yet.'}
          </AppText>
        ) : (
          filtered.map((s) => {
            const initials = s.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <TouchableOpacity key={s.id} activeOpacity={0.8} style={styles.cardLink}>
                <Card style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <AppText style={styles.avatarText}>{initials}</AppText>
                    </View>
                    <View style={styles.cardInfo}>
                      <AppText style={styles.cardName}>{s.name}</AppText>
                      <AppText style={styles.cardSub}>
                        {s.university || 'No university'}
                        {s.major ? ` · ${s.major}` : ''}
                      </AppText>
                      <View style={styles.skillRow}>
                        {s.skills.slice(0, 3).map((sk) => (
                          <Badge key={sk} label={sk} color={colors.primary} backgroundColor={colors.primaryLight} />
                        ))}
                        {s.skills.length > 3 && (
                          <Badge label={`+${s.skills.length - 3}`} color={colors.textSecondary} backgroundColor="#F3F4F6" />
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <AppText style={styles.cardMeta}>
                      🎓 {s.verifiedCertCount} verified · 💼 {s.applicationCount} applied
                    </AppText>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  list: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  searchInput: {
    height: TAP_MIN,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  cardLink: { width: '100%' },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.background,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  cardSub: { fontSize: typography.size.sm, color: colors.textSecondary },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  cardFooter: { marginTop: spacing.xs },
  cardMeta: { fontSize: typography.size.sm, color: colors.textTertiary },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.xxl, fontSize: typography.size.base },
});
