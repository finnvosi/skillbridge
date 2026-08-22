// Shared top header for worker screens: brand + language toggle + optional bell.
// Solid steel-navy bar gives the product a confident, consistent anchor.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../hooks/useT';
import { Icon } from './Icon';

import { AppText } from './ui';
interface HeaderProps {
  showBell?: boolean;
  onBell?: () => void;
  right?: React.ReactNode;
}

export function Header({ showBell, onBell, right }: HeaderProps) {
  const { t, locale } = useT();
  const setLocale = useAppStore((s) => s.setLocale);
  const isKm = locale === 'km';

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="shieldCheck" size={18} color={colors.white} />
          </View>
          <AppText style={styles.brandText}>{t('app.name')}</AppText>
        </View>

        <View style={styles.right}>
          {right}
          <Pressable
            accessibilityRole="button"
            onPress={() => setLocale(isKm ? 'en' : 'km')}
            style={styles.langBtn}
          >
            <Icon name="language" size={16} color={colors.white} />
            <AppText style={styles.langText}>{isKm ? t('common.en') : t('common.km')}</AppText>
          </Pressable>
          {showBell ? (
            <Pressable accessibilityRole="button" onPress={onBell} style={styles.bell}>
              <Icon name="bell" size={20} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.white,
    letterSpacing: 0.2,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    minHeight: 36,
  },
  langText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.white,
  },
  bell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
