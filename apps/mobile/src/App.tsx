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
import { colors, typography } from './theme';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function AuthenticatedTabs() {
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '🏠  Home' }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ title: '💼  Projects' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '👤  Profile' }} />
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

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={AuthenticatedTabs} />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ headerShown: true, title: 'Project' }}
            />
          </>
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
