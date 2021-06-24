import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Root: undefined
  NotFound: undefined;
  Auth: undefined
};

export type BottomTabParamList = {
  Home: {
    screen: 'HomeScreen'
  };
  Search: {
    screen: 'SearchScreen'
  };
  Fridge: {
    screen: 'FridgeScreen'
  };
  ShoppingList: {
    screen: 'ShoppingListScreen'
  };
  Profile: {
    screen: 'ProfileScreen'
  };
};

export type HomeParamList = {
  HomeScreen: undefined;
  HomeResultScreen: {
    specifiedItems: Array<any>
  }
  IndividualRecipeScreen: {
    recipe_id: string
  }
};

export type SearchParamList = {
  SearchScreen: undefined;
  IndividualRecipeScreen: {
    recipe_id: string
  }
};

export type FridgeParamList = {
  FridgeScreen: {
    trigger: boolean
  };
  AddFridgeItemScreen: undefined;
};

export type ShoppingListParamList = {
  ShoppingListScreen: {
    trigger: boolean
  };
  AddShoppingListItemScreen: {
    orderNumber: number
  }
};

export type ProfileParamList = {
  ProfileScreen: {
    headerTitle: string
  }
  SettingsScreen: undefined
  AccountScreen: undefined
  AboutScreen: undefined
  IndividualRecipeScreen: {
    recipe_id: string
  }
  CreateRecipeScreen: undefined
};

export type LoginParamList = {
  LoginScreen: undefined
  SignupScreen: undefined
}

export type RootStackParams = {
  Auth: NavigatorScreenParams<LoginParamList>
  Root: undefined;
  NotFound: undefined;
}