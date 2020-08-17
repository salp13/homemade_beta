import * as React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Platform, TouchableWithoutFeedback} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import dummyData from '../dummyData.json'
import { AddFridgeItemParamList } from '../types'

type foodItem = {
  title: string,
  id: string,
  defaultDaysToExp: number
  imageIndex: number
}

interface Props {
  navigation: StackNavigationProp<AddFridgeItemParamList, 'AddFridgeItemScreen'>,
  route: RouteProp<AddFridgeItemParamList, 'AddFridgeItemScreen'>
}

interface State {
  isLoading: boolean
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
    const fridgeItems = JSON.parse(JSON.stringify(dummyData.dummyFridgeItems)) 

    this.setState({
      isLoading: false,
      fridgeItems: fridgeItems,
    })

    // TODO: query for all fridge items
  }


  OnChangeSearch(text: string) {
    if (text === '') {
      this.setState({
        allFood: [],
        search: text
      });
      return
    }

    const lowerCaseText = text.toLowerCase()
    let newFood = JSON.parse(JSON.stringify(dummyData.dummyAllFoods))
    .filter((food) => {return food.title.includes(lowerCaseText)
    }).filter((food) => {
      return !this.state.fridgeItems
      .find((fridgeItem) => {
        return fridgeItem.title === food.title})
      })
    
    this.setState({
      allFood: newFood,
      search: text
    });

    // TODO: query for all foods that match search params
  }

  OnClearSearch() {
    this.setState({
      allFood: [],
      search: '',
    });
  }

  OnPressSearch(id: string) {    
    console.log('add item to fridge items in database')

    // TODO: post request to add food item to fridge
    if (this.searchRef.current?.cancel) this.searchRef.current.cancel()

    this.props.navigation.navigate('FridgeScreen')
  }

  OnCancel() {
    this.props.navigation.navigate("FridgeScreen")
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
              <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.id)}>
                <Text style={styles.searchResultText}>{item.title}</Text>
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
    - query for all fridge items
    - post request to add food item to fridge
*/