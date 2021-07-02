import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import * as React from 'react';
import { TouchableWithoutFeedback } from 'react-native'
import { SimpleLineIcons } from '@expo/vector-icons'; 
import { View } from '../components/Themed';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FridgeScreen from '../screens/FridgeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeResultScreen from '../screens/HomeResultScreen';
import AddFridgeItemScreen from '../screens/AddFridgeItemScreen';
import AddShoppingListItemScreen from '../screens/AddShoppingListItemScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AccountScreen from '../screens/AccountScreen'
import AboutScreen from '../screens/AboutScreen'
import IndividualRecipeScreen from '../screens/IndividualRecipeScreen'
import CreateRecipeScreen from '../screens/CreateRecipeScreen'

import { 
  BottomTabParamList, 
  HomeParamList, 
  SearchParamList, 
  FridgeParamList, 
  ShoppingListParamList, 
  ProfileParamList } from '../types';
import { StackActions } from '@react-navigation/native';


const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  return (
    <BottomTab.Navigator
      initialRouteName="Fridge"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint, showLabel: false }}
      >
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="Fridge"
        component={FridgeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="fridge-outline" color={color} />,
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="ShoppingList"
        component={ShoppingListNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="format-list-bulleted" color={color} />,
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          unmountOnBlur: true,
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

function resetStack(navigation: StackNavigationProp<HomeParamList, 'HomeScreen'>) {
  navigation.dispatch(
    StackActions.popToTop()
  );
}


// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

const HomeStack = createStackNavigator<HomeParamList>();
const SearchStack = createStackNavigator<SearchParamList>();
const FridgeStack = createStackNavigator<FridgeParamList>();
const ShoppingListStack = createStackNavigator<ShoppingListParamList>();
const ProfileStack = createStackNavigator<ProfileParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false
      }}
      >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
      <HomeStack.Screen
        name="HomeResultScreen"
        component={HomeResultScreen}
      />
      <HomeStack.Screen
        name="IndividualRecipeScreen"
        component={IndividualRecipeScreen}
      />
      <ProfileStack.Screen
        name="CreateRecipeScreen"
        component={CreateRecipeScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

function SearchNavigator() {
  return (
    <SearchStack.Navigator
      initialRouteName="SearchScreen"
      screenOptions={{
        headerShown: false
      }}
      >
      <SearchStack.Screen
        name="SearchScreen"
        component={SearchScreen}
      />
      <SearchStack.Screen
        name="IndividualRecipeScreen"
        component={IndividualRecipeScreen}
      />
      <ProfileStack.Screen
        name="CreateRecipeScreen"
        component={CreateRecipeScreen}
        options={{ headerShown: false }}
      />
    </SearchStack.Navigator>
  );
}

function FridgeNavigator() {
  return (
    <FridgeStack.Navigator
      initialRouteName="FridgeScreen"
      >
      <FridgeStack.Screen
        name="FridgeScreen"
        component={FridgeScreen}
        options={{ headerTitle: 'your fridge' }}
        initialParams={{trigger: false}}
      />
      <FridgeStack.Screen
        name="AddFridgeItemScreen"
        component={AddFridgeItemScreen}
        options={{headerShown: false}}
      />
    </FridgeStack.Navigator>
  );
}

function ShoppingListNavigator() {
  return (
    <ShoppingListStack.Navigator
      initialRouteName="ShoppingListScreen"
      >
      <ShoppingListStack.Screen
        name="ShoppingListScreen"
        component={ShoppingListScreen}
        options={{ headerTitle: 'shopping list' }}
        initialParams={{trigger: false}}
        />
      <ShoppingListStack.Screen
        name="AddShoppingListItemScreen"
        component={AddShoppingListItemScreen}
        options={{ headerShown: false }}
        />
    </ShoppingListStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileScreen"
      >
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        initialParams={{headerTitle: 'profile'}}
        options={({ navigation, route }) => ({ 
          title: route.params.headerTitle,
          headerRight: () => (
            <View style={{marginRight: 20}}>
              <TouchableWithoutFeedback onPress={() => navigation.navigate('SettingsScreen')}>
                <SimpleLineIcons name="settings" size={20} color="black" />
              </TouchableWithoutFeedback>       
            </View>
            
          )
        })}
      />
      <ProfileStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerTitle: 'settings' }}
      />
      <ProfileStack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{ headerTitle: 'account' }}
      />
      <ProfileStack.Screen
        name="AboutScreen"
        component={AboutScreen}
        options={{ headerTitle: 'about' }}
      />
      <ProfileStack.Screen
        name="IndividualRecipeScreen"
        component={IndividualRecipeScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="CreateRecipeScreen"
        component={CreateRecipeScreen}
        options={{ headerShown: false }}
      />
  </ProfileStack.Navigator>
  );
}