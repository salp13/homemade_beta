import * as React from 'react';
import { StyleSheet, Platform, TouchableWithoutFeedback, FlatList, ScrollView, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SearchBar as SearchBarElement } from 'react-native-elements'
import Swipeable from 'react-native-swipeable';
import { MaterialCommunityIcons, AntDesign, Foundation } from '@expo/vector-icons'
import DraggableFlatList from 'react-native-draggable-flatlist'
import SwipeableItem from 'react-native-swipeable-item'
import SortableListView from 'react-native-sortable-list'
import { Text, View, SearchBar } from '../components/Themed';
import dummyData from "../dummyData.json";
import { ShoppingListParamList } from '../types';
import ShoppingListModal from '../components/ShoppingListModal'

type food = {
  id: string
  title: string
}

interface Props {
  navigation: StackNavigationProp<ShoppingListParamList, 'ShoppingListScreen'>,
  route: RouteProp<ShoppingListParamList, 'ShoppingListScreen'>
}

interface State {
  shoppingListItems: Array<food>
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

  componentDidMount() {
    const shoppingListDeepCopy = JSON.parse(JSON.stringify(dummyData.dummyShoppingListItems))
    this.setState({
      shoppingListItems: shoppingListDeepCopy,
    })
    this.arrayholder = shoppingListDeepCopy
    
    // get all items in shopping list 
  }

  SearchFilterFunction(text: string = '') {
    const filteredData = this.arrayholder.filter(function(item: any) {
      const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      shoppingListItems: filteredData,
      search: text,
    });
  }

  modalUpdate(index: number | undefined) {
    this.setState({
      modal: {
        visible: true, 
        index: index, 
      }
    })
  }

  modalResult(index: number, action?: string) {
    if (action === "addFridge") this.itemAddFridge(index)
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

  itemRemove(index: number | undefined) {
    const replaceShoppingListItems = this.state.shoppingListItems
    if (!index) return
    replaceShoppingListItems.splice(index, 1)
    this.setState({
      shoppingListItems: replaceShoppingListItems,
      modal: {
        visible: false, 
        index: undefined,
      },
    })
    // TODO: delete item from shopping list in database
  }

  itemAddFridge(index: number | undefined) {
    const replaceShoppingListItems = this.state.shoppingListItems
    if (!index) return
    replaceShoppingListItems.splice(index, 1)
    this.setState({
      shoppingListItems: replaceShoppingListItems,
      modal: {
        visible: false, 
        index: undefined,
      },
    })

    // TODO: delete item from shopping list in database
    // TODO: add item to fridge in database 
  }


  render() {
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
                            <Text style={styles.itemName}>{item.title}</Text>
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
                          onLeftActionComplete={() => this.itemRemove(index)}
                          onRightActionComplete={() => this.itemAddFridge(index)}
                          onSwipeStart={this.OnSwipeNoScroll}
                          onSwipeEnd={this.OnSwipeScroll}
                          >
                          <TouchableWithoutFeedback>
                              <View style={{flexDirection: 'row', marginVertical: 15}}>
                                  <Text style={styles.itemName}>{item.title}</Text>
                                  <View style={styles.menuIcon}>
                                    <TouchableWithoutFeedback onPress={() => this.modalUpdate(index)}>
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
    BUG
      - first item not registering swipe
    FUNCTIONALITY
      - reorder
      - go to add item page should already have keyboard up and ready to search 
      - searching through list should be able to:
        - click on three dots and go to modal when keyboard was up
        - swipe on items 
    DESIGN
      - modal

  BE-TODO
    REQUESTS
      - get all shopping list items
      - delete item from shopping list in database
      - add item to fridge in database
*/