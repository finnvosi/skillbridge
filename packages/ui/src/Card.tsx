import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing, typography } from './theme';

interface CardProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: any;
}

export function Card({ children, padded = true, style }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded ? { padding: spacing.lg } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
}

export function Badge({ label, color = colors.primary, backgroundColor = colors.primaryLight }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    ...shadow.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold as any,
    textTransform: 'capitalize',
  },
});

export default Card;
