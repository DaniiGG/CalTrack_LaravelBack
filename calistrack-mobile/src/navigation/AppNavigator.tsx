import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TabsNavigator from './TabsNavigator';
import { auth } from '../../firebase';
import { SafeAreaProvider } from "react-native-safe-area-context";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  if (authenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authenticated ? (
        <Stack.Screen name="App" component={TabsNavigator} />
      ) : (
        <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
    </SafeAreaProvider>
  );
}
