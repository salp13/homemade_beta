import * as React from 'react';
import moment from 'moment';
import { ActivityIndicator, FlatList, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import FridgeItem from '../components/FridgeItem'
import { fridgeItemType } from '../objectTypes'
import FridgeModal from '../components/FridgeModal'
import { FridgeParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, View } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style'

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
  produce_wasted: number
  dairy_wasted: number
  meat_wasted: number
  fridgeItems: Array<fridgeItemType>
  modal: {
    visible: boolean
    id: number | undefined
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
      trigger: false,
      search: '',
      wasted_count: 0,
      eaten_count: 0,
      produce_wasted: 0,
      dairy_wasted: 0,
      meat_wasted: 0,
      fridgeItems: [],
      modal: {
        visible: false,
        id: undefined,
        expiration_date: undefined
      },
      swipingAction: false,
    };
    this.arrayholder = [];

    this.SearchFilterFunction = this.SearchFilterFunction.bind(this)
    this.modalUpdate = this.modalUpdate.bind(this)
    this.modalResult = this.modalResult.bind(this)
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.itemEditted = this.itemEditted.bind(this)
    this.itemWasted = this.itemWasted.bind(this)
    this.itemEaten = this.itemEaten.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.FridgeRender = this.FridgeRender.bind(this)
  }

  async componentDidMount() {
    // hit api for fridge items and sort them by expiration date
    let fridgeData = await fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        data.sort((a, b) => (!b.expiration_date) ? 1 : ((!a.expiration_date) ? -1 : (a.expiration_date > b.expiration_date) ? 1 : -1))
        this.arrayholder = data
        return data
      })
      .catch(error => {
        console.error(error);
      });

    // hit api for metrics data to update later
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
          fridgeItems: fridgeData,
          wasted_count: data.wasted_count,
          eaten_count: data.eaten_count
        })
      })
      .catch(error => {
        console.error(error);
      });
  }

  componentDidUpdate() {
    // if the trigger has changed, hit api for updated fridge items and reset trigger
    if (this.state.trigger !== this.props.route.params.trigger) {
      return fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          data.sort((a, b) => (!b.expiration_date) ? 1 : ((!a.expiration_date) ? -1 : (a.expiration_date > b.expiration_date) ? 1 : -1))
          this.arrayholder = data
          this.setState({
            fridgeItems: data,
            trigger: this.props.route.params.trigger,
          })
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  SearchFilterFunction(text: string = '') {
    // filter fridge items based on search text
    const filteredData = this.arrayholder.filter(function(item: any) {
      const itemData = item.food.food_name ? item.food.food_name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      fridgeItems: filteredData,
      search: text,
    });
  }

  modalUpdate(id: number) {
    // make modal visible and send necessary item's id and expiration date
    let obj = this.state.fridgeItems.find(element => element.id == id)
    this.setState({
      modal: {
        visible: true, 
        id: id, 
        expiration_date: obj?.expiration_date
      }
    })
  }

  async modalResult(id: number, action?: string, expiration_date?: Date | undefined) {
    // based on modal's resulting action, call related helper functions and reset modal visibility
    if (action === "wasted") this.itemWasted(id)
    else if (action === "eaten") this.itemEaten(id)
    else if (action === "edit") await this.itemEditted(id, expiration_date)
    else {
      this.setState({
        modal: {
          visible: false,
          id: undefined,
          expiration_date: undefined,
        }
      })
    }
  }

  OnSwipeNoScroll() {
    // cannot scroll while user is swiping
    this.setState({
      swipingAction: true,
    })
  }

  OnSwipeScroll() {
    // reset scroll functionality once swiping has ended
    this.setState({
      swipingAction: false,
    })
  }

  async itemEditted(id: number, expiration_date: Date | undefined) {
    // formatting for expiration date
    let momented = (!expiration_date) ? undefined : moment(expiration_date).add(1, 'day').format('YYYY-MM-DD')
    // hit api to update fridge item's expiration date
    await fetch(`http://localhost:8000/homemade/single_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiration_date: momented })
    })
      .catch(error => {
        console.error(error);
      });

      // hit api to get existing fridge items and sort based on expiration date
      return fetch('http://localhost:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        data.sort((a, b) => (!b.expiration_date) ? 1 : ((!a.expiration_date) ? -1 : (a.expiration_date > b.expiration_date) ? 1 : -1))
        this.arrayholder = data
        this.setState({
          modal: {
            visible: false, 
            id: undefined,
            expiration_date: undefined
          },
          fridgeItems: data
        })
      })
      .catch(error => {
        console.error(error);
      });
        
  }

  async itemWasted(id: number) {
    // locate the item that has been wasted for its food group, default is zero index (should throw error instead)
    let find_food = this.state.fridgeItems.find((item) => item.id === id)
    let food_group = (find_food) ? find_food.food.food_group.food_group_id : 0

    // hit api to delete fridge item that has been wasted
    await fetch(`http://localhost:8000/homemade/single_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .catch(error => {
        console.error(error);
      });
    
    // update body based on which food group the item falls under
    let body = { wasted_count: this.state.wasted_count + 1 }
    if (food_group == 2) body['produce_wasted'] = this.state.produce_wasted + 1
    else if (food_group == 8) body['dairy_wasted'] = this.state.produce_wasted + 1
    else if (food_group == 3) body['meat_wasted'] = this.state.produce_wasted + 1
    // hit api to update metric data with wasted counts
    return await fetch(`http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          modal: {
            visible: false, 
            id: undefined,
            expiration_date: undefined
          },
          fridgeItems: this.state.fridgeItems.filter(item => item.id !== id),
          wasted_count: data.wasted_count
        })
        this.arrayholder = this.state.fridgeItems.filter(item => item.id !== id)
      })
      .catch(error => {
        console.error(error);
      });
    

  }

  async itemEaten(id: number) {
    // hit api to delete eaten item from fridge
    await fetch(`http://localhost:8000/homemade/single_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .catch(error => {
        console.error(error);
      });

    // hit api to update metric data to increment eaten count
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
            id: undefined,
            expiration_date: undefined
          },
          fridgeItems: this.state.fridgeItems.filter(item => item.id !== id),
          eaten_count: data.eaten_count
        })
        this.arrayholder = this.state.fridgeItems.filter(item => item.id !== id)
      })
      .catch(error => {
        console.error(error);
      });
    
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
  }

  FridgeRender(item) {
    // rendering for flat list of fridge items
    return (
      <FridgeItem
        selected={false}
        id={item.id}
        item={item} 
        modalUpdateFunc={this.modalUpdate}
        swipeStart={this.OnSwipeNoScroll}
        swipeEnd={this.OnSwipeScroll}
        swipeLeftFunc={this.itemWasted}
        swipeRightFunc={this.itemEaten}
      />
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

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
            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('AddFridgeItemScreen')}>
              <AntDesign name="plus" style={styling.iconSize} color="black"/>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <ScrollView scrollEnabled={!this.state.swipingAction}>
          <FlatList
            scrollEnabled={!this.state.swipingAction}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={this.state.fridgeItems}
            renderItem={({ item }) => this.FridgeRender(item)}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
        <FridgeModal modalProperties={this.state.modal} ModalResultFunc={this.modalResult}/>
      </View>
    );
  }
}

