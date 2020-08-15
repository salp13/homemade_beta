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
};

export type ShoppingListParamList = {
  ShoppingListScreen: undefined;
};

export type ProfileParamList = {
  ProfileScreen: undefined;
};

export type HomeResultParamList = {
  HomeResultScreen: {
    specifiedItems: Array<any>
  }
};