import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../store/auth';
import { apiRequest } from '../../services/api';
import { API_ENDPOINTS } from '../../config';
import { Button, Input, Card, Badge } from '@skillbridge/ui';
import { colors, spacing, typography, radius } from '../../theme';
import CertificateSection from '../components/CertificateSection';

interface ProfileShape {
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  skills?: string[];
  companyName?: string;
  industry?: string;
  companySize?: number;
}

export default function ProfileScreen() {
  const { user, token, updateUser } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState(user?.name || '');
  const [university, setUniversity] = React.useState('');
  const [major, setMajor] = React.useState('');
  const [graduationYear, setGraduationYear] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState('');

  const isStudent = user?.role === 'student';

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiRequest<{ user: { name: string; profile: ProfileShape } }>(
          API_ENDPOINTS.users.profile,
          { method: 'GET', token }
        );
        if (!active) return;
        const p = data.user.profile || {};
        setName(data.user.name || user?.name || '');
        setUniversity(p.university || '');
        setMajor(p.major || '');
        setGraduationYear(p.graduationYear ? String(p.graduationYear) : '');
        setSkills(p.skills || []);
      } catch (err: any) {
        if (active) Alert.alert('Error', err?.message || 'Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) {
      setSkills([...skills, v]);
      setSkillInput('');
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const save = async () => {
    setSaving(true);
    try {
      const body: any = { name };
      if (isStudent) {
        body.university = university || undefined;
        body.major = major || undefined;
        body.graduationYear = graduationYear ? parseInt(graduationYear, 10) : undefined;
        body.skills = skills;
      }
      const data = await apiRequest<{ user: { name: string; profile: ProfileShape } }>(
        API_ENDPOINTS.users.updateProfile,
        { method: 'PUT', token, body }
      );
      updateUser({ name: data.user.name });
      Alert.alert('Saved', 'Profile updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Badge
          label={user?.role || ''}
          color={isStudent ? colors.student : colors.employer}
          backgroundColor={isStudent ? colors.primaryLight : '#EDEAFD'}
        />
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Personal</Text>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input label="Email" value={user?.email} editable={false} />
      </Card>

      {isStudent ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Input label="University" value={university} onChangeText={setUniversity} placeholder="e.g. RUPP" />
          <Input label="Major" value={major} onChangeText={setMajor} placeholder="e.g. Computer Science" />
          <Input
            label="Graduation Year"
            value={graduationYear}
            onChangeText={setGraduationYear}
            keyboardType="numeric"
            placeholder="2027"
          />
        </Card>
      ) : (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Company</Text>
          <Input label="Company Name" value={user?.name} editable={false} />
          <Text style={styles.note}>Employer details are managed from the web portal.</Text>
        </Card>
      )}

      {isStudent ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillInputRow}>
            <TextInput
              style={styles.skillInput}
              placeholder="Add a skill..."
              value={skillInput}
              onChangeText={setSkillInput}
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skills}>
            {skills.map((s) => (
              <TouchableOpacity key={s} onPress={() => removeSkill(s)}>
                <Badge label={`${s}  ×`} color={colors.primary} backgroundColor={colors.primaryLight} />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      ) : null}

      <Button onPress={save} loading={saving} disabled={saving} fullWidth style={styles.saveBtn}>
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>

      {user?.role === 'student' && (
        <CertificateSection />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  container: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: typography.weight.bold as any },
  name: { fontSize: typography.size.xl, fontWeight: typography.weight.bold as any, color: colors.textPrimary },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  note: { fontSize: typography.size.sm, color: colors.textTertiary, marginTop: -4 },
  skillInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: typography.weight.bold as any },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  saveBtn: { marginTop: spacing.md },
});
