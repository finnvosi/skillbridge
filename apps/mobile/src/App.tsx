// SkillBridge Worker prototype — entry point for the worker vertical slice.
//
// Replaces the old student/employer App. Worker-only flow:
//   Welcome (language gate) -> four tabs (Jobs, Applications, Passport, Help)
//   with stack routes for JobDetail, ApplyReview, and Report.
//
// No email login, no student/project/employer screens, no backend dependency
// in the reachable prototype. The legacy student/employer screens remain on
// disk (untouched) but are not referenced here and are excluded from tsconfig.
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

import { colors, typography, spacing, TAP_MIN, shadow, radius } from './theme';
import { useWorkerFonts } from './theme_fonts';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/auth';
import { useT } from './hooks/useT';
import { Icon, IconName } from './components/Icon';

import { RootStackParamList, MainTabParamList } from './navigation';
import WelcomeScreen from './screens/WelcomeScreen';
import ConsentScreen from './screens/ConsentScreen';
import OnboardingPreferencesScreen from './screens/OnboardingPreferencesScreen';
import PhoneSignInScreen from './screens/auth/PhoneSignInScreen';
import OtpVerifyScreen from './screens/auth/OtpVerifyScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import JobsScreen from './screens/JobsScreen';
import ApplicationsScreen from './screens/ApplicationsScreen';
import PassportScreen from './screens/PassportScreen';
import HelpScreen from './screens/HelpScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import ApplyReviewScreen from './screens/ApplyReviewScreen';
import ReportScreen from './screens/ReportScreen';
import NotificationCenterScreen from './screens/NotificationCenterScreen';
import SafetyCenterScreen from './screens/SafetyCenterScreen';
import AddWorkRecordScreen from './screens/AddWorkRecordScreen';
import ProfileEditScreen from './screens/ProfileEditScreen';
import { blockJob } from './services/workerApi';
import { DEMO_JOBS } from './data/fixtures';
import { DemoApplication, DemoJob } from './types';
import { fetchJob } from './services/workerApi';
import { USE_REMOTE_API } from './config';

import { AppText } from './components/ui';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBarIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <Icon name={name} size={22} color={focused ? colors.primary : colors.muted} />;
}

