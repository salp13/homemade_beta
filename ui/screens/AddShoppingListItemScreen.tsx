import * as React from 'react';
import { ActivityIndicator, StyleSheet, FlatList, Platform, TouchableWithoutFeedback, TouchableNativeFeedbackBase } from 'react-native';
import { foodItemType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, Text, View, Image } from '../components/Themed';
import { ShoppingListParamList } from '../types'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Dialog from 'react-native-dialog'

interface Props {
  navigation: StackNavigationProp<ShoppingListParamList, 'AddShoppingListItemScreen'>,
  route: RouteProp<ShoppingListParamList, 'AddShoppingListItemScreen'>
}

interface State {
  isLoading: boolean
  updateLoading: boolean
  token: string
  user_id: string
  trigger: boolean
  search: string
  orderNumber: number
  allFood: Array<foodItemType>
  shoppingListItems: Array<any>
  unlisted_food_image: string
  visible: boolean
  quantity: string
  current_item_name: string
  current_item_food_id: string
  add_to_existing: boolean
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
    containerStyle: StyleSheet.flatten([styling.searchBarContainerStyle, {width: '90%'}]),
    inputContainerStyle: styling.searchBarInputContainerStyle,
    inputStyle: styling.defaultFontSize,
    cancelButtonProps: {buttonTextStyle: styling.defaultFontSize},
    reference: this.searchRef,
  }

  constructor(props?: any) {
    super(props);
    this.state = { 
      isLoading: true,
      updateLoading: false,
      token: '',
      user_id: '', 
      trigger: this.props.route.params.trigger,
      orderNumber: this.props.route.params.orderNumber,
      search: '',
      allFood: [],
      shoppingListItems: [],
      unlisted_food_image: '',
      visible: false,
      quantity: "1",
      current_item_name: "",
      current_item_food_id: "",
      add_to_existing: false,
    };
    this.arrayholder = []

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.OnPressSearch = this.OnPressSearch.bind(this)
    this.saveItem = this.saveItem.bind(this)
    this.returnShoppingList = this.returnShoppingList.bind(this)
    this.OnSubmit = this.OnSubmit.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)

  }

  private goingBack = this.props.navigation.addListener('beforeRemove', async (e) => {
    console.log(`goingback before: ${this.state.trigger}`)
    await this.setState({
      trigger: !this.state.trigger
    })
    console.log(`FROM ADD SCREEN: ${this.state.trigger}`)
    this.props.navigation.navigate("ShoppingListScreen", {trigger: this.state.trigger})
  })

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

    await AsyncStorage.getItem('@all_foods')
    .then( all_foods => {
      if (all_foods) {
        this.arrayholder = JSON.parse(all_foods).filter(item => item.food_name !== 'unlisted_food') 
        let unlisted = JSON.parse(all_foods).find(item => item.food_name === 'unlisted_food')
        this.setState({ unlisted_food_image: (unlisted) ? unlisted.food_group.image : ''})
      }
      else {
        // hit api for all foods excluding the unlisted food item
        fetch(`https://homemadeapp.azurewebsites.net/homemade/many_foods/`, {
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
          let unlisted = data.find(item => item.food_name === 'unlisted_food')
          this.setState({ unlisted_food_image: (unlisted) ? unlisted.food_group.image : ''})
          // set all_foods data
          try {
            AsyncStorage.setItem('@all_foods', JSON.stringify(data))
          } catch (e) {
            console.error(e)
          }
        })
        .catch(error => {
          console.error(error);
        });
      }
    })

    // get fridge_data and wasted_count and eaten_count
    await AsyncStorage.getItem('@shopping_list')
    .then( data => {if (data) return JSON.parse(data)})
    .then( parsed_data => {
      if (parsed_data) { 
        this.setState({ 
          shoppingListItems: parsed_data,
          isLoading: false
        })
      }}
    )

    // hit api for shopping list items
    let shoppingListItemsData = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => { 
        this.setState({
          isLoading: false,
          shoppingListItems: data
        });
        return data 
      })
      .catch(error => {
        console.error(error);
      });
      // set fridge_data and merge metric data
    try {
      AsyncStorage.setItem('@shopping_list', JSON.stringify(shoppingListItemsData))
    } catch (e) {
      console.error(e)
    }
  }

  OnChangeSearch(text: string) {
    // filter all foods depending on search text
    const allFoodSearched = (text === "") ? [] : this.arrayholder.filter(function(item: foodItemType) {
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
      quantity: "",
      current_item_name: "",
      current_item_food_id: "",
      visible: false,
      add_to_existing: false,
    });
  }

  async OnPressSearch(id: string, food_name: string) {
    this.setState({
      visible: true,
      quantity: "1",
      current_item_name: food_name,
      current_item_food_id: id,
    })
  }

  async saveItem() {  
    this.setState({ updateLoading: true })
    const id = this.state.current_item_food_id
    const food_name = this.state.current_item_name

    if (this.state.add_to_existing) {
      const existing = this.state.shoppingListItems.find(item => {
        if (!item.unlisted_food) return item.food.food_name === this.state.current_item_name
        return item.unlisted_food === this.state.search
      })
      let editted_list = this.state.shoppingListItems 
      let new_quant = (!isNaN(Number(this.state.quantity))) ? parseInt(this.state.quantity) : 1

      const editted_quantity = new_quant + parseInt(existing.quantity)
      if (existing) {
        const index = editted_list.findIndex(ele => ele.id === existing.id)
        editted_list[index].quantity = editted_quantity
      }

      // hit api to add item to shopping list
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_shopping_list/${this.state.user_id}/${existing.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: JSON.stringify({quantity: editted_quantity })
      })
        .catch(error => {
          console.error(error);
        });

      this.setState({
        shoppingListItems: editted_list,
        updateLoading: false,
        search: "",
        allFood: [],
        quantity: "",
        current_item_name: "",
        current_item_food_id: "",
        visible: false,
        add_to_existing: false,
      })

    } else {
      // hit api to post newly added item to shopping list
      let new_quant = (!isNaN(Number(this.state.quantity))) ? parseInt(this.state.quantity) : 1

      let body = (food_name === "unlisted_food") ? 
        JSON.stringify({food: id, unlisted_food: this.state.search, order_index: this.state.orderNumber, quantity: new_quant}) : 
        JSON.stringify({food: id, order_index: this.state.orderNumber, quantity: new_quant})
      console.log(food_name)
      console.log(this.state.search)
      const shoppingListItem = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: body
      })
        .then(response => response.json())
        .then(data => {
          return data
        })
        .catch(error => {
          console.error(error);
        });

      this.setState({
        shoppingListItems: this.state.shoppingListItems.concat(shoppingListItem),
        updateLoading: false,
        search: "",
        allFood: [],
        quantity: "",
        current_item_name: "",
        current_item_food_id: "",
        visible: false,
        add_to_existing: false,
      })
   }
    
    try {
      AsyncStorage.setItem('@shopping_list', JSON.stringify(this.state.shoppingListItems))
    } catch (e) {
      console.error(e)
    } 
  }

  returnShoppingList() {
    // reset trigger and navigate back to fridge screen
    this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate("ShoppingListScreen", {trigger: this.state.trigger})
  }

  async OnSubmit() {
    // if submitted manually, search for food if it exists, if so add it normally, otherwise mark as unlisted food
    let food_item = this.arrayholder.find(item => { return item.food_name.toUpperCase() === this.state.search.toUpperCase() })
    if (food_item) {
      console.log(food_item)
      await this.OnPressSearch(food_item.food_id, food_item.food_name)
    } else {
      console.log('hittin unlisted food')
      await this.OnPressSearch("f423fee8-fa24-45eb-818a-a2a2dabff417", "unlisted_food")
    }
  }

  IsLoadingRender() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <ActivityIndicator />
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    return (
      <View style={StyleSheet.flatten([styling.noHeader, styling.container])}>
        <View style={styling.flexRow}>
          <View style={styling.backArrow}>
            <TouchableWithoutFeedback onPress={this.returnShoppingList}>
              <Ionicons name="ios-arrow-back" color="black" style={styling.iconSize}/>
            </TouchableWithoutFeedback>
          </View>
          <SearchBar
            onChangeText={text => this.OnChangeSearch(text)}
            onClear={this.OnClearSearch}
            onSubmitEditing={this.OnSubmit}
            value={this.state.search}
            platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
            autoCapitalize='none'
            {...this.searchBarProps}
          />
        </View>
        {this.state.updateLoading ? (<ActivityIndicator style={styling.activityMargin} />) : (<View></View>)}
        {this.state.search !== '' && !this.arrayholder.find(item => { return item.food_name.toUpperCase() === this.state.search.toUpperCase() }) ? (
          <View>
          <TouchableWithoutFeedback onPress={() => this.OnPressSearch("f423fee8-fa24-45eb-818a-a2a2dabff417", "unlisted_food")}>
            <View style={styling.addItemView}>
              <View style={styling.imageContainerNoBorderMarginLeft}>
                <Image style={styling.foodGroupImage} source={{ uri: this.state.unlisted_food_image }}/>
              </View>
              <Text style={styling.searchResultText}>{this.state.search.toLowerCase()}</Text>
              <Ionicons name="ios-add" color="black" style={styling.addItemButton}/>
            </View>
          </TouchableWithoutFeedback>
        </View>
        ) : (<View></View>)}
        <FlatList
          keyboardShouldPersistTaps='always'
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={this.state.allFood}
          renderItem={({ item, index }) => {
            return (
            <View>
              <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.food_id, item.food_name)}>
                <View style={styling.addItemView}>
                  <View style={styling.imageContainerNoBorderMarginLeft}>
                    <Image style={styling.foodGroupImage} source={{ uri: item.food_group.image }}/>
                  </View>
                  <Text style={styling.searchResultText}>{item.food_name}</Text>
                  <Ionicons name="ios-add" color="black" style={styling.addItemButton}/>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}}
          keyExtractor={(item, index) => index.toString()}
        />
        <View>
          <Dialog.Container visible={this.state.visible}>
            <Dialog.Title>Confirm Shopping List Item</Dialog.Title>
            <Dialog.Input
              keyboardType="number-pad"
              textAlign="center"
              placeholder="quantity of this item"
              placeholderTextColor='#696969'
              autoCapitalize='none'
              onChangeText={text => this.setState({ quantity: text })}
              defaultValue={"1"} />
            {!this.state.shoppingListItems.find(item => {
              if (!item.unlisted_food) return item.food.food_name === this.state.current_item_name
              return item.unlisted_food === this.state.search
            }) ? 
            (<View></View>) : 
            (<Dialog.Switch
              label={(this.state.current_item_name === "unlisted_food") ? `Do you want to add this onto existing ${this.state.search} in your shopping list` : `Do you want to add this onto existing ${this.state.current_item_name} in your shopping list`}
              value={this.state.add_to_existing}
              onValueChange={() => { this.setState({ add_to_existing: !this.state.add_to_existing }) }}
            />)}
            <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={this.OnClearSearch} />
            <Dialog.Button disabled={this.state.updateLoading} label="Add" onPress={this.saveItem} />
          </Dialog.Container>
        </View>
      </View>
    );
  }
}