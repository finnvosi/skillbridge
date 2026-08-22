// Reusable top bar with a back control for stack screens.
// Matches the solid steel-navy Header for a consistent brand anchor.
// Back is always text + icon (never icon-only) for clear semantics.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, TAP_MIN } from '../theme';
import { Icon } from './Icon';
import { useT } from '../hooks/useT';

import { AppText } from './ui';
export function BackBar({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
      >
        <Icon name="arrowLeft" size={22} color={colors.white} />
        <AppText style={styles.backText}>{t('common.back')}</AppText>
      </Pressable>
      {title ? <AppText style={styles.title} numberOfLines={1}>{title}</AppText> : <View style={{ flex: 1 }} />}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: TAP_MIN,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backPressed: { opacity: 0.7 },
  backText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold as any,
    color: colors.white,
  },
  title: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.white,
  },
  right: { flexDirection: 'row', alignItems: 'center' },
});
