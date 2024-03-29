import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources  from './hooks/useCachedResources'
import useColorScheme from "./hooks/useColorScheme"
import Navigation from './navigation';
import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {useState} from 'react'

console.disableYellowBox = true;

// define REM depending on screen width
export const { width, height } = Dimensions.get('window');
const rem = width / 414;
declare var logged_in: boolean
logged_in = false

// calc styles
EStyleSheet.build({
  $rem: rem,
});


export default function App() {
  const isLoadingComplete = useCachedResources();
  // const colorScheme = useColorScheme();
  const colorScheme = "light"


  // const [token, setToken] = useState('')

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
