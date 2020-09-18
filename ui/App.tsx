import { StatusBar } from 'expo-status-bar';
import React from 'react';
// import { ColorSchemeName, useColorScheme, Appearance } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources  from './hooks/useCachedResources'
import useColorScheme from "./hooks/useColorScheme"
// import { Ionicons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Navigation from './navigation';
console.disableYellowBox = true;

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
