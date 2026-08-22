// Notification center (blueprint §9: notifications open from a single top-level
// bell and deep-link to the relevant job/application). Reads the worker's own
// notifications from the identity-derived API; empty state when off/offline.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../theme';
import { useT } from '../hooks/useT';
import { useAuthStore } from '../store/auth';
import { BackBar } from '../components/BackBar';
import { AppText, Card, EmptyState } from '../components/ui';
import { Icon, IconName } from '../components/Icon';
import { fetchNotifications, markNotificationRead, AppNotification } from '../services/workerApi';
import { USE_REMOTE_API } from '../config';

function typeIcon(type: string): IconName {
  switch (type) {
    case 'application_status_changed':
      return 'briefcase';
    case 'certificate_verified':
      return 'checkCircle';
    case 'certificate_rejected':
      return 'alert';
    default:
      return 'bell';
  }
}

export default function NotificationCenterScreen({ onBack }: { onBack: () => void }) {
  const { t, formatDate } = useT();
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<AppNotification[]>([]);
  // Initial loading state mirrors the remote flag so the offline path needs no
  // synchronous setState inside the effect (react-hooks/set-state-in-effect).
  const [loading, setLoading] = useState(USE_REMOTE_API);

  const load = useCallback(async () => {
    if (!USE_REMOTE_API) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchNotifications(token);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch — setState only happens in async continuations, never
  // synchronously within the effect body.
  useEffect(() => {
    if (!USE_REMOTE_API) return;
    let alive = true;
    fetchNotifications(token)
      .then((data) => {
        if (alive) setItems(data);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const onRefresh = () => {
    setLoading(true);
    void load();
  };

  const handleOpen = async (item: AppNotification) => {
    if (!item.readAt) {
      // Optimistic read state; fire-and-forget server call.
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      try {
        await markNotificationRead(item.id, token);
      } catch {
        // non-fatal
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackBar title={t('notifications.title')} onBack={onBack} />
      {items.length === 0 && !loading ? (
        <EmptyState icon="bell" title={t('notifications.empty')} subtitle={t('notifications.emptySub')} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        >
          {items.map((item) => (
            <Pressable key={item.id} onPress={() => handleOpen(item)} accessibilityRole="button">
              <Card style={item.readAt ? styles.row : styles.rowUnread}>
                <View style={styles.rowIcon}>
                  <Icon name={typeIcon(item.type)} size={18} color={colors.primary} />
                </View>
                <View style={styles.rowBody}>
                  <AppText style={styles.rowTitle}>{item.title}</AppText>
                  <AppText style={styles.rowText}>{item.body}</AppText>
                  <AppText style={styles.rowDate}>{formatDate(item.createdAt)}</AppText>
                </View>
                {!item.readAt ? <View style={styles.dot} /> : null}
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg },
  rowUnread: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: spacing.xs },
  rowTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.ink,
  },
  rowText: {
    fontSize: typography.size.sm,
    color: colors.muted,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  rowDate: { fontSize: typography.size.xs, color: colors.mutedLight, marginTop: spacing.xs },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: spacing.sm,
  },
});
