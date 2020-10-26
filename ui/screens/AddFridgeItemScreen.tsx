import * as React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Platform, TouchableWithoutFeedback} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import dummyData from '../dummyData.json'
import { FridgeParamList } from '../types'

type foodItem = {
  food_id: string
  food_name: string
  default_days_to_exp: number | undefined
  food_group: {
    food_group_id: number
    image: string
  }
}

interface Props {
  navigation: StackNavigationProp<FridgeParamList, 'AddFridgeItemScreen'>,
  route: RouteProp<FridgeParamList, 'AddFridgeItemScreen'>
}

interface State {
  isLoading: boolean
  trigger: boolean
  search: string
  allFood: Array<foodItem>
  fridgeItems: Array<any>
}

export default class FridgeScreen extends React.Component<Props, State> {
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
      fridgeItems: []
    };

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.OnPressSearch = this.OnPressSearch.bind(this)
    this.OnCancel = this.OnCancel.bind(this)

  }
  componentDidMount() {
    return fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        this.setState(
          {
            isLoading: false,
            fridgeItems: data,
          }
        );
      })
      .catch(error => {
        console.error(error);
      });
  }


  OnChangeSearch(text: string) {
    let lowercase = text.toLowerCase()
    return fetch(`http://localhost:8000/homemade/many_foods?value=${lowercase}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        let filteredData = data.filter((food) => {
          return !this.state.fridgeItems
          .find((fridgeItem) => {
            return fridgeItem.food.food_name === food.food_name})
          })
        this.setState(
          {
            allFood: filteredData,
            search: text
          }
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  OnClearSearch() {
    this.setState({
      allFood: [],
      search: '',
    });
  }

  async OnPressSearch(id: string, food_name: string) {    
    console.log('add item to fridge items in database')

    let body
    if (food_name === 'unlisted_food') body = JSON.stringify({food: id, unlisted_food: food_name})
    else body = JSON.stringify({food: id})
    await fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
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
      
    this.setState({
      trigger: !this.state.trigger
    })
    console.log(this.state.trigger)
    this.props.navigation.navigate('FridgeScreen', {trigger: this.state.trigger})
  }

  OnCancel() {
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate("FridgeScreen", {trigger: this.state.trigger})
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


/*
  BE-TODO
    REQUESTS
      - GET: all fridge items
      - GET: all food items matching search params
      - POST: add food item to fridge
*/