function MainTabs({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Main'>) {
  const { t } = useT();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: spacing.md,
          paddingTop: spacing.sm,
          height: 82,
          ...shadow.lg,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: typography.weight.medium, marginTop: 2 },
        tabBarButton: (props: BottomTabBarButtonProps) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: props.accessibilityState?.selected }}
            onPress={props.onPress}
            style={({ pressed }) => [props.style, pressed && { opacity: 0.7 }]}
          >
            {props.children}
          </Pressable>
        ),
      }}
    >
      <Tab.Screen
        name="Jobs"
        options={{ title: t('tab.jobs'), tabBarIcon: ({ focused }) => <TabBarIcon name="briefcase" focused={focused} /> }}
      >
        {() => (
          <JobsScreen
            onOpenJob={(job: DemoJob) =>
              navigation.navigate('JobDetail', { jobId: job.id })
            }
            onOpenNotifications={() => navigation.navigate('NotificationCenter')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Applications"
        options={{ title: t('tab.applications'), tabBarIcon: ({ focused }) => <TabBarIcon name="doc" focused={focused} /> }}
      >
        {() => (
          <ApplicationsScreen
            onOpenJob={(jobId: string) => navigation.navigate('JobDetail', { jobId })}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Passport"
        options={{ title: t('tab.passport'), tabBarIcon: ({ focused }) => <TabBarIcon name="shieldCheck" focused={focused} /> }}
      >
        {({ navigation }) => (
          <PassportScreen
            onEditPassport={() =>
              navigation.navigate('ProfileEdit', {
                passport: useAppStore.getState().passport,
              })
            }
            onAddWorkRecord={() => navigation.navigate('AddWorkRecord')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Help"
        options={{ title: t('tab.help'), tabBarIcon: ({ focused }) => <TabBarIcon name="flag" focused={focused} /> }}
      >
        {() => (
          <HelpScreen
            onReport={(cat) => navigation.navigate('Report', { category: cat })}
            onSafetyCenter={() => navigation.navigate('SafetyCenter')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Job detail with a working "block this job" action (blueprint: report + block).
function JobDetailWithBlock({
  job,
  navigation,
}: {
  job: DemoJob;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  const { t } = useT();
  const token = useAuthStore((s) => s.token);

  const handleBlock = () => {
    Alert.alert(t('job.blockJob'), t('job.blockConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('job.blockJob'),
        style: 'destructive',
        onPress: async () => {
          try {
            await blockJob(job.id, token);
            Alert.alert(t('job.blocked'), t('job.blockedSub'));
            navigation.goBack();
          } catch (error) {
            Alert.alert(t('common.error'), t('onboarding.saveError'));
          }
        },
      },
    ]);
  };

  return (
    <JobDetailScreen
      job={job}
      onBack={() => navigation.goBack()}
      onApply={() => navigation.navigate('ApplyReview', { jobId: job.id })}
      onReport={() => navigation.navigate('Report', {})}
      onBlock={handleBlock}
    />
  );
}

function JobLoader({
  jobId,
  children,
}: {
  jobId: string;
  children: (job: DemoJob) => React.ReactNode;
}) {
  const [job, setJob] = useState<DemoJob | undefined>(() =>
    DEMO_JOBS.find((j) => j.id === jobId),
  );
  const [loading, setLoading] = useState(USE_REMOTE_API);

  useEffect(() => {
    if (!USE_REMOTE_API) return;
    let alive = true;
    setLoading(true);
    fetchJob(jobId)
      .then((data) => {
        if (alive && data) setJob(data);
      })
      .catch(() => {
        // keep fixture fallback
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [jobId]);

  if (loading && !job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <AppText style={{ color: colors.muted }}>Job not found</AppText>
      </View>
    );
  }
  return <>{children(job)}</>;
}

/**
 * Shown when a persisted session exists but the account is not a worker
 * (this is the worker-only app). SEC-1 enforces worker identity server-side,
 * so a student/employer token must never reach the worker tabs. We ask the
 * user to sign out and log in with a worker account.
 */
function WrongAccountScreen({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useT();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.wrongContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.heroIcon}>
          <Icon name="shieldCheck" size={40} color={colors.primary} />
        </View>
        <AppText weight="display" style={styles.title}>{t('auth.wrongAccountTitle')}</AppText>
        <AppText style={styles.subtitle}>{t('auth.wrongAccountBody')}</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={onSignOut}
          style={({ pressed }) => [styles.wrongCta, pressed && styles.wrongCtaPressed]}
        >
          <Icon name="arrowRight" size={20} color={colors.white} />
          <AppText style={styles.wrongCtaText}>{t('auth.signOut')}</AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const fontsReady = useWorkerFonts();
  const hasChosenLanguage = useAppStore((s) => s.hasChosenLanguage);
  const hasConsented = useAppStore((s) => s.hasConsented);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const [booting, setBooting] = useState(true);

  // Resolve the persisted session into a full user (incl. role) so the gate
  // can enforce worker-only access. SEC-1 requires a worker identity.
  useEffect(() => {
    let alive = true;
    if (token && !user) {
      fetchMe().finally(() => alive && setBooting(false));
    } else {
      setBooting(false);
    }
    return () => {
      alive = false;
    };
  }, [token, user, fetchMe]);

  if (!fontsReady || booting) {
    // Avoid a flash of system fonts / layout shift before Khmer + Inter load.
    return (
      <View style={styles.boot}>
        <Icon name="shieldCheck" size={40} color={colors.primary} />
      </View>
    );
  }

  // A logged-in non-worker token must never reach the worker tabs.
  const isWorker = !!token && user?.role === 'worker';

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasChosenLanguage ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : !hasConsented ? (
          /* Safety promise + consent gate (blueprint flow order). */
          <Stack.Screen name="Consent" component={ConsentScreen} />
        ) : isWorker && !user?.onboardingCompleted ? (
          /* Worker preferences onboarding (blueprint §7 must-ship). */
          <Stack.Screen name="Onboarding" component={OnboardingPreferencesScreen} />
        ) : isWorker ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="JobDetail">
              {({ navigation, route }) => (
                <JobLoader jobId={route.params.jobId}>
                  {(job) => <JobDetailWithBlock job={job} navigation={navigation} />}
                </JobLoader>
              )}
            </Stack.Screen>
            <Stack.Screen name="ApplyReview">
              {({ navigation, route }) => (
                <JobLoader jobId={route.params.jobId}>
                  {(job) => (
                    <ApplyReviewScreen
                      job={job}
                      onBack={() => navigation.goBack()}
                      onSubmitted={() => navigation.navigate('Main', { screen: 'Applications' })}
                    />
                  )}
                </JobLoader>
              )}
            </Stack.Screen>
            <Stack.Screen name="Report">
              {({ navigation, route }) => (
                <ReportScreen
                  initialCategory={route.params?.category}
                  onBack={() => navigation.goBack()}
                  onDone={() => navigation.navigate('Main', { screen: 'Help' })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ProfileEdit">
              {({ navigation }) => (
                <ProfileEditScreen
                  passport={useAppStore.getState().passport}
                  onSaved={(next) => {
                    useAppStore.getState().setPassport(next);
                    navigation.goBack();
                  }}
                  onCancel={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NotificationCenter">
              {({ navigation }) => (
                <NotificationCenterScreen onBack={() => navigation.goBack()} />
              )}
            </Stack.Screen>
            <Stack.Screen name="SafetyCenter">
              {({ navigation }) => (
                <SafetyCenterScreen onBack={() => navigation.goBack()} />
              )}
            </Stack.Screen>
            <Stack.Screen name="AddWorkRecord">
              {({ navigation }) => (
                <AddWorkRecordScreen
                  onBack={() => navigation.goBack()}
                  onSaved={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        ) : token && user && user.role !== 'worker' ? (
          <Stack.Screen name="WrongAccount">
            {() => <WrongAccountScreen onSignOut={() => logout()} />}
          </Stack.Screen>
        ) : (
          <>
            {/* Phone OTP is the default worker sign-in (blueprint §12);
                email/password stays reachable as the secondary path. */}
            <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  fallbackText: { fontSize: typography.size.base, color: colors.muted },
  safe: { flex: 1, backgroundColor: colors.background },
  wrongContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.muted,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginBottom: spacing.sm,
  },
  wrongCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 52,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  wrongCtaPressed: { opacity: 0.9 },
  wrongCtaText: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
