import * as React from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { foodItemType } from '../objectTypes'
import { FridgeParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, Text, View } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props {
  navigation: StackNavigationProp<FridgeParamList, 'AddFridgeItemScreen'>,
  route: RouteProp<FridgeParamList, 'AddFridgeItemScreen'>
}

interface State {
  isLoading: boolean
  trigger: boolean
  search: string
  total_items: number
  allFood: Array<foodItemType>
  fridgeItems: Array<any>
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
      total_items: 0,
      allFood: [],
      fridgeItems: []
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
    // hit api for fridge items
    let fridgeData = await fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
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

    // hit api for metrics data to keep track of total items
    await fetch('http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          this.setState({
            isLoading: false,
            fridgeItems: fridgeData,
            total_items: data.total_items,
          })
        })
        .catch(error => {
          console.error(error);
        });
      
      // hit api for all foods excluding the unlisted food item
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
    // hit api to post newly added item to fridge
    let body = (food_name === "unlisted_food") ? JSON.stringify({food: id, unlisted_food: this.state.search}) : JSON.stringify({food: id})
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
    
    // hit api to increment user's total items by 1
    await fetch(`http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        total_items: this.state.total_items + 1,
      })
      })
      .catch(error => {
        console.error(error);
      });
    // reset trigger and navigate back to fridge screen
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate('FridgeScreen', {trigger: this.state.trigger})
  }

  OnCancel() {
    // reset trigger and navigate back to fridge screen
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate("FridgeScreen", {trigger: this.state.trigger})
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
      <View style={{ flex: 1, paddingTop: 20 }}>
        <ActivityIndicator />
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

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