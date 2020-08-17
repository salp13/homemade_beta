import * as React from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Platform, ScrollView, TouchableWithoutFeedback} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { AntDesign } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import dummyData from '../dummyData.json'
import FridgeItem from '../components/FridgeItem'
import FridgeModal from '../components/FridgeModal'
import { FridgeParamList } from '../types'

interface Props {
  navigation: StackNavigationProp<FridgeParamList, 'FridgeScreen'>,
  route: RouteProp<FridgeParamList, 'FridgeScreen'>
}

interface State {
  isLoading: boolean
  search: string
  fridgeItems: Array<any>
  modal: {
    visible: boolean
    index: number | undefined
    daysToExp: number | undefined
  }
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
      fridgeItems: [],
      modal: {
        visible: false,
        index: undefined,
        daysToExp: undefined
      },
      swipingAction: false,
    };
    this.arrayholder = [];

    this.SearchFilterFunction = this.SearchFilterFunction.bind(this)
    this.modalUpdate = this.modalUpdate.bind(this)
    this.modalResult = this.modalResult.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.itemEditted = this.itemEditted.bind(this)
    this.itemWasted = this.itemWasted.bind(this)
    this.itemEaten = this.itemEaten.bind(this)
  }
  componentDidMount() {
    const fridgeItemsDeepCopy = JSON.parse(JSON.stringify(dummyData.dummyFridgeItems));

    this.setState({
      isLoading: false,
      fridgeItems: fridgeItemsDeepCopy
    })
    this.arrayholder = fridgeItemsDeepCopy

    // TODO: query for fridge items
  }

  SearchFilterFunction(text: string = '') {
    const filteredData = this.arrayholder.filter(function(item: any) {
      const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      fridgeItems: filteredData,
      search: text,
    });
  }

  modalUpdate(index: number) {

    this.setState({
      modal: {
        visible: true, 
        index: index, 
        daysToExp: this.state.fridgeItems[index].daysToExp
      }
    })
  }

  modalResult(index: number, action?: string, daysToExp?: number | undefined) {
    if (action === "wasted") this.itemWasted(index)
    else if (action === "eaten") this.itemEaten(index)
    else if (action === "edit") this.itemEditted(index, daysToExp)
    else {
      this.setState({
        modal: {
          visible: false,
          index: undefined,
          daysToExp: undefined,
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

  itemEditted(index: number, daysToExp: number | undefined) {
    if (daysToExp !== undefined) {
      const fridgeItemsDeepCopy = JSON.parse(JSON.stringify(this.state.fridgeItems));
      fridgeItemsDeepCopy[index].daysToExp = daysToExp
      console.log(fridgeItemsDeepCopy[index].daysToExp)
      this.setState({
        fridgeItems: fridgeItemsDeepCopy,
        modal: {
          visible: false,
          index: undefined,
          daysToExp: undefined
        }
      })
      // TODO: send put request with item's updated daysToExp
    }
  }

  itemWasted(index: number) {
    const replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems.splice(index, 1)
    this.setState({
      fridgeItems: replaceFridgeItems,
      modal: {
        visible: false, 
        index: undefined,
        daysToExp: undefined
      },
    })
    // TODO: delete item in fridge from database
    // TODO: update count for wasted food item 
  }

  itemEaten(index: number) {
    const replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems.splice(index, 1)
    this.setState({
      fridgeItems: replaceFridgeItems,
      modal: {
        visible: false, 
        index: undefined, 
        daysToExp: undefined
      },
    })
    // TODO: delete item in fridge from database
    // TODO: update count for eaten food item 
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
        <View style={{flexDirection: 'row'}}>
          <SearchBar
            onChangeText={text => this.SearchFilterFunction(text)}
            onClear={this.SearchFilterFunction}
            value={this.state.search}
            platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
            {...this.searchBarProps}
          />
          <View style={{marginTop: 18, marginLeft: 10}}>
            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('AddFridgeItemScreen')}>
              <AntDesign name="plus" size={24} color="black"/>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <ScrollView scrollEnabled={!this.state.swipingAction}>
          <FlatList
            scrollEnabled={!this.state.swipingAction}
            data={this.state.fridgeItems}
            renderItem={({ item, index }) => (
              <FridgeItem
                  item={item} 
                  index={index} 
                  modalUpdateFunc={this.modalUpdate}
                  swipeStart={this.OnSwipeNoScroll}
                  swipeEnd={this.OnSwipeScroll}
                  swipeLeftFunc={this.itemWasted}
                  swipeRightFunc={this.itemEaten}
                />
            )}
            style={{ marginTop: 10 }}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
        <FridgeModal modalProperties={this.state.modal} ModalResultFunc={this.modalResult}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 335,
  },
  searchBarInputContainerStyle: {
    height: 35,
  },
  searchBarTextStyle: {
    fontSize: 15,
  },
});



/*
  FE-TODO
    FEATURE
      - separate page for adding food item to fridge
    FUNCTIONALITY
      - implement ability to edit daysToExp
      - add plus icon for adding item to fridge
    DESIGN
      - fridge modal 
*/

/*
  BE-TODO
    - query for all fridge items
    - send put request with item's updated daysToExp
    - delete item in fridge from database
    - update count for wasted food item 
    - update count for eaten food item 
*/
