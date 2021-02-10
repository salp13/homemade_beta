import * as React from 'react';
import { ActivityIndicator, StyleSheet, Platform, TouchableWithoutFeedback, FlatList, ScrollView, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SearchBar as SearchBarElement } from 'react-native-elements'
import Swipeable from 'react-native-swipeable';
import { MaterialCommunityIcons, AntDesign, Foundation } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Text, View, SearchBar } from '../components/Themed';
import dummyData from "../dummyData.json";
import { ShoppingListParamList } from '../types';
import ShoppingListModal from '../components/ShoppingListModal'

interface Props {
  navigation: StackNavigationProp<ShoppingListParamList, 'ShoppingListScreen'>,
  route: RouteProp<ShoppingListParamList, 'ShoppingListScreen'>
}

interface State {
  isLoading: boolean
  trigger: boolean
  shoppingListItems: Array<{
    id: number
    user: string
    food: {
      food_id: string
      food_name: string
      food_group: {
        food_group_id: string
        image: string | undefined
      }
    }
    unlisted_food: string | undefined
  }>
  search: string
  modal: {
    visible: boolean
    index: number | undefined
  }
  swipingAction: boolean
  draggable: boolean
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class HomeResultScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Search your shopping list...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: styles.searchBarContainerStyle,
    inputContainerStyle: styles.searchBarInputContainerStyle,
    inputStyle: styles.searchBarTextStyle,
    cancelButtonProps: {buttonTextStyle: {fontSize: 15}},
    reference: this.searchRef,
  }

  constructor(props: Props) {
    super(props);

    this.state = { 
      isLoading: true,
      trigger: false,
      shoppingListItems: [],
      search: '',
      modal: {
        visible: false,
        index: undefined
      },
      swipingAction: false,
      draggable: false,
    };
    this.arrayholder = [];

    this.SearchFilterFunction = this.SearchFilterFunction.bind(this)
    this.modalUpdate = this.modalUpdate.bind(this)
    this.modalResult = this.modalResult.bind(this)
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.itemReorder = this.itemReorder.bind(this)
    this.itemRemove = this.itemRemove.bind(this)
    this.itemAddFridge = this.itemAddFridge.bind(this)
    this.stopReorder = this.stopReorder.bind(this)
  }

  async componentDidMount() {
    await fetch('http://localhost:8000/homemade/many_shopping_list/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        this.arrayholder = data
        this.setState({
          isLoading: false,
          shoppingListItems: data,
        })
      })
      .catch(error => {
        console.error(error);
      });
  }

  componentDidUpdate() {
    console.log(`in fridge ${this.props.route.params.trigger}`)
    if (this.state.trigger !== this.props.route.params.trigger) {
      console.log("updating")
      return fetch('http://localhost:8000/homemade/many_shopping_list/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          this.arrayholder = data
          this.setState({
            shoppingListItems: data,
            trigger: this.props.route.params.trigger,
          })
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  SearchFilterFunction(text: string = '') {
    const filteredData = this.arrayholder.filter(function(item: any) {
      const itemData = item.food.food_name ? item.food.food_name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      shoppingListItems: filteredData,
      search: text,
    });
  }

  modalUpdate(id: number) {
    this.setState({
      modal: {
        visible: true, 
        index: id, 
      }
    })
  }

  modalResult(index: number, action?: string) {
    if (action === "addFridge") {
      let item = this.state.shoppingListItems.find(element => element.id == index)
      if (item) this.itemAddFridge(index, item.food.food_name, item.food.food_id)
    }
    else if (action === "remove") this.itemRemove(index)
    else if (action === "reorder") this.itemReorder()
    else {
      this.setState({
        modal: {
          visible: false,
          index: undefined,
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
    this.setState({
      modal: {
        visible: false, 
        index: undefined,
      },
      draggable: true,
    })
  }

  stopReorder() {
    this.setState({
      draggable: false,
    })
  }

  async itemRemove(id: number) {
    this.setState({
      // shoppingListItems: replaceShoppingListItems,
      modal: {
        visible: false, 
        index: undefined,
      },
    })
    // TODO: delete item from shopping list in database
    await fetch(`http://localhost:8000/homemade/single_shopping_list/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(data => {
      this.setState({
        modal: {
          visible: false, 
          index: undefined
        },
        shoppingListItems: this.state.shoppingListItems.filter(item => item.id !== id)
      })
      this.arrayholder = this.state.shoppingListItems.filter(item => item.id !== id)
    })
      .catch(error => {
        console.error(error);
      });
  }

  async itemAddFridge(id: number, food_name: string, food_id: string) {
    // const replaceShoppingListItems = this.state.shoppingListItems
    // replaceShoppingListItems.splice(index, 1)
    this.setState({
      // shoppingListItems: replaceShoppingListItems,
      modal: {
        visible: false, 
        index: undefined,
      },
    })

    // TODO: delete item from shopping list in database
    await fetch(`http://localhost:8000/homemade/single_shopping_list/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(data => {
      this.setState({
        modal: {
          visible: false, 
          index: undefined
        },
        shoppingListItems: this.state.shoppingListItems.filter(item => item.id !== id)
      })
      this.arrayholder = this.state.shoppingListItems.filter(item => item.id !== id)
    })
      .catch(error => {
        console.error(error);
      });

    // TODO: add item to fridge in database 
    let body
    if (food_name === 'unlisted_food') body = JSON.stringify({food: food_id, unlisted_food: food_name})
    else body = JSON.stringify({food: food_id})
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
        { this.state.draggable ? (
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', marginLeft: 'auto', marginVertical: 20}}>
              <TouchableWithoutFeedback onPress={this.stopReorder}>
                <Text style={{textDecorationLine: 'underline', fontSize: 15}}>done</Text>
              </TouchableWithoutFeedback>
            </View>
            <DraggableFlatList
              keyboardShouldPersistTaps='always'
              scrollEnabled={!this.state.swipingAction}
              data={this.state.shoppingListItems}
              renderItem={({ item, index, drag }) => {
                return (
                  <View>
                    <TouchableWithoutFeedback onLongPress={drag}>
                        <View style={{flexDirection: 'row', marginVertical: 15}}>
                            <Text style={styles.itemName}>{item.food.food_name}</Text>
                            <View style={styles.menuIcon}>
                                <Foundation name="list" size={25}/>
                            </View>
                        </View>
                      </TouchableWithoutFeedback>
                  </View>
              )}}
              keyExtractor={(item, index) => index.toString()}
              onDragEnd={({data}) => this.setState({shoppingListItems: data})}
                />
            </View>
           ) : (
             <View style={{flex: 1}}>
              <View style={{flexDirection: 'row'}}>
                <SearchBar
                  onChangeText={text => this.SearchFilterFunction(text)}
                  onClear={this.SearchFilterFunction}
                  value={this.state.search}
                  platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
                  {...this.searchBarProps}
                />
                <View style={{marginTop: 18, marginLeft: 10}}>
                  <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('AddShoppingListItemScreen')}>
                    <AntDesign name="plus" size={24} color="black"/>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              <ScrollView scrollEnabled={!this.state.swipingAction}>
                <FlatList
                  keyboardShouldPersistTaps='always'
                  scrollEnabled={!this.state.swipingAction}
                  data={this.state.shoppingListItems}
                  renderItem={({ item, index }) => {
                    return (
                      <View>
                        <Swipeable
                          keyboardShouldPersistTaps='always'
                          leftActionActivationDistance={70}
                          rightActionActivationDistance={70}
                          rightContent={(<View style={[styles.rightSwipeItem, {backgroundColor: '#96FFAF'}]}></View>)}
                          leftContent={(<View style={[styles.leftSwipeItem, {backgroundColor: '#FF6A6A'}]}></View>)}
                          onLeftActionComplete={() => this.itemRemove(item.id)}
                          onRightActionComplete={() => this.itemAddFridge(item.id, item.food.food_name, item.food.food_id)}
                          onSwipeStart={this.OnSwipeNoScroll}
                          onSwipeEnd={this.OnSwipeScroll}
                          >
                          <TouchableWithoutFeedback>
                              <View style={{flexDirection: 'row', marginVertical: 15}}>
                                {console.log(item)}
                                  <Text style={styles.itemName}>{item.food.food_name}</Text>
                                  <View style={styles.menuIcon}>
                                    <TouchableWithoutFeedback onPress={() => this.modalUpdate(item.id)}>
                                      <MaterialCommunityIcons name="dots-horizontal" size={25}/>
                                    </TouchableWithoutFeedback>
                                  </View>
                              </View>
                            </TouchableWithoutFeedback>
                        </Swipeable>
                      </View>
                  )}}
                  keyExtractor={(item, index) => index.toString()}
                  />
              </ScrollView>
            </View>
          )}
          <ShoppingListModal modalProperties={this.state.modal} ModalResultFunc={this.modalResult}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  searchBarContainerStyle: {
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    width: 335,
  },
  searchBarInputContainerStyle: {
    height: 35,
  },
  searchBarTextStyle: {
    fontSize: 15,
  },
  menuIcon:{
    marginLeft: 'auto',
  },
  itemName: {
    paddingLeft: 15,
    fontSize: 15,
  },
  leftSwipeItem: {
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
    left: -1,
    paddingRight: 20
  },
  rightSwipeItem: {
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 20
  },
});


/*
  FE-TODO
    FUNCTIONALITY
      - go to add item page should already have keyboard up and ready to search 
      - searching through list should be able to:
        - click on three dots and go to modal when keyboard was up
        - swipe on items 
    DESIGN
      - modal
*/