import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Badge, Button } from '@skillbridge/ui';
import { apiRequest } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../App';
import { colors, spacing, typography, radius } from '../../theme';

type ProjectsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Projects'>;

const TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  part_time: 'Part-time',
  freelance: 'Freelance',
  full_time: 'Full-time',
};
const TYPE_COLORS: Record<string, string> = {
  internship: '#E3F2FD',
  part_time: '#F3E5F5',
  freelance: '#E8F5E9',
  full_time: '#FFF3E0',
};

type ApiProject = {
  id: string;
  title: string;
  description: string;
  type: string;
  budget?: number | null;
  skillsRequired: string[];
  location?: string | null;
  remote: boolean;
  employer?: { user?: { name?: string } };
};

interface Props {
  navigation: ProjectsScreenNavigationProp;
}

export default function ProjectsScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = React.useState<ApiProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await apiRequest<{ projects: ApiProject[] }>(API_ENDPOINTS.projects.list, {
        method: 'GET',
        token,
      });
      setProjects(data.projects);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const apply = async (p: ApiProject) => {
    if (user?.role !== 'student') {
      Alert.alert('Only students can apply', 'Switch to a student account to apply.');
      return;
    }
    try {
      await apiRequest(API_ENDPOINTS.projects.apply(p.id), {
        method: 'POST',
        token,
        body: { coverLetter: 'I would love to work on this project.' },
      });
      Alert.alert('Applied!', `You applied to "${p.title}".`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to apply');
    }
  };

  const renderItem = ({ item }: { item: ApiProject }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}>
      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Badge
            label={TYPE_LABELS[item.type] || item.type}
            color={colors.primary}
            backgroundColor={TYPE_COLORS[item.type] || colors.primaryLight}
          />
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardBudget}>{item.budget ? `$${item.budget}` : 'Budget TBD'}</Text>
          <Text style={styles.cardSkills} numberOfLines={1}>
            {item.skillsRequired.join(' · ')}
          </Text>
        </View>
        {item.location ? (
          <Text style={styles.cardLocation}>
            📍 {item.location}{item.remote ? ' · Remote' : ''}
          </Text>
        ) : item.remote ? (
          <Text style={styles.cardLocation}>🌐 Remote</Text>
        ) : null}
        <Button
          variant={user?.role === 'student' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => apply(item)}
          disabled={user?.role !== 'student'}
        >
          {user?.role === 'student' ? 'Apply' : 'Employer'}
        </Button>
      </Card>
    </TouchableOpacity>
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
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Projects</Text>
      </View>
      <FlatList
        data={projects}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>No projects available yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  headerBar: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.textPrimary,
  },
  list: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  card: { gap: spacing.sm },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  cardTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.textPrimary,
    flex: 1,
  },
  cardDesc: { fontSize: typography.size.base, color: colors.textSecondary, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBudget: { fontSize: typography.size.md, fontWeight: typography.weight.bold as any, color: colors.primary },
  cardSkills: { fontSize: typography.size.sm, color: colors.textTertiary, flexShrink: 1, textAlign: 'right' },
  cardLocation: { fontSize: typography.size.sm, color: colors.textSecondary },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.xxl, fontSize: typography.size.base },
});
