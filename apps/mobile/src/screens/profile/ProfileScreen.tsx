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

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
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
      Alert.alert('Success', 'Profile updated!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, styles.disabledInput]}
          placeholder="Email"
          value={user?.email || ''}
          editable={false}
          placeholderTextColor="#999"
        />
      </View>

      {isStudent ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <TextInput
            style={styles.input}
            placeholder="University"
            value={university}
            onChangeText={setUniversity}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Major"
            value={major}
            onChangeText={setMajor}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Graduation Year (e.g. 2027)"
            value={graduationYear}
            onChangeText={setGraduationYear}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company</Text>
          <TextInput
            style={styles.input}
            placeholder="Company name is set on registration"
            value={user?.name}
            editable={false}
            placeholderTextColor="#999"
          />
          <Text style={styles.note}>
            Employer company details are managed from the web portal.
          </Text>
        </View>
      )}

      {isStudent ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              placeholder="Add a skill..."
              value={skillInput}
              onChangeText={setSkillInput}
              placeholderTextColor="#999"
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillsContainer}>
            {skills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <Text style={styles.skillRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  note: {
    fontSize: 13,
    color: '#999',
    marginTop: -4,
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: '#e1f0ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillText: {
    color: '#007AFF',
    fontSize: 14,
  },
  skillRemove: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
