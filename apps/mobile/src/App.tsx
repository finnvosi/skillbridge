import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './store/auth';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HomeScreen from './screens/home/HomeScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import ProjectsScreen from './screens/projects/ProjectsScreen';
import ProjectDetailScreen from './screens/projects/ProjectDetailScreen';
import EmployerDashboardScreen from './screens/employer/DashboardScreen';
import TalentSearchScreen from './screens/employer/TalentSearchScreen';
import TeamScreen from './screens/employer/TeamScreen';
import { colors, typography } from './theme';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: string };
  EmployerDashboard: undefined;
  TalentSearch: undefined;
  TeamManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: typography.weight.semibold as any, color: colors.textPrimary },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: typography.weight.medium as any },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '🏠 Home' }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ title: '💼 Projects' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '👤 Profile' }} />
    </Tab.Navigator>
  );
}

function EmployerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: typography.weight.semibold as any, color: colors.textPrimary },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.employer,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: typography.weight.medium as any },
      }}
    >
      <Tab.Screen
        name="EmployerDashboard"
        component={EmployerDashboardScreen}
        options={{ title: '🏠 Dashboard' }}
      />
      <Tab.Screen
        name="TalentSearch"
        component={TalentSearchScreen}
        options={{ title: '🔍 Talent' }}
      />
      <Tab.Screen
        name="TeamManagement"
        component={TeamScreen}
        options={{ title: '👥 Team' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '👤 Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { initialized, user } = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!isReady || !initialized) return null;

  const isEmployer = user?.role === 'employer' || user?.role === 'admin' || user?.role === 'factory';

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          isEmployer ? (
            <>
              <Stack.Screen name="EmployerDashboard" component={EmployerTabs} />
              <Stack.Screen
                name="ProjectDetail"
                component={ProjectDetailScreen}
                options={{ headerShown: true, title: 'Project' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={StudentTabs} />
              <Stack.Screen
                name="ProjectDetail"
                component={ProjectDetailScreen}
                options={{ headerShown: true, title: 'Project' }}
              />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
