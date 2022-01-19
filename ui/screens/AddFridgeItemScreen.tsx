import * as React from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { foodItemType } from '../objectTypes'
import { FridgeParamList } from '../types'
import { AntDesign } from '@expo/vector-icons'; 
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, Text, View, Image } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Dialog from 'react-native-dialog'


interface Props {
  navigation: StackNavigationProp<FridgeParamList, 'AddFridgeItemScreen'>,
  route: RouteProp<FridgeParamList, 'AddFridgeItemScreen'>
}

interface State {
  isLoading: boolean
  updateLoading: boolean
  errorText: string
  token: string
  user_id: string
  trigger: boolean
  search: string
  total_items: number
  allFood: Array<foodItemType>
  fridgeItems: Array<any>
  unlisted_food_image: string
  visible: boolean
  signifier: boolean
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
    placeholder: "Add item to fridge...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: StyleSheet.flatten([styling.searchBarContainerStyle, {width: '90%', alignSelf: ''}]),
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
      errorText: '',
      token: '', 
      user_id: '', 
      trigger: this.props.route.params.trigger,
      search: '',
      total_items: 0,
      allFood: [],
      fridgeItems: [],
      unlisted_food_image: '',
      visible: false,
      signifier: false,
      quantity: "1",
      current_item_name: "",
      current_item_food_id: "",
      add_to_existing: true,
    };
    this.arrayholder = []

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.OnPressSearch = this.OnPressSearch.bind(this)
    this.saveItem = this.saveItem.bind(this)
    this.setQuantity = this.setQuantity.bind(this)
    this.returnFridge = this.returnFridge.bind(this)
    this.OnSubmit = this.OnSubmit.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.errorMessage = this.errorMessage.bind(this)
  }

  private goingBack = this.props.navigation.addListener('beforeRemove', async (e) => {
    await this.setState({
      trigger: !this.state.trigger
    })
    this.props.navigation.navigate("FridgeScreen", {trigger: this.state.trigger})
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
      } else {
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
          this.setState({ unlisted_food_image: (unlisted) ? unlisted.food.food_group.image : ''})
          // set all_foods data
          try {
            AsyncStorage.setItem('@all_foods', JSON.stringify(data))
          } catch (e) {
            console.error(e)
          }
        })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
      }
    })

    // get fridge_data from asyncstorage
    await AsyncStorage.getItem('@fridge_data')
    .then( data => {if (data) return JSON.parse(data)})
    .then( parsed_data => {
      if (parsed_data) { 
        this.setState({ 
          fridgeItems: parsed_data,
          isLoading: false
        })
      }}
    )
    await AsyncStorage.getItem('@metric_data')
    .then( data => {
      if (data) {
        let parsed_data = JSON.parse(data)
        this.setState({ 
          total_items: parsed_data.total_items,
        })
      }
      
    })

    // hit api for fridge items
    let fridgeData = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_fridge/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => { 
        return data 
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // hit api for metrics data to keep track of total items
    let metric_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/metric_data/${this.state.user_id}`, {
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
            fridgeItems: fridgeData,
            total_items: data.total_items,
          })
          return data
        })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });

    // set fridge_data and merge metric data
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(fridgeData))
      AsyncStorage.setItem('@metric_data', JSON.stringify(metric_data))
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
    this.setState({
      allFood: [],
      search: '',
      quantity: "",
      current_item_name: "",
      current_item_food_id: "",
      visible: false,
      add_to_existing: true
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

    const many_existing = this.state.fridgeItems.filter(item => {
      if (!item.unlisted_food) return item.food.food_name === this.state.current_item_name
      return item.unlisted_food === this.state.current_item_name
    })

    const existing = (many_existing) ? many_existing.sort((a,b) => {
      if (a.expiration_date > b.expiration_date) return -1 
      else return 1
    })[0] : undefined

    if (this.state.add_to_existing && existing) {
      let editted_fridge = this.state.fridgeItems 
      let new_quant = (!isNaN(Number(this.state.quantity))) ? parseInt(this.state.quantity) : 1
      const editted_quantity = new_quant + parseInt(existing.quantity)
      if (existing) {
        const index = editted_fridge.findIndex(ele => ele.id === existing.id)
        editted_fridge[index].quantity = editted_quantity
      }
      // hit api to update fridge item's quantity
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_fridge/${this.state.user_id}/${existing.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: JSON.stringify({ quantity: editted_quantity })
      })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
        
      this.setState({
        fridgeItems: editted_fridge,
        total_items: this.state.total_items + 1,
        updateLoading: false,
        search: "",
        allFood: [],
        quantity: "",
        current_item_name: "",
        current_item_food_id: "",
        visible: false,
        add_to_existing: true,
      })
    } else {
      // hit api to post newly added item to fridge
      let new_quant = (!isNaN(Number(this.state.quantity))) ? parseInt(this.state.quantity) : 1
      let body = (food_name === "unlisted_food") ? 
        JSON.stringify({food: id, unlisted_food: this.state.search, quantity: new_quant}) : 
        JSON.stringify({food: id, quantity: new_quant})
      const fridge_item = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_fridge/${this.state.user_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: body
        }).then(response => response.json())
        .then( data => {
          return data
        })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
        
      this.setState({
        fridgeItems: this.state.fridgeItems.concat([fridge_item]),
        total_items: this.state.total_items + 1,
        search: "",
        allFood: [],
        quantity: "",
        current_item_name: "",
        current_item_food_id: "",
        visible: false,
        add_to_existing: true,
      })
    }

    // hit api to increment user's total items by 1
    const metric_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/metric_data/${this.state.user_id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify({
          total_items: this.state.total_items + 1,
        })
      })
      .then(response => response.json())
      .then(data => {
        this.setState({
          total_items: data.total_items,
          updateLoading: false,
        })
        return data
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

      await this.setState({ signifier: true})
      setTimeout(() => this.setState({signifier: false}), 500)


      // set changes to AsyncStorage
      try {
        AsyncStorage.setItem('@fridge_data', JSON.stringify(this.state.fridgeItems))
        AsyncStorage.setItem('@metric_data', JSON.stringify(metric_data))
      } catch (e) {
        console.error(e)
      } 
  }

  async returnFridge() {
    // reset trigger and navigate back to fridge screen
    await this.setState({
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
      await this.OnPressSearch("f423fee8-fa24-45eb-818a-a2a2dabff417", "unlisted_food")
    }
  }

  async setQuantity(text: string) {
    this.setState({ quantity: text })
  }

  IsLoadingRender() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <ActivityIndicator />
      </View>
    )
  }

  errorMessage() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <Text>{this.state.errorText}</Text>
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()
    if (this.state.errorText !== '') return this.errorMessage()

    return (
      <View style={StyleSheet.flatten([styling.noHeader, styling.container])}>
        <View style={styling.flexRow}>
          <View style={styling.backArrow}>
            <TouchableWithoutFeedback onPress={this.returnFridge}>
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
        {(this.state.search !== '' && !this.arrayholder.find(item => item.food_name.toLowerCase() === this.state.search.toLowerCase())) ? (
          <View>
          <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={() => this.OnPressSearch("f423fee8-fa24-45eb-818a-a2a2dabff417", "unlisted_food")}>
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
          renderItem={({ item, index }) => (
            <View>
              <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={() => this.OnPressSearch(item.food_id, item.food_name)}>
                <View style={styling.addItemView}>
                  <View style={styling.imageContainerNoBorderMarginLeft}>
                    <Image style={styling.foodGroupImage} source={{ uri: item.food_group.image }}/>
                  </View>
                  <Text style={styling.searchResultText}>{item.food_name}</Text>
                  <Ionicons name="ios-add" color="black" style={styling.addItemButton}/>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View>
          <Dialog.Container visible={this.state.visible}>
            <Dialog.Title>Confirm Fridge Item</Dialog.Title>
            <Dialog.Input
              keyboardType="number-pad"
              textAlign="center"
              placeholder="quantity of this item"
              placeholderTextColor='#696969'
              autoCapitalize='none'
              onChangeText={text => this.setQuantity(text)}
              defaultValue={"1"} />
            {!this.state.fridgeItems.find(item => {
              if (!item.unlisted_food) return item.food.food_name === this.state.current_item_name
              return item.unlisted_food === this.state.current_item_name
            }) ? 
            (<View></View>) : 
            (<Dialog.Switch
              label={`Do you want to add this onto existing ${this.state.current_item_name} in your fridge`}
              value={this.state.add_to_existing}
              onValueChange={() => { this.setState({ add_to_existing: !this.state.add_to_existing }) }}
            />)}
            <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={this.OnClearSearch} />
            <Dialog.Button disabled={this.state.updateLoading} label="Add" onPress={this.saveItem} />
          </Dialog.Container>
        </View>
        <View>
          <Dialog.Container visible={this.state.signifier} contentStyle={{opacity: 0.5}}>
            <Dialog.Title>Fridge Item Added</Dialog.Title>
            <AntDesign name="check" style={styling.signifierIcon}/>
          </Dialog.Container>
          </View>
      </View>
    );
  }
}