import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { Project } from '@skillbridge/types';
import { apiRequest } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { useAuthStore } from '../../store/auth';

// API uses snake_case project types; map to display labels
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

type ApiProject = Omit<Project, 'type'> & { type: string };

export default function ProjectsScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = React.useState<ApiProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [applyingId, setApplyingId] = React.useState<string | null>(null);

  const loadProjects = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ projects: ApiProject[] }>(
        API_ENDPOINTS.projects.list,
        { method: 'GET', token }
      );
      setProjects(data.projects);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleApply = async (project: ApiProject) => {
    if (user?.role !== 'student') {
      Alert.alert('Only students can apply', 'Switch to a student account to apply.');
      return;
    }
    setApplyingId(project.id);
    try {
      await apiRequest(API_ENDPOINTS.projects.apply(project.id), {
        method: 'POST',
        token,
        body: { coverLetter: 'I would love to work on this project.' },
      });
      Alert.alert('Applied!', `You applied to "${project.title}".`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };

  const renderProjectCard = ({ item }: { item: ApiProject }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: TYPE_COLORS[item.type] || '#F5F5F5' },
          ]}
        >
          <Text style={styles.typeText}>
            {TYPE_LABELS[item.type] || item.type}
          </Text>
        </View>
      </View>
      <Text style={styles.projectDesc} numberOfLines={3}>
        {item.description}
      </Text>
      <View style={styles.projectMeta}>
        <Text style={styles.projectBudget}>
          {item.budget ? `$${item.budget}` : 'Budget TBD'}
        </Text>
        <Text style={styles.projectSkills}>
          {item.skillsRequired.join(' • ')}
        </Text>
      </View>
      {item.location ? (
        <Text style={styles.projectLocation}>📍 {item.location}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.applyButton, applyingId === item.id && styles.buttonDisabled]}
        onPress={() => handleApply(item)}
        disabled={applyingId === item.id}
      >
        <Text style={styles.applyButtonText}>
          {applyingId === item.id ? 'Applying...' : 'Apply Now'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Projects</Text>
      <FlatList
        data={projects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshing={loading}
        onRefresh={loadProjects}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No projects available yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  projectDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  projectSkills: {
    fontSize: 12,
    color: '#999',
    flexShrink: 1,
    textAlign: 'right',
  },
  projectLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
