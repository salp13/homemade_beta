import * as React from 'react';
import moment from 'moment';
import { ActivityIndicator, FlatList, Platform, ScrollView, TouchableWithoutFeedback} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import FridgeItem from '../components/FridgeItem'
import { fridgeItemType } from '../objectTypes'
import { FridgeParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, Text, View } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from 'react-native-dialog'

interface Props {
  navigation: StackNavigationProp<FridgeParamList, 'FridgeScreen'>,
  route: RouteProp<FridgeParamList, 'FridgeScreen'>
}

interface State {
  isLoading: boolean
  updateLoading: boolean
  errorText: string
  token: string
  user_id: string
  trigger: boolean
  search: string
  wasted_count: number
  eaten_count: number
  produce_wasted: number
  dairy_wasted: number
  meat_wasted: number
  fridgeItems: Array<fridgeItemType>
  fridgeAlert: {
    visible: boolean
    id: number
    days_to_exp: number | undefined
    expiration_date: Date | undefined
    quantity: number
    food_name: string
  },
  deleteAlert: {
    visible: boolean
    id: number
  },
  swipingAction: boolean
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class FridgeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Search your fridge...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: styling.searchBarContainerStyle,
    inputContainerStyle: styling.searchBarInputContainerStyle,
    inputStyle: styling.defaultFontSize,
    cancelButtonProps: {buttonTextStyle: styling.defaultFontSize},
    reference: this.searchRef,
  }

  constructor(props: Props) {
    super(props);
    this.state = { 
      isLoading: true, 
      updateLoading: false,
      errorText: '',
      token: '',
      user_id: '',
      trigger: false,
      search: '',
      wasted_count: 0,
      eaten_count: 0,
      produce_wasted: 0,
      dairy_wasted: 0,
      meat_wasted: 0,
      fridgeItems: [],
      fridgeAlert: {
        visible: false,
        id: -1,
        days_to_exp: undefined,
        expiration_date: undefined,
        quantity: -1,
        food_name: '',
      },
      deleteAlert: {
        visible: false,
        id: -1,
      },
      swipingAction: false,
    };
    this.arrayholder = [];

    this.SearchFilterFunction = this.SearchFilterFunction.bind(this)
    this.fridgeAlertTrigger = this.fridgeAlertTrigger.bind(this)
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.itemEditExpDate = this.itemEditExpDate.bind(this)
    this.itemEditQuant = this.itemEditQuant.bind(this)
    this.itemWasted = this.itemWasted.bind(this)
    this.itemEaten = this.itemEaten.bind(this)
    this.saveEdit = this.saveEdit.bind(this)
    this.EditDialog = this.EditDialog.bind(this)
    this.DeleteDialog = this.DeleteDialog.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.errorMessage = this.errorMessage.bind(this)
    this.FridgeRender = this.FridgeRender.bind(this)
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

    // get fridge_data and wasted_count and eaten_count
    await AsyncStorage.getItem('@fridge_data')
      .then((data) => { 
        if (data) { 
          let parsed_data = JSON.parse(data)
          let data2 = (parsed_data) ? parsed_data.sort((a, b) => {
            if (!b.expiration_date) return -1
            else if (!a.expiration_date) return 1
            else if (a.expiration_date > b.expiration_date) return 1
            else if (b.expiration_date > a.expiration_date) return -1
            else if (a.food.food_name > b.food.food_name) return 1
            else if (a.food.food_name < b.food.food_name) return -1
            else if (a.quantity > b.quantity) return -1
            else if (a.quantity < b.quantity) return 1
            else if (a.id > b.id) return 1
            return -1 }) : parsed_data
          this.setState({ 
            fridgeItems: data2,
            isLoading: false
          })
          this.arrayholder = data2
        }}
      )

    await AsyncStorage.getItem('@metric_data')
      .then((data) => {
        if (data) {
          let parsed_data = JSON.parse(data)
          this.setState({ 
            wasted_count: parsed_data.wasted_count,
            eaten_count: parsed_data.eaten_count,
        })}
      })

    // hit api for fridge items and sort them by expiration date
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
        data.sort((a, b) => {
          if (!b.expiration_date) return -1
          else if (!a.expiration_date) return 1
          else if (a.expiration_date > b.expiration_date) return 1
          else if (b.expiration_date > a.expiration_date) return -1
          else if (a.food.food_name > b.food.food_name) return 1
          else if (a.food.food_name < b.food.food_name) return -1
          else if (a.quantity > b.quantity) return -1
          else if (a.quantity < b.quantity) return 1
          else if (a.id > b.id) return 1
          return -1 })
        this.arrayholder = data
        return data
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // hit api for metrics data to update later
    let metric_data =  await fetch(`https://homemadeapp.azurewebsites.net/homemade/metric_data/${this.state.user_id}`, {
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
          fridgeItems: fridgeData,
          wasted_count: data.wasted_count,
          eaten_count: data.eaten_count,
          isLoading: false
        })
        return data
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // set fridge_data and merge metric data for any changes
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(fridgeData))
      AsyncStorage.setItem('@metric_data', JSON.stringify(metric_data))
    } catch (e) {
      console.error(e)
    }
  }

  async componentDidUpdate() {
    // if the trigger has changed, hit api for updated fridge items and reset trigger
    // trigger changes when returning from AddFridgeItemScreen
    if (this.state.trigger !== this.props.route.params.trigger) {
      // get fridge data
        await AsyncStorage.getItem('@fridge_data')
        .then((data) => { 
          if (data) { 
            let parsed_data = JSON.parse(data)
            let data2 = (parsed_data) ? parsed_data.sort((a, b) => {
              if (!b.expiration_date) return -1
              else if (!a.expiration_date) return 1
              else if (a.expiration_date > b.expiration_date) return 1
              else if (b.expiration_date > a.expiration_date) return -1
              else if (a.food.food_name > b.food.food_name) return 1
              else if (a.food.food_name < b.food.food_name) return -1
              else if (a.quantity > b.quantity) return -1
              else if (a.quantity < b.quantity) return 1
              else if (a.id > b.id) return 1
              return -1 }) : parsed_data
            this.setState({ 
              fridgeItems: data2,
              isLoading: false,
              trigger: this.props.route.params.trigger,
            })
            this.arrayholder = data2
          }}
        )

      const fridgeDataUpdate = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_fridge/${this.state.user_id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
      })
        .then(response => response.json())
        .then(data => {
          data.sort((a, b) => {
            if (!b.expiration_date) return -1
            else if (!a.expiration_date) return 1
            else if (a.expiration_date > b.expiration_date) return 1
            else if (b.expiration_date > a.expiration_date) return -1
            else if (a.food.food_name > b.food.food_name) return 1
            else if (a.food.food_name < b.food.food_name) return -1
            else if (a.quantity > b.quantity) return -1
            else if (a.quantity < b.quantity) return 1
            else if (a.id > b.id) return 1
            return -1 })
          this.arrayholder = data
          this.setState({
            fridgeItems: data,
          })
          return data
        })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });

      // set fridge data
      try {
        AsyncStorage.setItem('@fridge_data', JSON.stringify(fridgeDataUpdate))
      } catch (e) {
        console.error(e)
        return
      }
    }
  }

  SearchFilterFunction(text: string = '') {
    // filter fridge items based on search text
    const filteredData = this.arrayholder.filter(function(item: any) {
      const itemData = item.unlisted_food ? item.unlisted_food.toUpperCase() :item.food.food_name.toUpperCase()
      const textData = text.toUpperCase();
      let lenientData = ''
      if (textData != '') lenientData = " " + textData
      return itemData.startsWith(textData) || itemData.includes(lenientData);
    });

    this.setState({
      fridgeItems: filteredData,
      search: text,
    });
  }

  fridgeAlertTrigger(id: number) {
    let item = this.state.fridgeItems.find(element => element.id == id)
    if (item) {
      let daysDiff = (item.expiration_date) ? Math.ceil((new Date(item.expiration_date).valueOf() - new Date().valueOf()) / (24 * 60 * 60 * 1000)) : 0
      let food_name = (item.unlisted_food) ? item.unlisted_food : item.food.food_name
      this.setState({
        fridgeAlert: {
          visible: true,
          id: id,
          days_to_exp: daysDiff,
          expiration_date: item.expiration_date,
          quantity: item.quantity,
          food_name: food_name
        }
      })
    }
    
  }

  OnSwipeNoScroll() {
    // cannot scroll while user is swiping
    this.setState({ swipingAction: true })
  }

  OnSwipeScroll() {
    // reset scroll functionality once swiping has ended
    this.setState({ swipingAction: false })
  }

  async saveEdit() {
    this.setState({ updateLoading: true })
    if (this.state.fridgeAlert.days_to_exp) {
      let someDate = new Date()
      someDate.setDate(someDate.getDate() + this.state.fridgeAlert.days_to_exp )
      someDate.setHours(0,0,0,0)
      await this.itemEditExpDate(this.state.fridgeAlert.id, someDate)
    }
    
    if (this.state.fridgeAlert.quantity !== -1) await this.itemEditQuant(this.state.fridgeAlert.id, this.state.fridgeAlert.quantity)

    this.setState({
      updateLoading: false,
      fridgeAlert: {
        visible: false,
        id: -1, 
        days_to_exp: undefined,
        quantity: -1, 
        food_name: '',
        expiration_date: undefined,
      } 
    })
  }

  async itemEditExpDate(id: number, expiration_date: Date | undefined) {
    // formatting for expiration date
    let momented = (!expiration_date) ? undefined : moment(expiration_date).format('YYYY-MM-DD')
    let editted_fridge = this.state.fridgeItems
    const index = editted_fridge.findIndex(ele => ele.id === id)
    editted_fridge[index].expiration_date = expiration_date
    editted_fridge.sort((a, b) => {
      if (!b.expiration_date) return -1
      else if (!a.expiration_date) return 1
      else if (new Date(a.expiration_date) > new Date(b.expiration_date)) return 1
      else if (new Date(b.expiration_date) > new Date(a.expiration_date)) return -1
      else if (a.food.food_name > b.food.food_name) return 1
      else if (a.food.food_name < b.food.food_name) return -1
      else if (a.quantity > b.quantity) return -1
      else if (a.quantity < b.quantity) return 1
      else if (a.id > b.id) return 1
      return -1 })
      
    this.setState({
      fridgeItems: editted_fridge
    })
    this.arrayholder = editted_fridge

    // hit api to update fridge item's expiration date
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_fridge/${this.state.user_id}/${id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify({ expiration_date: momented })
    })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // update AsyncStorage with setState after above fetch is successful
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(editted_fridge))
    } catch (e) {
      console.error(e)
      return
    } 
  }

  async itemEditQuant(id: number, quantity: number) {
    // change editted item in setState and re-sort
    let editted_fridge = this.state.fridgeItems
    const index = editted_fridge.findIndex(ele => ele.id === id)
    editted_fridge[index].quantity = quantity
    this.setState({
      fridgeItems: editted_fridge
    })
    this.arrayholder = editted_fridge

    // hit api to update fridge item's quantity
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_fridge/${this.state.user_id}/${id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify({ quantity: quantity })
    })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // update AsyncStorage with setState after above fetch is successful
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(editted_fridge))
    } catch (e) {
      console.error(e)
      return
    } 
  }

  async itemWasted(id: number) {
    // locate the item that has been wasted for its food group, default is zero index (should throw error instead)
    let find_food = this.state.fridgeItems.find((item) => item.id === id)
    let food_group = (find_food) ? find_food.food.food_group.food_group_id : 0

    // update body based on which food group the item falls under
    let body = { wasted_count: (!this.state.wasted_count) ? 1 : this.state.wasted_count + 1 }
    if (food_group == 2) body['produce_wasted'] = this.state.produce_wasted + 1
    else if (food_group == 8) body['dairy_wasted'] = this.state.dairy_wasted + 1
    else if (food_group == 3) body['meat_wasted'] = this.state.meat_wasted + 1

    // remove item from fridge and edit wasted_count in setState
    this.setState({
      updateLoading: true,
      fridgeItems: this.state.fridgeItems.filter(item => item.id !== id),
      wasted_count: this.state.wasted_count + 1,
      deleteAlert: {
        visible: false,
        id: -1,
      }
    })
    this.arrayholder = this.arrayholder.filter(item => item.id !== id)

    // hit api to delete fridge item that has been wasted
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_fridge/${this.state.user_id}/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });
    
    // hit api to update metric data with wasted counts
    let metric_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/metric_data/${this.state.user_id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          fridgeItems: this.state.fridgeItems.filter(item => item.id !== id),
          wasted_count: data.wasted_count,
          updateLoading: false,
        })
        this.arrayholder = this.state.fridgeItems.filter(item => item.id !== id)
        return data
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });
    
      // set AsyncStorage after requests are successful (wasted_count, food_group_wasted, fridge)
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(this.state.fridgeItems))
      AsyncStorage.setItem('@metric_data', JSON.stringify(metric_data))
    } catch (e) {
      console.error(e)
      return
    } 
  }

  async itemEaten(id: number) {
    // remove item from fridge and edit eaten_count in setState
    this.setState({
      fridgeItems: this.state.fridgeItems.filter(item => item.id !== id),
      updateLoading: true,
      eaten_count: this.state.eaten_count + 1,
      deleteAlert: {
        visible: false,
        id: -1,
      },
    })
    this.arrayholder = this.arrayholder.filter(item => item.id !== id)
    // hit api to delete eaten item from fridge
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_fridge/${this.state.user_id}/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // hit api to update metric data to increment eaten count
    let metric_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/metric_data/${this.state.user_id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify({
        eaten_count: this.state.eaten_count + 1
      })
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          fridgeItems: this.state.fridgeItems.filter(item => item.id !== id),
          eaten_count: data.eaten_count,
          updateLoading: false,
        })
        this.arrayholder = this.state.fridgeItems.filter(item => item.id !== id)
        return data
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // set AsyncStorage after requests are successful (eaten_count, fridge)
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(this.state.fridgeItems))
      AsyncStorage.setItem('@metric_data', JSON.stringify(metric_data))
    } catch (e) {
      console.error(e)
      return
    } 
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
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



  EditDialog() {
    return (
      <View>
      <Dialog.Container visible={this.state.fridgeAlert.visible || this.state.deleteAlert.visible}>
      <Dialog.Title>Edit {this.state.fridgeAlert.food_name}</Dialog.Title>
        <Dialog.Input
          keyboardType="number-pad"
          textAlign="center"
          placeholder="Days until this item expires"
          placeholderTextColor='#696969'
          autoCapitalize='none'
          defaultValue={''}
          onChangeText={text => 
            this.setState({ fridgeAlert: {
              visible: true, 
              id: this.state.fridgeAlert.id, 
              quantity: this.state.fridgeAlert.quantity, 
              days_to_exp: (!isNaN(Number(text))) ? parseInt(text) : 1,
              expiration_date: this.state.fridgeAlert.expiration_date,
              food_name: this.state.fridgeAlert.food_name
            }})} />
        <Dialog.Input
          keyboardType="number-pad"
          textAlign="center"
          placeholder="Quantity of this item"
          placeholderTextColor='#696969'
          autoCapitalize='none'
          defaultValue={''}
          onChangeText={text => 
            this.setState({ fridgeAlert: {
              visible: true, 
              id: this.state.fridgeAlert.id, 
              quantity: (!isNaN(Number(text))) ? parseInt(text) : 1,
              days_to_exp: this.state.fridgeAlert.days_to_exp,
              expiration_date: this.state.fridgeAlert.expiration_date,
              food_name: this.state.fridgeAlert.food_name
            }})} />
        
        <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={() => 
        this.setState({ fridgeAlert: {
              visible: false, 
              id: -1, 
              quantity: -1, 
              days_to_exp: undefined,
              expiration_date: undefined,
              food_name: ''
            } })} />
        <Dialog.Button disabled={this.state.updateLoading} label="Delete" onPress={async () => {
            let id = this.state.fridgeAlert.id
            await this.setState({ 
              fridgeAlert: {
                visible: false, 
                id: -1, 
                quantity: -1, 
                days_to_exp: undefined,
                expiration_date: undefined,
                food_name: ''
              } })
              this.setState({
                deleteAlert: {
                  visible: true, 
                  id: id 
              }}) } } />
        <Dialog.Button disabled={this.state.updateLoading} label="Save" onPress={this.saveEdit} />
      </Dialog.Container>
    </View>
    )
  }

  DeleteDialog() {
    return (
      <View>
        <Dialog.Container visible={this.state.deleteAlert.visible}>
          <Dialog.Title>Delete</Dialog.Title>
          <Dialog.Description>Did you eat this food item or waste it?</Dialog.Description>
          <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={() => this.setState({ deleteAlert: {visible: false, id: -1 } })} />
          <Dialog.Button disabled={this.state.updateLoading} label="Wasted" onPress={() => this.itemWasted(this.state.deleteAlert.id)} />
          <Dialog.Button disabled={this.state.updateLoading} label="Eaten" onPress={() => this.itemEaten(this.state.deleteAlert.id)} />
        </Dialog.Container>
      </View>
    )
  }

  FridgeRender(item) {
    // rendering for flat list of fridge items
    return (
      <FridgeItem
        selected={false}
        disabled={this.state.updateLoading}
        id={item.id}
        item={item} 
        modalUpdateFunc={this.fridgeAlertTrigger}
        swipeStart={this.OnSwipeNoScroll}
        swipeEnd={this.OnSwipeScroll}
        swipeLeftFunc={this.itemWasted}
        swipeRightFunc={this.itemEaten}
      />
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()
    if (this.state.errorText !== '') return this.errorMessage()
    
    return (
      <View style={styling.container}>
        <View style={styling.flexRow}>
          <SearchBar
            onChangeText={text => this.SearchFilterFunction(text)}
            onClear={this.SearchFilterFunction}
            value={this.state.search}
            platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
            {...this.searchBarProps}
          />
          <View style={styling.addButton}>
            <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={() => {
              this.props.navigation.navigate('AddFridgeItemScreen', {trigger: this.state.trigger})
              }}>
              <AntDesign name="plus" style={styling.iconSize} color="black"/>
            </TouchableWithoutFeedback>
          </View>
        </View>
        {this.state.updateLoading ? (<ActivityIndicator style={styling.activityMargin} />) : (<View></View>)}
        <ScrollView scrollEnabled={!this.state.swipingAction} showsVerticalScrollIndicator={false}>
          <FlatList
            scrollEnabled={!this.state.swipingAction}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={this.state.fridgeItems}
            renderItem={({ item }) => this.FridgeRender(item)}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
        <View>
          {this.EditDialog()}
          {this.DeleteDialog()}
        </View>
      </View>
    );
  }
}

