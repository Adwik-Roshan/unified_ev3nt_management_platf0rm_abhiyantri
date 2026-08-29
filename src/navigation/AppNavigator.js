import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ParticipantDashboard from '../screens/Participant/ParticipantDashboard';
import JudgeDashboard from '../screens/Judge/JudgeDashboard';
import OrganizerDashboard from '../screens/Organizer/OrganizerDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {user.role === 'participant' && (
              <Stack.Screen name="ParticipantDashboard" component={ParticipantDashboard} />
            )}
            {user.role === 'judge' && (
              <Stack.Screen name="JudgeDashboard" component={JudgeDashboard} />
            )}
            {user.role === 'organizer' && (
              <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboard} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
