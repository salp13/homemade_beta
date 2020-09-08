export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Fridge: undefined;
  ShoppingList: undefined;
  Profile: undefined;
};

export type HomeParamList = {
  HomeScreen: undefined;
  HomeResultScreen: {
    specifiedItems: Array<any>
  }
};

export type SearchParamList = {
  SearchScreen: undefined;
  IndividualRecipeScreen: {
    recipeId: string
  }
};

export type FridgeParamList = {
  FridgeScreen: undefined;
  AddFridgeItemScreen: undefined;
};

export type ShoppingListParamList = {
  ShoppingListScreen: undefined;
  AddShoppingListItemScreen: undefined
};

export type ProfileParamList = {
  ProfileScreen: undefined
  SettingsScreen: undefined
  IndividualRecipeScreen: {
    recipeId: string
  }
};

export type HomeResultParamList = {
  HomeResultScreen: {
    specifiedItems: Array<any>
  }
  IndividualRecipeScreen: {
    recipeId: string
  }
};

export type AddFridgeItemParamList = {
  AddFridgeItemScreen: undefined
  FridgeScreen: undefined
}

export type AddShoppingListItemParamList = {
  AddShoppingListItemScreen: undefined
  ShoppingListScreen: undefined
}

export type SettingsParamList = {
  SettingsScreen: undefined
  ProfileScreen: undefined
  AccountScreen: undefined
  AboutScreen: undefined
}

export type AccountParamList = {
  AccountScreen: undefined
  SettingsScreen: undefined
}

export type AboutParamList = {
  AboutScreen: undefined
  SettingsScreen: undefined
}

export type IndividualRecipeParamList = {
  IndividualRecipeScreen: {
    recipeId: string
  }
}