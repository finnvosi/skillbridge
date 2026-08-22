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
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { colors, typography, spacing, TAP_MIN, shadow } from './theme';
import { useWorkerFonts } from './theme_fonts';
import { useAppStore } from './store/useAppStore';
import { useT } from './hooks/useT';
import { Icon, IconName } from './components/Icon';

import { RootStackParamList, MainTabParamList } from './navigation';
import WelcomeScreen from './screens/WelcomeScreen';
import JobsScreen from './screens/JobsScreen';
import ApplicationsScreen from './screens/ApplicationsScreen';
import PassportScreen from './screens/PassportScreen';
import HelpScreen from './screens/HelpScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import ApplyReviewScreen from './screens/ApplyReviewScreen';
import ReportScreen from './screens/ReportScreen';
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

function MainTabs({ navigation, route }: any) {
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: typography.weight.medium as any, marginTop: 2 },
        tabBarButton: (props: any) => (
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
        component={PassportScreen}
      />

      <Tab.Screen
        name="Help"
        options={{ title: t('tab.help'), tabBarIcon: ({ focused }) => <TabBarIcon name="flag" focused={focused} /> }}
      >
        {() => <HelpScreen onReport={(cat) => navigation.navigate('Report', { category: cat })} />}
      </Tab.Screen>
    </Tab.Navigator>
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

export default function App() {
  const fontsReady = useWorkerFonts();
  const hasChosenLanguage = useAppStore((s) => s.hasChosenLanguage);

  if (!fontsReady) {
    // Avoid a flash of system fonts / layout shift before Khmer + Inter load.
    return (
      <View style={styles.boot}>
        <Icon name="shieldCheck" size={40} color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasChosenLanguage ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="JobDetail">
              {({ navigation, route }) => (
                <JobLoader jobId={route.params.jobId}>
                  {(job) => (
                    <JobDetailScreen
                      job={job}
                      onBack={() => navigation.goBack()}
                      onApply={() => navigation.navigate('ApplyReview', { jobId: job.id })}
                      onReport={() => navigation.navigate('Report')}
                    />
                  )}
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
});
