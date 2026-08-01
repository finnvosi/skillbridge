import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '@skillbridge/ui';
import { useAuthStore } from '../../store/auth';
import type { RootStackParamList } from '../../App';
import { colors, spacing, typography, radius } from '../../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const QUICK_ACTIONS = [
  { key: 'projects', label: 'Browse Projects', sub: 'Find work that fits your skills', icon: '🔍' },
  { key: 'profile', label: 'My Profile', sub: 'Build your verified portfolio', icon: '👤' },
  { key: 'resume', label: 'AI Resume Builder', sub: 'Generate a polished resume', icon: '📄' },
] as const;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();

  const go = (key: (typeof QUICK_ACTIONS)[number]['key']) => {
    if (key === 'projects') navigation.navigate('Projects');
    else if (key === 'profile') navigation.navigate('Profile');
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0] || 'there'} 👋</Text>
        <Text style={styles.subtitle}>What do you want to do today?</Text>
      </View>

      <View style={styles.actions}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.key}
            activeOpacity={0.85}
            onPress={() => go(a.key)}
            style={styles.actionTouch}
          >
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { marginBottom: spacing.xl },
  greeting: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: { fontSize: typography.size.md, color: colors.textSecondary, marginTop: spacing.xs },
  actions: { gap: spacing.md },
  actionTouch: { width: '100%' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  actionIcon: { fontSize: 26 },
  actionText: { flex: 1 },
  actionLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.textPrimary,
  },
  actionSub: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
  logout: { marginTop: spacing.xxl, alignItems: 'center' },
  logoutText: {
    fontSize: typography.size.base,
    color: colors.danger,
    fontWeight: typography.weight.medium as any,
  },
});
