// navigation/RootNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import UserDataScreen from '../screens/UserDataScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import BrainDumpScreen from '../screens/BrainDumpScreen';
import VaultScreen from '../screens/VaultScreen';
import SearchScreen from '../screens/SearchScreen';
import GlimpseScreen from '../screens/GlimpseScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="UserData" component={UserDataScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BrainDump" component={BrainDumpScreen} />
        <Stack.Screen name="Vault" component={VaultScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Glimpse" component={GlimpseScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
