import * as React from 'react';
import { ActivityIndicator, StyleSheet, FlatList, Platform, TouchableWithoutFeedback, TextInputKeyPressEventData} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import dummyData from '../dummyData.json'
import { ShoppingListParamList } from '../types'

type foodItem = {
  food_id: string
  food_name: string
  default_days_to_exp: number | undefined
  food_group: {
    food_group_id: string
    image: string
  }
}

interface Props {
  navigation: StackNavigationProp<ShoppingListParamList, 'AddShoppingListItemScreen'>,
  route: RouteProp<ShoppingListParamList, 'AddShoppingListItemScreen'>
}

interface State {
  isLoading: boolean
  trigger: boolean
  search: string
  allFood: Array<foodItem>
  shoppingListItems: Array<any>
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class FridgeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Add item to fridge...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: styles.searchBarContainerStyle,
    inputContainerStyle: styles.searchBarInputContainerStyle,
    inputStyle: styles.searchBarTextStyle,
    cancelButtonProps: {buttonTextStyle: {fontSize: 15}},
    reference: this.searchRef,
  }

  constructor(props?: any) {
    super(props);
    
    this.state = { 
      isLoading: true,
      trigger: false,
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

  }
  async componentDidMount() {
    let shoppingListItemsData = await fetch('http://localhost:8000/homemade/many_shopping_list/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => { return data })
      .catch(error => {
        console.error(error);
      });

    await fetch(`http://localhost:8000/homemade/many_foods`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
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
    const allFoodSearched = this.arrayholder.filter(function(item: foodItem) {
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
    this.setState({
      allFood: [],
      search: '',
    });
  }

  async OnPressSearch(id: string, food_name: string) {    
    let body = JSON.stringify({food: id})
    if (food_name === "unlisted_food") {
      body = JSON.stringify({food: id, unlisted_food: this.state.search})
    } 
    await fetch('http://localhost:8000/homemade/many_shopping_list/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body
    })
      .catch(error => {
        console.error(error);
      });

    if (this.searchRef.current?.cancel) this.searchRef.current.cancel()
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate('ShoppingListScreen', {trigger: this.state.trigger})
  }

  OnCancel() {
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate("ShoppingListScreen", {trigger: this.state.trigger})
  }

  async OnSubmit() {
    let food_item = this.arrayholder.find(item => item.food_name.toUpperCase() === this.state.search.toUpperCase())
    if (food_item) {
      await this.OnPressSearch(food_item.food_id, food_item.food_name)
    } else {
      await this.OnPressSearch("0508cd76-8fec-4739-b996-c7001763c98f", "unlisted_food")
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>
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
          data={this.state.allFood}
          renderItem={({ item, index }) => (
            <View>
              <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.food_id, item.food_name)}>
                <Text style={styles.searchResultText}>{item.food_name}</Text>
              </TouchableWithoutFeedback>
            </View>
          )}
          style={{ marginTop: 10 }}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight:20,

  },
  title: {
    fontSize: 30,
    textAlign: 'left',
    paddingRight: 80,
  },
  separator: {
    marginVertical: 10,
    height: 1,
  },
  searchBarContainerStyle: {
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  searchBarInputContainerStyle: {
    height: 35,
  },
  searchBarTextStyle: {
    fontSize: 15,
  },
  searchResultText: {
    marginLeft: 20,
    marginTop: 15,
    fontSize: 15,
  },
});