import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Card, Badge } from '@skillbridge/ui';
import { apiRequest, ApiError } from '../services/api';
import { API_ENDPOINTS } from '../config';
import { useAuthStore } from '../store/auth';
import { colors, spacing, typography, radius } from '../theme';

// For a production app, use expo-document-picker or expo-image-picker
// For now, we'll use a simple approach that works with the base64 API
type Certificate = {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  verified: boolean;
  createdAt: string;
};

export default function CertificateSection() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [fileBase64, setFileBase64] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [mimeType, setMimeType] = React.useState('application/pdf');

  React.useEffect(() => {
    if (user?.role === 'student') {
      loadCertificates();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCertificates = React.useCallback(async () => {
    try {
      const data = await apiRequest<{ certificates: Certificate[] }>(
        API_ENDPOINTS.certificates.list,
        { method: 'GET', token }
      );
      setCertificates(data.certificates);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleUpload = async () => {
    if (!title.trim() || !fileBase64) {
      Alert.alert('Error', 'Please provide a title and select a file');
      return;
    }

    setUploading(true);
    try {
      await apiRequest(API_ENDPOINTS.certificates.upload, {
        method: 'POST',
        token,
        body: {
          title,
          description: description || undefined,
          file: {
            base64: fileBase64,
            mimeType,
            originalName: fileName,
          },
        },
      });
      Alert.alert('Success', 'Certificate uploaded!');
      setTitle('');
      setDescription('');
      setFileBase64('');
      setFileName('');
      loadCertificates();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Remove this certificate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(API_ENDPOINTS.certificates.delete(id), {
              method: 'DELETE',
              token,
            });
            setCertificates((prev) => prev.filter((c) => c.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  if (user?.role !== 'student') return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <Card style={styles.container}>
      <AppText style={styles.sectionTitle}>Certificates</AppText>

      {/* Upload Form */}
      <View style={styles.form}>
        <AppText style={styles.label}>Title</AppText>
        <TextInput
          style={styles.input}
          placeholder="e.g. AWS Certified Developer"
          value={title}
          onChangeText={setTitle}
        />

        <AppText style={styles.label}>Description (optional)</AppText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What is this certification for?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Placeholder for file picker — replace with expo-document-picker in production */}
        <View style={styles.filePlaceholder}>
          <AppText style={styles.filePlaceholderText}>
            {fileName || 'Tap to select a file (PDF, image, etc.)'}
          </AppText>
          <AppText style={styles.fileHint}>
            Max 10MB. File will be base64-encoded before upload.
          </AppText>
          <TouchableOpacity
            style={styles.filePickerBtn}
            onPress={() => Alert.alert(
              'File Picker',
              'Install expo-document-picker for production file selection',
              [{ text: 'OK' }]
            )}
          >
            <AppText style={styles.filePickerText}>Select File</AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.uploadBtn, (!title || !fileBase64) && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading || !title || !fileBase64}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <AppText style={styles.uploadBtnText}>Upload Certificate</AppText>
          )}
        </TouchableOpacity>
      </View>

      {/* Certificates List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.list}>
          {certificates.map((cert) => (
            <View key={cert.id} style={styles.certItem}>
              <View style={styles.certInfo}>
                <AppText style={styles.certIcon}>{getTypeIcon(cert.mimeType)}</AppText>
                <View style={styles.certDetails}>
                  <AppText style={styles.certTitle}>{cert.title}</AppText>
                  {cert.description ? (
                    <AppText style={styles.certDesc}>{cert.description}</AppText>
                  ) : null}
                  <AppText style={styles.certMeta}>
                    {formatFileSize(cert.fileSize)} · {new Date(cert.createdAt).toLocaleDateString()}
                  </AppText>
                </View>
                {cert.verified && <Badge label="Verified" color={colors.success} backgroundColor="#E4F7E4" />}
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(cert.id)}
              >
                <AppText style={styles.deleteText}>✕</AppText>
              </TouchableOpacity>
            </View>
          ))}
          {certificates.length === 0 && !loading && (
            <AppText style={styles.empty}>No certificates uploaded yet.</AppText>
          )}
        </View>
      )}
    </Card>
  );
}

// Inline TextInput for React Native (avoids import issues)
const { TextInput } = require('react-native');

import { AppText } from './ui';
const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.textPrimary,
  },
  form: { gap: spacing.sm },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  filePlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.separator,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  filePlaceholderText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fileHint: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
  },
  filePickerBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  filePickerText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  uploadBtn: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  uploadBtnDisabled: {
    backgroundColor: colors.separator,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold as any,
  },
  loader: { marginVertical: spacing.xl },
  list: { gap: spacing.sm },
  certItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  certInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  certIcon: { fontSize: 24 },
  certDetails: { flex: 1, gap: 2 },
  certTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold as any,
    color: colors.textPrimary,
  },
  certDesc: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  certMeta: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  deleteText: {
    fontSize: 18,
    color: colors.danger,
  },
  empty: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: typography.size.base,
    paddingVertical: spacing.xl,
  },
});
