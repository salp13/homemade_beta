import * as React from 'react';
import { ActivityIndicator, Platform, FlatList, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { RouteProp } from '@react-navigation/native';
import { SearchBar as SearchBarElement } from 'react-native-elements'
import { SearchBar, Text, View, Image } from '../components/Themed';
import { fridgeItemType, shoppingListItemType } from '../objectTypes'
import { ShoppingListParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import Swipeable from 'react-native-swipeable';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from 'react-native-dialog'
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  navigation: StackNavigationProp<ShoppingListParamList, 'ShoppingListScreen'>,
  route: RouteProp<ShoppingListParamList, 'ShoppingListScreen'>
}

interface State {
  isLoading: boolean
  updateLoading: boolean
  token: string
  user_id: string
  trigger: boolean
  draggable: boolean
  swipingAction: boolean
  shoppingListItems: Array<shoppingListItemType>
  food_groups: Array<any>
  search: string
  listAlert: {
    visible: boolean
    food_name: string
    index: number
    quantity: number
    addFridge: boolean
  }
  fridgeAlert: {
    visible: boolean
    quantity: string
    current_quantity: number
    food_name: string
    food_id: string
    add_to_existing: boolean
    unlisted: boolean
  }
  fridgeItems: Array<fridgeItemType>
  total_items: number 
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class ShoppingListScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Search your shopping list...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: [styling.searchBarContainerStyle, {width: '80%'}],
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
      token: '', 
      user_id: '', 
      trigger: false,
      draggable: false,
      swipingAction: false,
      shoppingListItems: [],
      food_groups: [],
      search: '',
      listAlert: {
        visible: false,
        food_name: '', 
        index: -1,
        quantity: -1,
        addFridge: false,
      },
      fridgeAlert: {
        visible: false,
        quantity: '',
        current_quantity: 0,
        food_name: '',
        food_id: '',
        add_to_existing: true,
        unlisted: false,
      },
      fridgeItems: [],
      total_items: 0,
    };
    this.arrayholder = [];

    this.SearchFilterFunction = this.SearchFilterFunction.bind(this)
    this.modalUpdate = this.modalUpdate.bind(this)
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.itemReorder = this.itemReorder.bind(this)
    this.itemRemove = this.itemRemove.bind(this)
    this.itemAddFridge = this.itemAddFridge.bind(this)
    this.itemEditQuant = this.itemEditQuant.bind(this)
    this.stopReorder = this.stopReorder.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.DraggableListRender = this.DraggableListRender.bind(this)
    this.SwipableListRender = this.SwipableListRender.bind(this)
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

    await AsyncStorage.getItem('@food_groups')
    .then( food_groups => {
      if (food_groups && JSON.parse(food_groups).length !== 0) this.setState({ food_groups: JSON.parse(food_groups) })
      else {
        // hit api for all foods excluding the unlisted food item
        fetch(`https://homemadeapp.azurewebsites.net/homemade/admin_food_group`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + this.state.token,
          },
        })
        .then(response => response.json())
        .then(data => {
          this.setState({ food_groups: data })
          try { AsyncStorage.setItem('@food_groups', JSON.stringify(data)) }
          catch (e) { console.error(e) }
        })
        .catch(error => { console.error(error); });
      }
    })

    await AsyncStorage.getItem('@shopping_list')
      .then((data) => { 
        if (data) {
          let parsed_data = JSON.parse(data)
          this.setState({ 
            shoppingListItems: parsed_data,
            isLoading: false,
        })}
      })

    // get fridge_data from asyncstorage
    await AsyncStorage.getItem('@fridge_data')
    .then( data => {if (data) return JSON.parse(data)})
    .then( parsed_data => {
      if (parsed_data) { 
        this.setState({ fridgeItems: parsed_data })
      }}
    )

    await AsyncStorage.getItem('@metric_data')
    .then( data => {
      if (data) {
        let parsed_data = JSON.parse(data)
        this.setState({ total_items: parsed_data.total_items })
      }
    })

    // hit api to get shopping list and order as specified
    const data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => {
        data.sort((a,b) => (a.order_index > b.order_index) ? 1 : -1)
        this.arrayholder = data
        this.setState({
          isLoading: false,
          shoppingListItems: data,
        })
        return data
      })
      .catch(error => {
        console.error(error);
      });

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
      .then(data => { return data })
      .catch(error => { console.error(error); });

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
          this.setState({ fridgeItems: fridgeData, total_items: data.total_items })
          return data
        })
        .catch(error => { console.error(error); });
  
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(fridgeData))
      AsyncStorage.setItem('@metric_data', JSON.stringify(metric_data))
      AsyncStorage.setItem('@shopping_list', JSON.stringify(data))
    } catch (e) {
      console.error(e)
    }
    }

  async componentDidUpdate() {
    // if old and new triggers do not match, update shopping list and sort as specified
    if (this.state.trigger !== this.props.route.params.trigger) {
      const data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      })
        .then(response => response.json())
        .then(data => {
          data.sort((a,b) => (a.order_index > b.order_index) ? 1 : -1)
          this.arrayholder = data
          this.setState({
            shoppingListItems: data,
            trigger: this.props.route.params.trigger,
          })
          return data
        })
        .catch(error => {
          console.error(error);
        });

      // update AsyncStorage after above fetch is successful
      try {
        AsyncStorage.setItem('@shopping_list', JSON.stringify(data))
      } catch (e) {
        console.error(e)
        return
      } 
    }
  }

  SearchFilterFunction(text: string = '') {
    // filter shopping list based on search text
    const filteredData = this.arrayholder.filter(function(item: any) {
      const itemData = item.unlisted_food ? item.unlisted_food.toUpperCase() :item.food.food_name.toUpperCase()
      const textData = text.toUpperCase()
      let lenientData = ''
      if (textData != '') lenientData = " " + textData
      return itemData.startsWith(textData) || itemData.includes(lenientData);
    });

    this.setState({
      shoppingListItems: filteredData,
      search: text,
    });
  }

  modalUpdate(id: number) {
    let item = this.state.shoppingListItems.find(element => element.id == id)
    if (item) {
      let food_name = (item.unlisted_food) ? item.unlisted_food : item?.food.food_name

      this.setState({
        listAlert: {
          visible: true,
          food_name: food_name,
          index: id,
          quantity: item.quantity,
          addFridge: false
        }
      })
    }
    
  }

  OnSwipeNoScroll() {
    this.setState({
      swipingAction: true,
    })
  }

  OnSwipeScroll() {
    this.setState({
      swipingAction: false,
    })
  }

  itemReorder() {
    // set state to allow for item reorder
    this.setState({
      listAlert: {
        visible: false,
        food_name: '',
        index: -1, 
        quantity: -1,
        addFridge: false,
      },
      draggable: true,
    })
  }

  stopReorder() {
    // iterate over this.state.shoppingListItems and assign order_index to the index in the array
    let placeholderListItems = this.state.shoppingListItems.map((value, index) => {
      value.order_index = index
      return value
    })

    // hit api with new updating shopping list ordering
    fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
        body: JSON.stringify(placeholderListItems)
      })
        .catch(error => {
          console.error(error);
        });

      this.arrayholder = placeholderListItems
      this.setState({
        draggable: false,
        shoppingListItems: placeholderListItems
      })

      // update AsyncStorage after above fetch is successful
    try {
      AsyncStorage.setItem('@shopping_list', JSON.stringify(placeholderListItems))
    } catch (e) {
      console.error(e)
      return
    } 
  }

  async itemRemove(id: number) {
    // update order indices for deleted item
    let deleteIndex = this.state.shoppingListItems.findIndex((value) => value.id === id)
    let placeholderListItems = this.state.shoppingListItems.map((value, index) => {
      if (index > deleteIndex) {
        value.order_index--
      }
      return value
    })

    this.setState({
      updateLoading: true,
      listAlert: {
        visible: false,
        food_name: '',
        index: -1, 
        quantity: -1,
        addFridge: false,
      }
    })

    // hit api to delete specified item
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_shopping_list/${this.state.user_id}/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .catch(error => {
        console.error(error);
      });

    placeholderListItems = placeholderListItems.filter(item => item.id !== id)

    // hit api to update other shopping list items' order indices
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify(placeholderListItems)
    })
      .catch(error => {
        console.error(error);
      });

    this.setState({
      shoppingListItems: placeholderListItems,
      updateLoading: false,
    })
    this.arrayholder = placeholderListItems

    // update AsyncStorage after above fetch is successful
    try {
      AsyncStorage.setItem('@shopping_list', JSON.stringify(placeholderListItems))
    } catch (e) {
      console.error(e)
      return
    } 
  }

  async itemAddFridge() {
    this.setState({ updateLoading: true })
    const id = this.state.fridgeAlert.food_id
    const food_name = this.state.fridgeAlert.food_name

    const many_existing = this.state.fridgeItems.filter(item => {
      if (!item.unlisted_food) return item.food.food_name === this.state.fridgeAlert.food_name
      return item.unlisted_food === this.state.fridgeAlert.food_name
    })

    const existing = (many_existing) ? many_existing.sort((a,b) => {
      if (a.expiration_date && b.expiration_date && a.expiration_date > b.expiration_date) return -1 
      else return 1
    })[0] : undefined

    // if adding to an existing fridge item
    if (this.state.fridgeAlert.add_to_existing && existing) {
      let editted_fridge = this.state.fridgeItems 
      let new_quant = (!isNaN(Number(this.state.fridgeAlert.quantity))) ? parseInt(this.state.fridgeAlert.quantity) : 1
      const editted_quantity = new_quant + existing.quantity
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
        });
        
      this.setState({
        fridgeItems: editted_fridge,
        total_items: this.state.total_items + 1,
        updateLoading: false,
        fridgeAlert: {
          quantity: "",
          current_quantity: 0,
          food_name: "",
          food_id: "",
          visible: false,
          add_to_existing: true,
          unlisted: false
        }
      })
    } else {
      // if creating new fridge item
      let body = (this.state.fridgeAlert.unlisted) ? 
        JSON.stringify({food: id, unlisted_food: food_name, quantity: this.state.fridgeAlert.quantity}) : 
        JSON.stringify({food: id, quantity: this.state.fridgeAlert.quantity})
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
        });
        
      this.setState({
        fridgeItems: this.state.fridgeItems.concat([fridge_item]),
        total_items: this.state.total_items + 1,
        updateLoading: false,
        fridgeAlert: {
          quantity: "",
          current_quantity: 0,
          food_name: "",
          food_id: "",
          visible: false,
          add_to_existing: true,
          unlisted: false,
        }
      })
    }

    // set changes to AsyncStorage
    try {
      AsyncStorage.setItem('@fridge_data', JSON.stringify(this.state.fridgeItems))
    } catch (e) {
      console.error(e)
    } 
  }

  async itemEditQuant(id: number, quantity: number) {
    // change editted item in setState and re-sort
    let editted_shopping_list = this.state.shoppingListItems
    const index = editted_shopping_list.findIndex(ele => ele.id === id)
    editted_shopping_list[index].quantity = quantity
    this.setState({
      updateLoading: true,
      listAlert: {
        visible: false, 
        food_name: '',
        index: -1,
        quantity: -1,
        addFridge: false,
      },
      shoppingListItems: editted_shopping_list,
    })
    this.arrayholder = editted_shopping_list

    // hit api to add item to fridge
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_shopping_list/${this.state.user_id}/${id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify({quantity: quantity})
    })
      .catch(error => {
        console.error(error);
      });

    this.setState({ updateLoading: false })

    // update AsyncStorage after above fetch is successful
    try {
      AsyncStorage.setItem('@shopping_list', JSON.stringify(editted_shopping_list))
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

  DraggableListRender(item, drag) {
    let quantity = `  (${item.quantity})`
    let food_group = this.state.food_groups.find(food_group => { return ( food_group.food_group_id === item.food.food_group )})
    let image_uri = (food_group) ? food_group.image : ''

    return (
      <View>
        <TouchableWithoutFeedback disabled={this.state.updateLoading} onLongPress={drag}>
            <View style={styling.shoppingListElement}>
              <View style={styling.imageContainerNoBorderMarginLeft}>
                <Image style={styling.foodGroupImage} source={{ uri: image_uri }}/>
              </View>
              {item.unlisted_food ? 
              <Text style={styling.shoppingListText}>{item.unlisted_food} {quantity}</Text> : 
              <Text style={styling.shoppingListText}>{item.food.food_name} {quantity}</Text>}
                <View style={styling.autoLeft}>
                    <MaterialIcons name="drag-handle" style={styling.iconSize}/>
                </View>
            </View>
          </TouchableWithoutFeedback>
      </View>
    )
  }

  SwipableListRender(item) {
    let quantity = `  (${item.quantity})`
    let food_group = this.state.food_groups.find(food_group => { return ( food_group.food_group_id === item.food.food_group )})
    let image_uri = (food_group) ? food_group.image : ''
    return (
      <View>
        <Swipeable
          disabled={this.state.updateLoading}
          keyboardShouldPersistTaps='always'
          leftActionActivationDistance={70}
          rightActionActivationDistance={70}
          rightContent={(this.state.updateLoading) ? null : (<View style={styling.rightSwipeItem}></View>)}
          leftContent={(this.state.updateLoading) ? null : (<View style={styling.leftSwipeItem}></View>)}
          onLeftActionComplete={() => this.itemRemove(item.id)}
          onRightActionComplete={() => {
            this.itemRemove(item.id)
            let food_name = (item.unlisted_food) ? item.unlisted_food : item.food.food_name
            let fridge_item = this.state.fridgeItems.find(item => { return (item.food.food_id === item.food.food_id) })

            this.setState({
              fridgeAlert: {
                visible: true,
                quantity: item.quantity.toString(),
                current_quantity: (fridge_item) ? fridge_item.quantity : 0,
                food_name: food_name,
                food_id: item.food.food_id,
                add_to_existing: true,
                unlisted: (item.unlisted_food) ? true : false,
              }
            })
          }}
          onSwipeStart={this.OnSwipeNoScroll}
          onSwipeRelease={this.OnSwipeScroll}
          >
          <TouchableWithoutFeedback disabled={this.state.updateLoading}>
              <View style={styling.shoppingListElement}>
              <View style={styling.imageContainerNoBorderMarginLeft}>
                <Image style={styling.foodGroupImage} source={{ uri: image_uri }}/>
              </View>
              {item.unlisted_food ? 
                <Text style={styling.shoppingListText}>{item.unlisted_food} {quantity}</Text> : 
                <Text style={styling.shoppingListText}>{item.food.food_name} {quantity}</Text>}
                  <View style={styling.autoLeft}>
                    <TouchableWithoutFeedback onPress={() => this.modalUpdate(item.id)}>
                      <MaterialCommunityIcons name="dots-horizontal" style={styling.iconSize}/>
                    </TouchableWithoutFeedback>
                  </View>
              </View>
            </TouchableWithoutFeedback>
        </Swipeable>
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    return (
      <View style={styling.container}>
        { this.state.draggable ? (
            <View style={styling.setFlex}>
              {(this.state.updateLoading) ? (<ActivityIndicator/>) : (<View></View>)}
              <DraggableFlatList
                keyboardShouldPersistTaps='always'
                scrollEnabled={!this.state.swipingAction}
                data={this.state.shoppingListItems}
                renderItem={({ item, index, drag }) => this.DraggableListRender(item, drag)}
                keyExtractor={(item, index) => index.toString()}
                onDragEnd={({data}) => this.setState({shoppingListItems: data})}
                  />
               <TouchableWithoutFeedback onPress={this.stopReorder}>
                  <Text style={styling.buttonTextLargeRight}>Save</Text>
               </TouchableWithoutFeedback>
              </View>
           ) : (
             <View style={styling.setFlex}>
              <View style={styling.flexRow}>
                <SearchBar
                  onChangeText={text => this.SearchFilterFunction(text)}
                  onClear={this.SearchFilterFunction}
                  value={this.state.search}
                  platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
                  {...this.searchBarProps}
                />
                <View style={[styling.addButton, styling.marginRight10]}>
                  <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={this.itemReorder}>
                  <MaterialIcons name="drag-handle" style={styling.iconSize}/>
                  </TouchableWithoutFeedback>
                </View>
                <View style={styling.addButton}>
                  <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={() => this.props.navigation.navigate('AddShoppingListItemScreen', { orderNumber: this.state.shoppingListItems.length, trigger: this.state.trigger })}>
                    <AntDesign name="plus" style={styling.iconSize} color="black"/>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              {(this.state.updateLoading) ? (<ActivityIndicator/>) : (<View></View>)}
              <ScrollView scrollEnabled={!this.state.swipingAction} showsVerticalScrollIndicator={false}>
                <FlatList
                  keyboardShouldPersistTaps='always'
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={!this.state.swipingAction}
                  data={this.state.shoppingListItems}
                  renderItem={({ item, index }) => this.SwipableListRender(item)}
                  keyExtractor={(item, index) => index.toString()}
                  />
              </ScrollView>
            </View>
          )}
          <View>
          <Dialog.Container visible={this.state.listAlert.visible}>
            <Dialog.Title>Edit {this.state.listAlert.food_name}</Dialog.Title>
            <Dialog.Input
              keyboardType="number-pad"
              textAlign="center"
              placeholder="quantity of this item"
              placeholderTextColor='#696969'
              autoCapitalize='none'
              defaultValue={''}
              onChangeText={text => this.setState({
                listAlert: {
                  visible: true,
                  food_name: this.state.listAlert.food_name,
                  index: this.state.listAlert.index,
                  quantity: (!isNaN(Number(text))) ? parseInt(text) : 1,
                  addFridge: this.state.listAlert.addFridge
                }
              })} />
              <Dialog.Switch
                label="On removal, would you like this item to be added to your fridge?"
                value={this.state.listAlert.addFridge}
                onValueChange={() => this.setState({
                  listAlert: {
                    visible: true,
                    food_name: this.state.listAlert.food_name,
                    index: this.state.listAlert.index,
                    quantity: this.state.listAlert.quantity,
                    addFridge: !this.state.listAlert.addFridge
                  }
                })}
              />
              <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={() => {this.setState({
                listAlert: {
                  visible: false,
                  food_name: '',
                  index: -1,
                  quantity: -1,
                  addFridge: false
                }
              })}} />
              <Dialog.Button disabled={this.state.updateLoading} label="Delete" onPress={ async () => {
                if (this.state.listAlert.addFridge) {
                  let item = this.state.shoppingListItems.find(item => {return (item.id === this.state.listAlert.index)})
                  let fridge_item = this.state.fridgeItems.find(item => {
                    if (!item.unlisted_food) return item.food.food_name === this.state.fridgeAlert.food_name
                    return item.unlisted_food === this.state.fridgeAlert.food_name
                  })
                  const fridgeAlert = {
                    visible: true,
                    quantity: this.state.listAlert.quantity.toString(),
                    current_quantity: (fridge_item) ? fridge_item.quantity : 0,
                    food_name: this.state.listAlert.food_name,
                    food_id: (item) ? item.food.food_id : '',
                    add_to_existing: true,
                    unlisted: (item && item.unlisted_food) ? true : false,
                  }
                  await this.setState({updateLoading: true})
                  await this.itemRemove(this.state.listAlert.index)
                  await this.setState({ fridgeAlert: fridgeAlert, updateLoading: false, })
                }
                else if (this.state.listAlert.index) this.itemRemove(this.state.listAlert.index)} } />
              <Dialog.Button disabled={this.state.updateLoading} label="Save" onPress={() => this.itemEditQuant(this.state.listAlert.index, this.state.listAlert.quantity)} />
      </Dialog.Container>
      <Dialog.Container visible={this.state.fridgeAlert.visible}>
            <Dialog.Title>Add {this.state.fridgeAlert.food_name} to your fridge</Dialog.Title>
            <Dialog.Input
              keyboardType="number-pad"
              textAlign="center"
              placeholder="quantity of this item"
              placeholderTextColor='#696969'
              autoCapitalize='none'
              onChangeText={text => this.setState({fridgeAlert: {
                visible: true,
                quantity: text,
                current_quantity: this.state.fridgeAlert.current_quantity,
                food_name: this.state.fridgeAlert.food_name,
                food_id: this.state.fridgeAlert.food_id,
                add_to_existing: this.state.fridgeAlert.add_to_existing,
                unlisted: this.state.fridgeAlert.unlisted,
              }})}
              defaultValue={this.state.fridgeAlert.quantity} />
            {!this.state.fridgeItems.find(item => {
              if (!item.unlisted_food) return item.food.food_name === this.state.fridgeAlert.food_name
              return item.unlisted_food === this.state.fridgeAlert.food_name
            }) ? 
            (<View></View>) : 
            (<Dialog.Switch
              label={`Do you want to add this onto existing ${this.state.fridgeAlert.food_name} (${this.state.fridgeAlert.current_quantity}) in your fridge`}
              value={this.state.fridgeAlert.add_to_existing}
              onValueChange={() => { 
                this.setState({ fridgeAlert: {
                  visible: true,
                  quantity: this.state.fridgeAlert.quantity,
                  current_quantity: this.state.fridgeAlert.current_quantity,
                  food_name: this.state.fridgeAlert.food_name,
                  food_id: this.state.fridgeAlert.food_id,
                  add_to_existing: !this.state.fridgeAlert.add_to_existing,
                  unlisted: this.state.fridgeAlert.unlisted,
                } }) }}
            />)}
            <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={() => { 
              this.setState({ fridgeAlert: {
                visible: false,
                quantity: '',
                current_quantity: 0,
                food_name: '',
                food_id: '',
                add_to_existing: true,
                unlisted: false,
              } })}} />
            <Dialog.Button disabled={this.state.updateLoading} label="Add Fridge" onPress={this.itemAddFridge} />
          </Dialog.Container>
          </View>
      </View>
    )
  }
}