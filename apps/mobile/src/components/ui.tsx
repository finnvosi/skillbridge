// Coherent worker UI primitives — industrial-premium, cross-platform.
// Borders before shadows. 48dp min targets. Text + icon for essential actions.
// Never color-only status (icon + label always).
import React from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextProps,
  StyleProp,
} from 'react-native';
import { colors, typography, spacing, radius, shadow, TAP_MIN } from '../theme';
import { Icon, IconName } from './Icon';
import { useT } from '../hooks/useT';

/* ----------------------------- AppText ----------------------------- */

export type AppTextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'display';

interface AppTextProps extends TextProps {
  weight?: AppTextWeight;
  style?: StyleProp<TextStyle>;
}

// All visible text goes through AppText so the Khmer-first font (Noto Sans
// Khmer) or English Urbanist is applied per active locale. 'display' is accepted
// for API compatibility but resolves to the same family (Urbanist has no
// separate display face; Khmer uses Noto bold). Plain <Text> would fall back to
// the platform system font and defeat the typography system.
export function AppText({ weight = 'regular', style, ...rest }: AppTextProps) {
  const { locale } = useT();
  const family = typography.fontFamilyFor(locale, weight === 'display' ? 'bold' : weight);
  return <Text style={[{ fontFamily: family }, style]} {...rest} />;
}

/* ----------------------------- Button ----------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  fullWidth,
  style,
}: ButtonProps) {
  // Disabled buttons swap to a pale tinted background, so the foreground must
  // swap too — keeping the enabled white fg gave white-on-#F7E3E0 (danger) and
  // white-on-#E7ECF1 (primary), which was effectively invisible.
  const palette = {
    primary: { bg: colors.primary, fg: colors.white, disabledBg: colors.primarySoft, disabledFg: colors.muted },
    secondary: { bg: colors.surface, fg: colors.ink, disabledBg: colors.surfaceMuted, disabledFg: colors.mutedLight },
    ghost: { bg: 'transparent', fg: colors.primary, disabledBg: 'transparent', disabledFg: colors.mutedLight },
    danger: { bg: colors.danger, fg: colors.white, disabledBg: colors.dangerSoft, disabledFg: colors.muted },
  }[variant];
  const fg = disabled ? palette.disabledFg : palette.fg;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? palette.disabledBg : palette.bg,
          borderRadius: radius.sm,
          minHeight: TAP_MIN,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          // Disabled state is already carried by the tinted bg + muted fg above;
          // an extra 0.6 opacity on top pushed contrast below legibility.
          opacity: disabled ? 1 : pressed ? 0.88 : 1,
          width: fullWidth ? '100%' : undefined,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={20} color={fg} /> : null}
          <AppText
            style={{
              color: fg,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold as any,
            }}
          >
            {children}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

/* ------------------------------ Card ------------------------------ */

interface CardProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
  border?: boolean;
  elevated?: boolean;
}

export function Card({ children, padded = true, style, border = true, elevated = false }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: border ? 1 : 0,
          borderColor: colors.border,
          ...(elevated ? shadow.lg : border ? shadow.sm : shadow.md),
        },
        padded ? { padding: spacing.lg } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ----------------------- Verification badge ----------------------- */

interface VerifyBadgeProps {
  level: 'job_checked' | 'company_checked' | 'identity_checked';
  label: string;
}

export function VerifyBadge({ level, label }: VerifyBadgeProps) {
  const fg = colors.success;
  const bg = colors.successSoft;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg, borderWidth: 1, borderColor: colors.success },
      ]}
    >
      <Icon name="checkCircle" size={16} color={fg} />
      <AppText style={[styles.pillText, { color: colors.ink, fontWeight: typography.weight.semibold as any }]}>
        {label}
      </AppText>
    </View>
  );
}

/* ------------------------ Status pill (pair) ---------------------- */
// Always icon + text — never color alone.

type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<StatusTone, { bg: string; fg: string; border: string }> = {
  success: { bg: colors.successSoft, fg: colors.success, border: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warningInk, border: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.danger },
  info: { bg: colors.primarySoft, fg: colors.primary, border: colors.primary },
  neutral: { bg: colors.demoSoft, fg: colors.muted, border: colors.border },
};

export function StatusPill({
  icon,
  label,
  tone = 'neutral',
}: {
  icon: IconName;
  label: string;
  tone?: StatusTone;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }]}>
      <Icon name={icon} size={15} color={t.fg} />
      <AppText style={[styles.pillText, { color: t.fg, fontWeight: typography.weight.semibold as any }]}>
        {label}
      </AppText>
    </View>
  );
}

/* --------------------------- Demo tag ----------------------------- */

export function DemoTag({ onDark = false }: { onDark?: boolean }) {
  const { t } = useT();
  return (
    <View
      style={[
        styles.pill,
        onDark
          ? { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }
          : { backgroundColor: colors.demoSoft, borderWidth: 1, borderColor: colors.border },
      ]}
    >
      <Icon name="info" size={14} color={onDark ? colors.white : colors.muted} />
      <AppText style={[styles.pillText, { color: onDark ? colors.white : colors.muted, fontWeight: typography.weight.medium as any }]}>
        {t('common.demo')}
      </AppText>
    </View>
  );
}

/* --------------------------- Skeleton ----------------------------- */

export function Skeleton({ height = 16, width = '100%', radius: r = radius.sm, style }: {
  height?: number;
  width?: number | '100%';
  radius?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          height,
          width,
          borderRadius: r,
          backgroundColor: colors.demoSoft,
        },
        style,
      ]}
    />
  );
}

/* ------------------------- State helpers -------------------------- */

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.stateCenter}>
      <View style={styles.stateIconWrap}>
        <Icon name={icon} size={28} color={colors.muted} />
      </View>
      <AppText style={styles.stateTitle}>{title}</AppText>
      {subtitle ? <AppText style={styles.stateSub}>{subtitle}</AppText> : null}
      {action ? <View style={{ marginTop: spacing.lg, width: '100%' }}>{action}</View> : null}
    </View>
  );
}

export function ErrorState({
  title,
  onRetry,
  retryLabel,
}: {
  title: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View style={styles.stateCenter}>
      <View style={[styles.stateIconWrap, { backgroundColor: colors.dangerSoft }]}>
        <Icon name="alert" size={28} color={colors.danger} />
      </View>
      <AppText style={styles.stateTitle}>{title}</AppText>
      {onRetry ? (
        <View style={{ marginTop: spacing.lg, minWidth: 180 }}>
          <Button variant="secondary" icon="arrowRight" onPress={onRetry}>
            {retryLabel ?? 'Retry'}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <AppText style={styles.stateSub}>{label}</AppText> : null}
    </View>
  );
}

/* --------------------------- Section ------------------------------ */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <AppText style={styles.sectionLabel}>{children}</AppText>;
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

/* --------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: typography.size.xs,
    includeFontPadding: false,
  },
  stateCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  stateIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.demoSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stateTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.ink,
    textAlign: 'center',
  },
  stateSub: {
    fontSize: typography.size.base,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.size.base * typography.lineHeight.normal,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
});

export default Card;
