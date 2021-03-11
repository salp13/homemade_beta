import * as React from 'react';
import { StyleSheet, ActivityIndicator, Platform, SectionList, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import FridgeItem from '../components/FridgeItem'
import HomeFridgeModal from '../components/HomeFridgeModal'
import HomeIngredientModal from '../components/HomeIngredientModal'
import { SearchBar as SearchBarElement } from 'react-native-elements';
import { HomeParamList } from '../types'

type HomeScreenNavigationProp = StackNavigationProp<HomeParamList, 'HomeScreen'>;
type HomeScreenRouteProp = RouteProp<HomeParamList, 'HomeScreen'>;

type foodItem = {
  food_id: string
  food_name: string
  default_days_to_exp: number | undefined
  food_group: {
    food_group_id: string
    image: string
  }
}

type fridgeItem = {
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
}

interface Props {
  navigation: HomeScreenNavigationProp,
  route: HomeScreenRouteProp
}

interface State {
  isLoading: boolean
  search: string
  allFood: Array<foodItem>
  fridgeItems: Array<fridgeItem>
  ingredients: Array<fridgeItem>
  not_viewable: Set<string>
  selected: Set<string>
  modalFridge: {
    modalVisible: boolean,
    id: number | string | undefined
  }
  modalIngredient: {
    modalVisible: boolean,
    id: number | string | undefined
  }
  swipingAction: boolean
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class HomeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Find an ingredient to use...",
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
      search: '',
      allFood: [],
      fridgeItems: [],
      ingredients: [],
      not_viewable: new Set(),
      selected: new Set(),
      modalFridge: {
        modalVisible: false, 
        id: undefined
      },
      modalIngredient: {
        modalVisible: false, 
        id: undefined
      },
      swipingAction: false,
    };
    this.arrayholder = [];

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.OnPressSearch = this.OnPressSearch.bind(this)
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.modalUpdate = this.modalUpdate.bind(this)
    this.modalResult = this.modalResult.bind(this)
    this.FridgeToIngredient = this.FridgeToIngredient.bind(this)
    this.IngredientRemove = this.IngredientRemove.bind(this)
    this.FridgeDismiss = this.FridgeDismiss.bind(this)
  }

  async componentDidMount() {
    let fridgeData = await fetch('http://127.0.0.1:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea')
      .then(response => response.json())
      .then(data => {return data})
      .catch(error => {
        console.error(error);
      });

    fridgeData = fridgeData.filter(item => item.food.food_name !== 'unlisted_food')

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
      this.setState({
        isLoading: false,
        fridgeItems: fridgeData.sort((a, b) => (!b.expiration_date) ? 1 : ((!a.expiration_date) ? -1 : (a.expiration_date > b.expiration_date) ? 1 : -1)),
      });
    })
    .catch(error => {
      console.error(error);
    });
  }

  OnChangeSearch(text: string) {
    const allFoodSearched = this.arrayholder.filter(function(item: foodItem) {
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
    });
  }

  async OnPressSearch(food_id: string) {  
    let item_to_add = this.state.fridgeItems.find((fridgeItem) => {return fridgeItem.food.food_id === food_id})
    if (!item_to_add) {
      let food_item = await fetch(`http://localhost:8000/homemade/single_food/${food_id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => { return data })
        .catch(error => { console.error(error); });
      item_to_add = {
        id: -1,
        user: "unowned_food_item",
        food: {
          food_id: food_id,
          food_name: food_item.food_name,
          food_group: {
            food_group_id: food_item.food_group.food_group_id,
            image: food_item.food_group.image,
          }
        },
        unlisted_food: undefined,
        expiration_date: undefined,
      }
    }
    this.setState({
      allFood: [],
      search: '',
      not_viewable: this.state.not_viewable.add(food_id),
      selected: this.state.selected.add(food_id),
      ingredients: (item_to_add) ? this.state.ingredients.concat([item_to_add]) : this.state.ingredients,
    })
    if (this.searchRef.current?.cancel) this.searchRef.current.cancel()
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

  modalUpdate(id: number, selected: boolean) {
    if (selected) {
      this.setState({
        modalIngredient: {
          modalVisible: true, 
          id: id
        }
      })
    } else {
      this.setState({
        modalFridge: {
          modalVisible: true, 
          id: id
        }
      })
    }
  }

  modalResult(food_id: string, action?: string) {
    if (action === "add") this.FridgeToIngredient(food_id)
    else if (action === "dismiss") this.FridgeDismiss(food_id)
    else if (action === "remove") this.IngredientRemove(food_id)
    else {
      this.setState({
        modalFridge: {
          modalVisible: false,
          id: undefined
        },
        modalIngredient: {
          modalVisible: false,
          id: undefined
        }
      })
    }
  }

  FridgeToIngredient(food_id: string) { 
    const item = this.state.fridgeItems.find((fridgeItem) => {return fridgeItem.food.food_id === food_id})
    this.setState({
      not_viewable: this.state.not_viewable.add(food_id),
      selected: this.state.selected.add(food_id),
      ingredients: (item) ? this.state.ingredients.concat([item]) : this.state.ingredients,
      modalFridge: {
        modalVisible: false, 
        id: undefined
      },
    })
  }

  IngredientRemove(food_id: string) {
    const assign_not_viewable = this.state.not_viewable
    assign_not_viewable.delete(food_id)
    const assign_selected = this.state.selected
    assign_selected.delete(food_id)
    
    this.setState({
      not_viewable: assign_not_viewable,
      selected: assign_selected,
      ingredients: this.state.ingredients.filter((ingredient) => {return ingredient.food.food_id !== food_id}),
      modalIngredient: {
        modalVisible: false, 
        id: undefined
      }
    })
  }

  FridgeDismiss(food_id: string) {
    this.setState({
      not_viewable: this.state.not_viewable.add(food_id),
      modalFridge: {
        modalVisible: false, 
        id: undefined 
      },
    })
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
        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.title}>Which ingredients would you like to use today?</Text>
        <TouchableWithoutFeedback 
          onPress={() => this.props.navigation.navigate('HomeResultScreen', {specifiedItems: this.state.ingredients.map((ingredient) => {return ingredient.food.food_id})})} 
          disabled={this.state.ingredients.length < 1}
          >
          {this.state.ingredients.length < 1 ? 
            (<Text></Text>) : 
            (<Ionicons 
              name="ios-arrow-round-forward" size={75} color="black" 
              style={{marginTop: -50, left: 300, marginBottom:0, height: '8%'}}/>)}
        </TouchableWithoutFeedback>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <SearchBar
          onChangeText={text => this.OnChangeSearch(text)}
          onClear={this.OnClearSearch}
          value={this.state.search}
          platform={(Platform.OS === "android" || Platform.OS === "ios") ? Platform.OS : "default"}
          {...this.searchBarProps}
        />
        {this.state.search !== '' ? 
        (<FlatList
          keyboardShouldPersistTaps='always'
          data={this.state.allFood}
          renderItem={({item, index}) => (
            <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.food_id)}>
              <Text style={styles.searchResultText}>{item.food_name}</Text>
            </TouchableWithoutFeedback>
          )}
          keyExtractor={(item, index) => index.toString()}
        />) :
        (
          <SectionList
            scrollEnabled={!this.state.swipingAction}
            sections={[ {title: "Ingredients", data: this.state.ingredients}, 
              {title: "fridgeItems", data: this.state.fridgeItems} ]}
            renderItem={({item, section, index}) => {
              if (this.state.not_viewable.has(item.food.food_id) && section.title === "fridgeItems") return (<Text style={{marginTop: -20}}></Text>)
              return (
              <FridgeItem
                selected={(section.title === "Ingredients") ? true : false}
                id={item.food.food_id}
                item={item} 
                modalUpdateFunc={this.modalUpdate}
                swipeStart={this.OnSwipeNoScroll}
                swipeEnd={this.OnSwipeScroll}
                swipeLeftFunc={this.state.selected.has(item.food.food_id) ? this.IngredientRemove : this.FridgeDismiss}
                swipeRightFunc={this.state.selected.has(item.food.food_id) ? (index: number) => { return item } : this.FridgeToIngredient}
              />
            )}}
            renderSectionHeader={() => ( <View style={{marginTop: 10}}/> )}
            /> 
        )}
        <HomeFridgeModal modalProperties={this.state.modalFridge} ModalResultFunc={this.modalResult}/>
        <HomeIngredientModal modalProperties={this.state.modalIngredient} ModalResultFunc={this.modalResult}/>
      </View>
    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
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