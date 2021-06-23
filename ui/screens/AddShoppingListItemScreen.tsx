import * as React from 'react';
import { ActivityIndicator, StyleSheet, FlatList, Platform, TouchableWithoutFeedback } from 'react-native';
import { foodItemType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, Text, View } from '../components/Themed';
import { ShoppingListParamList } from '../types'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: StackNavigationProp<ShoppingListParamList, 'AddShoppingListItemScreen'>,
  route: RouteProp<ShoppingListParamList, 'AddShoppingListItemScreen'>
}

interface State {
  isLoading: boolean
  token: string
  user_id: string
  trigger: boolean
  search: string
  orderNumber: number
  allFood: Array<foodItemType>
  shoppingListItems: Array<any>
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class FridgeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Add item to shopping list...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: StyleSheet.flatten([styling.searchBarContainerStyle, {width: '100%'}]),
    inputContainerStyle: styling.searchBarInputContainerStyle,
    inputStyle: styling.defaultFontSize,
    cancelButtonProps: {buttonTextStyle: styling.defaultFontSize},
    reference: this.searchRef,
  }

  constructor(props?: any) {
    super(props);
    this.state = { 
      isLoading: true,
      token: '',
      user_id: '', 
      trigger: false,
      orderNumber: this.props.route.params.orderNumber,
      search: '',
      allFood: [],
      shoppingListItems: []
    };
    this.arrayholder = []

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.OnPressSearch = this.OnPressSearch.bind(this)
    this.OnCancel = this.OnCancel.bind(this)
    this.OnSubmit = this.OnSubmit.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)

  }
  async componentDidMount() {
    // set token and user_id
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID
      })
    }
    
    // hit api for shopping list items
    let shoppingListItemsData = await fetch(`http://localhost:8000/homemade/many_shopping_list/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => { return data })
      .catch(error => {
        console.error(error);
      });

    // hit api for all foods to update arrayholder
    await fetch(`http://localhost:8000/homemade/many_foods/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      })
      .then(response => response.json())
      .then(data => {
        this.arrayholder = data.filter(item => item.food_name !== 'unlisted_food')
        this.setState({
          isLoading: false,
          shoppingListItems: shoppingListItemsData
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  OnChangeSearch(text: string) {
    // filter all foods depending on search text
    const allFoodSearched = this.arrayholder.filter(function(item: foodItemType) {
      const itemData = item.food_name ? item.food_name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.startsWith(textData);
    });

    this.setState({
      allFood: allFoodSearched,
      search: text,
    });
  }

  OnClearSearch() {
    // reset search text
    this.setState({
      allFood: [],
      search: '',
    });
  }

  async OnPressSearch(id: string, food_name: string) {   
    // hit api to post newly added item to shopping list
    let body = (food_name === "unlisted_food") ? JSON.stringify({food: id, unlisted_food: this.state.search, order_index: this.state.orderNumber}) : JSON.stringify({food: id, order_index: this.state.orderNumber})
    await fetch(`http://localhost:8000/homemade/many_shopping_list/${this.state.user_id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: body
    })
      .catch(error => {
        console.error(error);
      });
    // cancel search bar, not very effective
    if (this.searchRef.current?.cancel) this.searchRef.current.cancel()
    // revert trigger and navigate back to shopping list screen
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate('ShoppingListScreen', {trigger: this.state.trigger})
  }

  OnCancel() {
    // reset trigger and navigate back to fridge screen
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate("ShoppingListScreen", {trigger: this.state.trigger})
  }

  async OnSubmit() {
    // if submitted manually, search for food if it exists, if so add it normally, otherwise mark as unlisted food
    let food_item = this.arrayholder.find(item => item.food_name.toUpperCase() === this.state.search.toUpperCase())
    if (food_item) {
      await this.OnPressSearch(food_item.food_id, food_item.food_name)
    } else {
      await this.OnPressSearch("0508cd76-8fec-4739-b996-c7001763c98f", "unlisted_food")
    }
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    return (
      <View style={StyleSheet.flatten([styling.noHeader, styling.container])}>
        <View>
          <SearchBar
            onChangeText={text => this.OnChangeSearch(text)}
            onClear={this.OnClearSearch}
            onCancel={this.OnCancel}
            onSubmitEditing={this.OnSubmit}
            value={this.state.search}
            platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
            {...this.searchBarProps}
          />
        </View>
        <FlatList
          keyboardShouldPersistTaps='always'
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={this.state.allFood}
          renderItem={({ item, index }) => (
            <View>
              <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.food_id, item.food_name)}>
                <Text style={styling.searchResultText}>{item.food_name}</Text>
              </TouchableWithoutFeedback>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}