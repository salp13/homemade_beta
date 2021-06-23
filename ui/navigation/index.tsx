import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';
import NotFoundScreen from '../screens/NotFoundScreen';
import { LoginParamList, RootStackParamList, RootStackParams } from '../types';
import BottomTabNavigator from './BottomTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}


// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const StackLogin = createStackNavigator<LoginParamList>();

const Stack = createStackNavigator<RootStackParamList | RootStackParams>();

const Auth = () => {
  // Stack Navigator for Login and Sign up Screen
  return (
    <StackLogin.Navigator initialRouteName="LoginScreen">
      <StackLogin.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <StackLogin.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{
          title: 'Signup', //Set Header Title
          headerStyle: {
            backgroundColor: '#307ecc', //Set Header color
          },
          headerTintColor: '#fff', //Set Header text color
          headerTitleStyle: {
            fontWeight: 'bold', //Set Header text style
          },
        }}
      />
    </StackLogin.Navigator>
  );
};

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={Auth} options={{animationEnabled: false}}/>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{animationEnabled: false}}/>
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!', animationEnabled: false }} />
    </Stack.Navigator>
  );
}


