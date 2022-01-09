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
    recipe_id: string,
    trigger: boolean
  }
  CreateRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
};

export type SearchParamList = {
  SearchScreen: undefined;
  IndividualRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
  CreateRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
};

export type FridgeParamList = {
  FridgeScreen: {
    trigger: boolean
  };
  AddFridgeItemScreen: {
    trigger: boolean
  };
};

export type ShoppingListParamList = {
  ShoppingListScreen: {
    trigger: boolean
  };
  AddShoppingListItemScreen: {
    orderNumber: number
    trigger: boolean
  }
};

export type ProfileParamList = {
  ProfileScreen: {
    headerTitle: string
    trigger: boolean
  }
  SettingsScreen: undefined
  AccountScreen: undefined
  AboutScreen: undefined
  IndividualRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
  CreateRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
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

export type IndividualRecipeParamList = {
  IndividualRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
  CreateRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
}