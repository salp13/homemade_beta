import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Login: {
            screens: {
              LoginScreen: 'login',
              SignupScreen: 'signup',
            }
          },
          Home: {
            screens: {
              HomeScreen: 'home',
              HomeResultScreen: 'homeResults',
            },
          },
          Search: {
            screens: {
              SearchScreen: 'search',
            },
          },
          Fridge: {
            screens: {
              FridgeScreen: 'fridge',
            },
          },
          ShoppingList: {
            screens: {
              ShoppingListScreen: 'shoppingList',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};
