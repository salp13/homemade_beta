import * as React from 'react';
import moment from 'moment';
import { StyleSheet, FlatList, ActivityIndicator, Platform, ScrollView, TouchableWithoutFeedback} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { AntDesign } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import FridgeItem from '../components/FridgeItem'
import FridgeModal from '../components/FridgeModal'
import { FridgeParamList } from '../types'

interface Props {
  navigation: StackNavigationProp<FridgeParamList, 'FridgeScreen'>,
  route: RouteProp<FridgeParamList, 'FridgeScreen'>
}

interface State {
  isLoading: boolean
  trigger: boolean
  search: string
  wasted_count: number
  eaten_count: number
  fridgeItems: Array<{
    foodId: string
    foodName: string
    daysToExp: number | undefined
  }>
  formattedFridgeItems: Array<{
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
    expiration_date: Date | undefined
  }>
  modal: {
    visible: boolean
    index: number | undefined
    expiration_date: Date | undefined
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

  constructor(props: Props) {
    super(props);
    
    this.state = { 
      isLoading: true, 
      trigger: false,
      search: '',
      wasted_count: 0,
      eaten_count: 0,
      fridgeItems: [],
      formattedFridgeItems: [],
      modal: {
        visible: false,
        index: undefined,
        expiration_date: undefined
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

  async componentDidMount() {
    let fridgeData = await fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        this.arrayholder = data
        return data
      })
      .catch(error => {
        console.error(error);
      });

    return await fetch('http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
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
          formattedFridgeItems: fridgeData,
          wasted_count: data.wasted_count,
          eaten_count: data.eaten_count
        })
      })
      .catch(error => {
        console.error(error);
      });
  }

  componentDidUpdate() {
    // console.log(`in fridge ${this.props.route.params.trigger}`)
    if (this.state.trigger !== this.props.route.params.trigger) {
      console.log("updating")
      return fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
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
            formattedFridgeItems: data,
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
      formattedFridgeItems: filteredData,
      search: text,
    });
  }

  modalUpdate(index: number) {
    let obj = this.state.formattedFridgeItems.find(element => element.id == index)
    this.setState({
      modal: {
        visible: true, 
        index: index, 
        expiration_date: obj?.expiration_date
      }
    })
  }

  modalResult(index: number, action?: string, expiration_date?: Date | undefined) {
    if (action === "wasted") this.itemWasted(index)
    else if (action === "eaten") this.itemEaten(index)
    else if (action === "edit") this.itemEditted(index, expiration_date)
    else {
      this.setState({
        modal: {
          visible: false,
          index: undefined,
          expiration_date: undefined,
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

  itemEditted(index: number, expiration_date: Date | undefined) {
      console.log(expiration_date)
      let momented = moment(expiration_date).add(1, 'day').format('YYYY-MM-DD')
      return fetch(`http://localhost:8000/homemade/single_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${index}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiration_date: momented })
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          let newFridge = this.state.formattedFridgeItems
          newFridge[newFridge.findIndex(item => item.id === index)].expiration_date = expiration_date
          this.setState({
            modal: {
              visible: false, 
              index: undefined,
              expiration_date: undefined
            },
            formattedFridgeItems: newFridge
          })
          this.arrayholder = newFridge
        })
        .catch(error => {
          console.error(error);
        });
        
  }

  async itemWasted(index: number) {
    await fetch(`http://localhost:8000/homemade/single_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${index}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .catch(error => {
        console.error(error);
      });

    return await fetch(`http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wasted_count: this.state.wasted_count + 1
      })
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          modal: {
            visible: false, 
            index: undefined,
            expiration_date: undefined
          },
          formattedFridgeItems: this.state.formattedFridgeItems.filter(item => item.id !== index),
          wasted_count: data.wasted_count
        })
        this.arrayholder = this.state.formattedFridgeItems.filter(item => item.id !== index)
      })
      .catch(error => {
        console.error(error);
      });
    

  }

  async itemEaten(index: number) {
    await fetch(`http://localhost:8000/homemade/single_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${index}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .catch(error => {
        console.error(error);
      });

    return await fetch(`http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eaten_count: this.state.eaten_count + 1
      })
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          modal: {
            visible: false, 
            index: undefined,
            expiration_date: undefined
          },
          formattedFridgeItems: this.state.formattedFridgeItems.filter(item => item.id !== index),
          eaten_count: data.eaten_count
        })
        this.arrayholder = this.state.formattedFridgeItems.filter(item => item.id !== index)
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
            data={this.state.formattedFridgeItems}
            renderItem={({ item }) => (
                <FridgeItem
                  item={item} 
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
    FUNCTIONALITY
      - go to add item page should already have keyboard up and ready to search 
      - searching through list should be able to:
        - click on three dots and go to modal when keyboard was up
        - swipe on items 
    DESIGN
      - modal 

  BE-TODO
    REQUESTS
      - GET: all fridge items
      - PUT: item's updated daysToExp
      - DELETE: item in fridge from database
      - PUT: count for wasted food item 
      - PUT: count for eaten food item 
*/
