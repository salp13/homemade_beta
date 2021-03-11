export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Home: {
    screen: 'HomeScreen',
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
  AddShoppingListItemScreen: undefined
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
};