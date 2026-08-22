import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Badge, Button } from '@skillbridge/ui';
import { apiRequest } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../App';
import { colors, spacing, typography, radius } from '../../theme';

import { AppText } from './../../components/ui';
const TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  part_time: 'Part-time',
  freelance: 'Freelance',
  full_time: 'Full-time',
};

type ApiProject = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  budget?: number | null;
  skillsRequired: string[];
  location?: string | null;
  remote: boolean;
  employer?: { user?: { name?: string } };
};

type DetailNav = NativeStackNavigationProp<RootStackParamList, 'ProjectDetail'>;
type DetailRoute = RouteProp<RootStackParamList, 'ProjectDetail'>;

interface Props {
  navigation: DetailNav;
  route: DetailRoute;
}

export default function ProjectDetailScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [project, setProject] = React.useState<ApiProject | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest<{ project: ApiProject }>(
          API_ENDPOINTS.projects.detail(projectId),
          { method: 'GET', token }
        );
        setProject(data.project);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, token]);

  const apply = async () => {
    if (!project) return;
    try {
      await apiRequest(API_ENDPOINTS.projects.apply(project.id), {
        method: 'POST',
        token,
        body: { coverLetter: 'I would love to work on this project.' },
      });
      Alert.alert('Applied!', `You applied to "${project.title}".`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to apply');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!project) {
    return (
      <View style={styles.center}>
        <AppText style={styles.notFound}>Project not found.</AppText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.head}>
        <AppText style={styles.title}>{project.title}</AppText>
        <Badge label={TYPE_LABELS[project.type] || project.type} color={colors.primary} backgroundColor={colors.primaryLight} />
      </View>

      <Card style={styles.block}>
        <AppText style={styles.label}>Description</AppText>
        <AppText style={styles.body}>{project.description}</AppText>
      </Card>

      <View style={styles.row}>
        <Card style={styles.stat}>
          <AppText style={styles.statValue}>{project.budget ? `$${project.budget}` : 'TBD'}</AppText>
          <AppText style={styles.statLabel}>Budget</AppText>
        </Card>
        <Card style={styles.stat}>
          <AppText style={styles.statValue}>{project.remote ? 'Remote' : project.location || 'Onsite'}</AppText>
          <AppText style={styles.statLabel}>Location</AppText>
        </Card>
      </View>

      <Card style={styles.block}>
        <AppText style={styles.label}>Skills required</AppText>
        <View style={styles.skills}>
          {project.skillsRequired.map((s) => (
            <Badge key={s} label={s} color={colors.textSecondary} backgroundColor={colors.surface} />
          ))}
        </View>
      </Card>

      {project.employer?.user?.name ? (
        <Card style={styles.block}>
          <AppText style={styles.label}>Posted by</AppText>
          <AppText style={styles.body}>{project.employer.user.name}</AppText>
        </Card>
      ) : null}

      {user?.role === 'student' ? (
        <Button onPress={apply} fullWidth style={styles.applyBtn}>
          Apply now
        </Button>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  notFound: { color: colors.textSecondary, fontSize: typography.size.base },
  container: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  head: { gap: spacing.sm },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  block: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  statLabel: { fontSize: typography.size.xs, color: colors.textSecondary },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textSecondary, textTransform: 'uppercase' },
  body: { fontSize: typography.size.base, color: colors.textPrimary, lineHeight: 24 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  applyBtn: { marginTop: spacing.md },
});
