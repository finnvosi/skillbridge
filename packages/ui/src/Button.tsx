import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing, typography } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

const SIZE_STYLES: Record<Size, { paddingV: number; fontSize: number }> = {
  sm: { paddingV: spacing.sm, fontSize: typography.size.sm },
  md: { paddingV: spacing.md, fontSize: typography.size.base },
  lg: { paddingV: spacing.lg, fontSize: typography.size.md },
};

const VARIANT_BG: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.surface,
  ghost: 'transparent',
  danger: colors.danger,
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: colors.textPrimary,
  ghost: colors.primary,
  danger: '#FFFFFF',
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  style,
}: ButtonProps) {
  const s = SIZE_STYLES[size];
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }: { pressed: boolean }) => [
        {
          backgroundColor: VARIANT_BG[variant],
          borderRadius: radius.md,
          paddingVertical: s.paddingV,
          paddingHorizontal: spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={VARIANT_TEXT[variant]} />
      ) : (
        <Text
          style={{
            color: VARIANT_TEXT[variant],
            fontSize: s.fontSize,
            fontWeight: typography.weight.semibold as any,
          }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({});
export default Button;
