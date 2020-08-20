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
  ProfileScreen: undefined;
};

export type HomeResultParamList = {
  HomeResultScreen: {
    specifiedItems: Array<any>
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