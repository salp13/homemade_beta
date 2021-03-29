import * as React from 'react';
import { ActivityIndicator, FlatList, Platform, SectionList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { foodItemType, fridgeItemType } from '../objectTypes'
import FridgeItem from '../components/FridgeItem'
import HomeFridgeModal from '../components/HomeFridgeModal'
import HomeIngredientModal from '../components/HomeIngredientModal'
import { HomeParamList } from '../types'
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { SearchBar as SearchBarElement } from 'react-native-elements';
import { SearchBar, Text, View } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = StackNavigationProp<HomeParamList, 'HomeScreen'>;
type HomeScreenRouteProp = RouteProp<HomeParamList, 'HomeScreen'>;

interface Props {
  navigation: HomeScreenNavigationProp,
  route: HomeScreenRouteProp
}

interface State {
  isLoading: boolean
  search: string
  allFood: Array<foodItemType>
  fridgeItems: Array<fridgeItemType>
  ingredients: Array<fridgeItemType>
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
    this.SearchRender = this.SearchRender.bind(this)
    this.FoodRender = this.FoodRender.bind(this)
  }

  async componentDidMount() {
    // Load all items in user's fridge
    let fridgeData = await fetch('http://127.0.0.1:8000/homemade/many_fridge/3beea29d-19a3-4a8b-a631-ce9e1ef876ea')
      .then(response => response.json())
      .then(data => {return data})
      .catch(error => {
        console.error(error);
      });
    
    // Filter out unlisted foods from user's fridge as they won't apply to existing recipes
    fridgeData = fridgeData.filter(item => item.food.food_name !== 'unlisted_food')
    
    // Load all foods and store in the arrayholder for search filtering
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
    // Filter arrayholder for foods with search text and foods that are not already in ingredient list
    const ingredients = this.state.ingredients
    const allFoodSearched = this.arrayholder.filter(function(item: foodItemType) {
      const itemData = item.food_name ? item.food_name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      let found = ingredients.find((ingredient) => { return ingredient.food.food_id === item.food_id })
      return itemData.startsWith(textData) && !found;
    });

    this.setState({
      allFood: allFoodSearched,
      search: text,
    });
  }

  OnClearSearch() {
    // Reset search values
    this.setState({
      allFood: [],
      search: '',
    });
  }

  async OnPressSearch(food_id: string) {  
    // Check if the searched item is already in the fridge
    let item_to_add = this.state.fridgeItems.find((fridgeItem) => {return fridgeItem.food.food_id === food_id})
    if (!item_to_add) {
      // If item is not in fridge, load it from api
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
        food: food_item,
        unlisted_food: undefined,
        expiration_date: undefined,
      }
    }
    // modify state to accomodate for added ingredient
    this.setState({
      allFood: [],
      search: '',
      not_viewable: this.state.not_viewable.add(food_id),
      selected: this.state.selected.add(food_id),
      ingredients: this.state.ingredients.concat([item_to_add]),
    })
    if (this.searchRef.current?.cancel) this.searchRef.current.cancel()
  }

  OnSwipeNoScroll() {
    this.setState({ swipingAction: true })
  }

  OnSwipeScroll() {
    this.setState({ swipingAction: false })
  }

  modalUpdate(id: number, selected: boolean) {
    // set state's modal information (differs when the item is an ingredient vs just in the fridge)
    const object = { 
      modalVisible: true,
      id: id
    }
    if (selected) this.setState({ modalIngredient: object })
    else this.setState({ modalFridge: object })
  }

  modalResult(food_id: string, action?: string) {
    // reset modal and call helper functions dependent on specified action
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
    if (action === "add") this.FridgeToIngredient(food_id)
    else if (action === "dismiss") this.FridgeDismiss(food_id)
    else if (action === "remove") this.IngredientRemove(food_id)
  }

  FridgeToIngredient(food_id: string) { 
    // find the ingredient in the fridge and add it as an ingredient
    const item = this.state.fridgeItems.find((fridgeItem) => { return fridgeItem.food.food_id === food_id })
    this.setState({
      not_viewable: this.state.not_viewable.add(food_id),
      selected: this.state.selected.add(food_id),
      ingredients: (item) ? this.state.ingredients.concat([item]) : this.state.ingredients,
    })
  }

  IngredientRemove(food_id: string) {
    // remove ingredient from ingredients list
    const assign_not_viewable = this.state.not_viewable
    assign_not_viewable.delete(food_id)
    const assign_selected = this.state.selected
    assign_selected.delete(food_id)
    
    this.setState({
      not_viewable: assign_not_viewable,
      selected: assign_selected,
      ingredients: this.state.ingredients.filter((ingredient) => { return ingredient.food.food_id !== food_id }),
    })
  }

  FridgeDismiss(food_id: string) {
    // dismiss a certain food 
    this.setState({ not_viewable: this.state.not_viewable.add(food_id) })
  }

  SearchRender(item) {
    // rendering for search items
    return (
      <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.food_id)}>
        <Text style={styles.searchResultText}>{item.food_name}</Text>
      </TouchableWithoutFeedback>
    )
  }

  FoodRender(item, section) {
    // rendering for sectionlist ingredient/fridge items
    if (this.state.not_viewable.has(item.food.food_id) && section.title === "fridgeItems") 
      return (<Text style={{marginTop: -20}}></Text>)
    else 
      return (
        <FridgeItem
          selected={(section.title === "Ingredients") ? true : false}
          id={item.food.food_id}
          item={item} 
          modalUpdateFunc={this.modalUpdate}
          swipeStart={this.OnSwipeNoScroll}
          swipeEnd={this.OnSwipeScroll}
          swipeLeftFunc={this.state.selected.has(item.food.food_id) ? this.IngredientRemove : this.FridgeDismiss}
          swipeRightFunc={this.state.selected.has(item.food.food_id) ? () => { return item } : this.FridgeToIngredient}
        />
      )
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
          onPress={() => this.props.navigation.navigate('HomeResultScreen', { specifiedItems: this.state.ingredients.map((ingredient) => { return ingredient.food.food_id }) })} 
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
          renderItem={({item, index}) => this.SearchRender(item)}
          keyExtractor={(item, index) => index.toString()}
        />) :
        (
          <SectionList
            scrollEnabled={!this.state.swipingAction}
            sections={[ {title: "Ingredients", data: this.state.ingredients}, 
              {title: "fridgeItems", data: this.state.fridgeItems} ]}
            renderItem={({item, section, index}) => this.FoodRender(item, section)}
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