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
import { Card, Button, Badge } from '@skillbridge/ui';
import { apiRequest, errMessage } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { useAuthStore } from '../../store/auth';
import { colors, spacing, typography, radius } from '../../theme';

import { AppText } from './../../components/ui';
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'recruiter' | 'hiring_manager' | 'admin';
  status: 'invited' | 'active';
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  admin: 'Admin',
};

export default function TeamScreen() {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [inviting, setInviting] = React.useState(false);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<TeamMember['role']>('recruiter');

  const load = React.useCallback(async () => {
    try {
      const data = await apiRequest<{ members: TeamMember[] }>(
        API_ENDPOINTS.employer.team,
        { method: 'GET', token }
      );
      setMembers(data.members ?? []);
    } catch (err: unknown) {
      Alert.alert('Error', errMessage(err, 'Failed to load team'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  const invite = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in name and email');
      return;
    }
    setInviting(true);
    try {
      const data = await apiRequest<{ member: TeamMember }>(
        API_ENDPOINTS.employer.team,
        { method: 'POST', token, body: { name: name.trim(), email, role } }
      );
      setMembers((m) => [...m, data.member]);
      setName('');
      setEmail('');
      Alert.alert('Success', 'Teammate invited.');
    } catch (err: unknown) {
      Alert.alert('Error', errMessage(err, 'Failed to invite'));
    } finally {
      setInviting(false);
    }
  };

  const remove = async (id: string, name: string) => {
    Alert.alert(
      'Remove teammate?',
      `This will remove ${name} from your team.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`${API_ENDPOINTS.employer.team}/${id}`, {
                method: 'DELETE',
                token,
              });
              setMembers((m) => m.filter((x) => x.id !== id));
            } catch (err: unknown) {
              Alert.alert('Error', errMessage(err, 'Failed to remove'));
            }
          },
        },
      ]
    );
  };

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
      <AppText style={styles.title}>Team</AppText>
      <AppText style={styles.subtitle}>Invite teammates to collaborate on hiring.</AppText>

      {/* Invite form */}
      <Card style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.roleRow}>
          {(['recruiter', 'hiring_manager', 'admin'] as TeamMember['role'][]).map((r) => (
            <TouchableOpacity
              key={r}
              activeOpacity={0.8}
              onPress={() => setRole(r)}
              style={[
                styles.roleBtn,
                {
                  backgroundColor: role === r ? colors.primary : '#F3F4F6',
                },
              ]}
            >
              <AppText
                style={[
                  styles.roleText,
                  { color: role === r ? colors.background : colors.textPrimary },
                ]}
              >
                {ROLE_LABELS[r]}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <Button onPress={invite} loading={inviting} disabled={inviting} fullWidth>
          {inviting ? 'Inviting...' : 'Send invite'}
        </Button>
      </Card>

      {/* Member list */}
      <View style={styles.memberList}>
        <View style={styles.memberItem}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <AppText style={styles.avatarText}>ME</AppText>
          </View>
          <View>
            <AppText style={styles.memberName}>You</AppText>
            <AppText style={styles.memberSub}>Account owner</AppText>
          </View>
          <Badge label="OWNER" color={colors.primary} backgroundColor={colors.primaryLight} />
        </View>

        {members.length === 0 ? (
          <AppText style={styles.empty}>No teammates yet. Invite your first recruiters or hiring managers.</AppText>
        ) : (
          members.map((m) => (
            <View key={m.id} style={styles.memberItem}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <AppText style={[styles.avatarText, { color: colors.primary }]}>
                  {m.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AppText>
              </View>
              <View style={styles.memberInfo}>
                <AppText style={styles.memberName}>{m.name}</AppText>
                <AppText style={styles.memberSub}>{m.email}</AppText>
                <Badge label={ROLE_LABELS[m.role]} color={colors.textSecondary} backgroundColor="#F3F4F6" />
                <AppText style={styles.memberStatus}>
                  {m.status === 'active' ? '🟢 Active' : '⏳ Invited'}
                </AppText>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => remove(m.id, m.name)}
                style={styles.removeBtn}
              >
                <AppText style={styles.removeText}>Remove</AppText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: { fontSize: typography.size.base, color: colors.textSecondary },
  form: { gap: spacing.sm },
  input: {
    height: 44,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.separator,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  roleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  roleText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  memberList: { gap: spacing.sm },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: typography.weight.bold },
  memberInfo: { flex: 1, minWidth: 0, gap: 2 },
  memberName: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  memberSub: { fontSize: typography.size.sm, color: colors.textSecondary },
  memberStatus: { fontSize: typography.size.xs, color: colors.textTertiary },
  removeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.danger,
  },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.md, fontSize: typography.size.base },
});
