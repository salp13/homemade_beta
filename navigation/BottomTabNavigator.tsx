import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FridgeScreen from '../screens/FridgeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeResultScreen from '../screens/HomeResultScreen';
import AddFridgeItemScreen from '../screens/AddFridgeItemScreen';
import { 
  BottomTabParamList, 
  HomeParamList, 
  SearchParamList, 
  FridgeParamList, 
  ShoppingListParamList, 
  ProfileParamList, 
  HomeResultParamList, 
  AddFridgeItemParamList} from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Fridge"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint, showLabel: false }}>
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Fridge"
        component={FridgeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="fridge-outline" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ShoppingList"
        component={ShoppingListNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="format-list-bulleted" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  if (props.name === "fridge-outline") {
    return <MaterialCommunityIcons size={30} style={{ marginBottom: -3 }} {...props} />;
  }
  return <MaterialIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

const HomeStack = createStackNavigator<HomeParamList>();
const SearchStack = createStackNavigator<SearchParamList>();
const FridgeStack = createStackNavigator<FridgeParamList>();
const ShoppingListStack = createStackNavigator<ShoppingListParamList>();
const ProfileStack = createStackNavigator<ProfileParamList>();
const HomeResultStack = createStackNavigator<HomeResultParamList>();
const AddFridgeItemStack = createStackNavigator<AddFridgeItemParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
      <HomeResultStack.Screen
        name="HomeResultScreen"
        component={HomeResultScreen}
        initialParams={{ specifiedItems: ['avocado'] }}
      />
    </HomeStack.Navigator>
  );
}

function SearchNavigator() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <SearchStack.Screen
        name="SearchScreen"
        component={SearchScreen}
      />
    </SearchStack.Navigator>
  );
}

function FridgeNavigator() {
  return (
    <FridgeStack.Navigator>
      <FridgeStack.Screen
        name="FridgeScreen"
        component={FridgeScreen}
        options={{ headerTitle: 'your fridge' }}
      />
      <AddFridgeItemStack.Screen
        name="AddFridgeItemScreen"
        component={AddFridgeItemScreen}
        options={{headerShown: false}}
      />
    </FridgeStack.Navigator>
  );
}

function ShoppingListNavigator() {
  return (
    <ShoppingListStack.Navigator>
      <ShoppingListStack.Screen
        name="ShoppingListScreen"
        component={ShoppingListScreen}
        options={{ headerTitle: 'shopping list' }}
      />
    </ShoppingListStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerTitle: 'you' }}
      />
    </ProfileStack.Navigator>
  );
}

function HomeResultNavigator() {
  return (
    <HomeResultStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <HomeResultStack.Screen
        name="HomeResultScreen"
        component={HomeResultScreen}
      />
    </HomeResultStack.Navigator>
  );
}

function AddFridgeItemNavigator() {
  return (
    <AddFridgeItemStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <AddFridgeItemStack.Screen
        name="AddFridgeItemScreen"
        component={AddFridgeItemScreen}
      />
      <FridgeStack.Screen
        name="FridgeScreen"
        component={FridgeScreen}
      />
    </AddFridgeItemStack.Navigator>
  );
}