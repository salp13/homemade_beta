import * as React from 'react';
import { ActivityIndicator, FlatList, Platform, SectionList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { foodItemType, fridgeItemType } from '../objectTypes'
import { HomeParamList } from '../types'
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { SearchBar as SearchBarElement } from 'react-native-elements';
import { SearchBar, Text, View, Image } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from 'react-native-dialog'
import { MaterialCommunityIcons } from '@expo/vector-icons';


type HomeScreenNavigationProp = StackNavigationProp<HomeParamList, 'HomeScreen'>;
type HomeScreenRouteProp = RouteProp<HomeParamList, 'HomeScreen'>;

interface Props {
  navigation: HomeScreenNavigationProp,
  route: HomeScreenRouteProp
}

interface State {
  isLoading: boolean
  token: string
  user_id: string
  search: string
  allFood: Array<foodItemType>
  fridgeItems: Array<fridgeItemType>
  ingredients: Array<fridgeItemType>
  not_viewable: Set<string>
  selected: Set<string>
  fridgeAlert: {
    visible: boolean,
    fridge_id: number,
    food_name: string
  }
  ingredientAlert: {
    visible: boolean,
    food_id: string,
    food_name: string
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
    containerStyle: StyleSheet.flatten([styling.searchBarContainerStyle, {width: '100%'}]),
    inputContainerStyle: styling.searchBarInputContainerStyle,
    inputStyle: styling.defaultFontSize,
    cancelButtonProps: {buttonTextStyle: styling.defaultFontSize},
    reference: this.searchRef,
  }

  constructor(props: Props) {
    super(props);

    this.state = { 
      isLoading: true, 
      token: '', 
      user_id: '', 
      search: '',
      allFood: [],
      fridgeItems: [],
      ingredients: [],
      not_viewable: new Set(),
      selected: new Set(),
      fridgeAlert: {
        visible: false,
        fridge_id: -1,
        food_name: ''
      },
      ingredientAlert: {
        visible: false,
        food_id: '',
        food_name: ''
      },
      swipingAction: false,
    };
    this.arrayholder = [];

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.OnPressSearch = this.OnPressSearch.bind(this)
    this.FridgeToIngredient = this.FridgeToIngredient.bind(this)
    this.IngredientRemove = this.IngredientRemove.bind(this)
    this.FridgeDismiss = this.FridgeDismiss.bind(this)
    this.determineSecondaryText = this.determineSecondaryText.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.SearchRender = this.SearchRender.bind(this)
    this.FoodRender = this.FoodRender.bind(this)
  }

  async componentDidMount() {
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
          // set all_foods data
          try {
            AsyncStorage.setItem('@all_foods', JSON.stringify(data))
          } catch (e) {
            console.error(e)
          }
        })
        .catch(error => {
          console.error(error);
        });
      }
    })
    
    await AsyncStorage.getItem('@fridge_data')
      .then((data) => { 
        if (data) { 
          let parsed_data = JSON.parse(data)
          parsed_data = parsed_data.filter(item => item.food.food_name !== 'unlisted_food')
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
        }}
      )

    // Load all items in user's fridge
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_fridge/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => {
        // Filter out unlisted foods from user's fridge as they won't apply to existing recipes
        data = data.filter(item => item.food.food_name !== 'unlisted_food')
        this.setState({
          isLoading: false,
          fridgeItems: data.sort((a, b) => {
            if (!b.expiration_date) return -1
            else if (!a.expiration_date) return 1
            else if (a.expiration_date > b.expiration_date) return 1
            else if (b.expiration_date > a.expiration_date) return -1
            else if (a.food.food_name > b.food.food_name) return 1
            else if (a.food.food_name < b.food.food_name) return -1
            else if (a.quantity > b.quantity) return -1
            else if (a.quantity < b.quantity) return 1
            else if (a.id > b.id) return 1
            return -1 }),
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
      let food_item = this.arrayholder.find(ele => {return ele.food_id == food_id})
      item_to_add = {
        id: -1,
        user: "unowned_food_item",
        food: food_item,
        unlisted_food: undefined,
        expiration_date: undefined,
        quantity: 1,
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

  FridgeToIngredient(fridge_id: number) { 
    // find the ingredient in the fridge and add it as an ingredient
    const item = this.state.fridgeItems.find((fridgeItem) => { return fridgeItem.id === fridge_id })
    if (item) {
      this.setState({
        not_viewable: this.state.not_viewable.add(item.food.food_id),
        selected: this.state.selected.add(item.food.food_id),
        ingredients: this.state.ingredients.concat([item]),
      })
    }
    
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
      ingredientAlert: {
        visible: false,
        food_id: '',
        food_name: ''
      }
    })
  }

  FridgeDismiss(fridge_id: number) {
    const item = this.state.fridgeItems.find((fridgeItem) => { return fridgeItem.id === fridge_id })
    // dismiss a certain food 
    if (item) {
      this.setState({ 
        not_viewable: this.state.not_viewable.add(item.food.food_id),
        fridgeAlert: {
          visible: false,
          fridge_id: -1, 
          food_name: '', 
        }
      })
    }
  }

  determineSecondaryText(expiration_date: Date | undefined) {
    // formatting for expiration date and sub text surrounding expiration date
    let secondaryText = ''
    if (expiration_date) {
      let currentDate = new Date()
      let placehold = new Date(expiration_date)
      let daysToExp = Math.ceil((placehold.valueOf() - currentDate.valueOf())/(24 * 60 * 60 * 1000))
      if (daysToExp === 1) secondaryText = 'this expires today'
      else if (daysToExp < 1) secondaryText = 'expired'
      else secondaryText = `this expires in ${daysToExp} days`
    }
    return secondaryText
  }


  IsLoadingRender() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <ActivityIndicator />
      </View>
    )
  }

  SearchRender() {
    // flat list that will render list of filtered search items
    return (
    <FlatList
      keyboardShouldPersistTaps='always'
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      data={this.state.allFood}
      renderItem={({item, index}) => (
        <TouchableWithoutFeedback onPress={() => this.OnPressSearch(item.food_id)}>
          <View style={styling.addItemView}>
            <View style={styling.imageContainerNoBorderMarginLeft}>
              <Image style={styling.foodGroupImage} source={{ uri: item.food_group.image }}/>
            </View>
            <Text style={styling.searchResultText}>{item.food_name}</Text>
            <Ionicons name="ios-add" color="black" style={styling.addItemButton}/>
          </View>
        </TouchableWithoutFeedback>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
    )
  }

  FoodRender() {
    // section list that will render list of ingredients and fridge items
    return (
      <SectionList
        showsVerticalScrollIndicator={false}
        sections={[ 
          {title: "Ingredients", data: this.state.ingredients}, 
          {title: "fridgeItems", data: this.state.fridgeItems} ]}
        renderItem={({item, section, index}) => {
          if (this.state.not_viewable.has(item.food.food_id) && section.title === "fridgeItems") 
            return (<Text style={styling.reverseSkipped}></Text>)
          else {
            let quantity = ` (${item.quantity})`
            return (
              <View>
                <TouchableWithoutFeedback onPress={() => {
                  if (section.title !== "Ingredients") this.FridgeToIngredient(item.id)
                  else this.IngredientRemove(item.food.food_id)
                  }}>
                  <View style={styling.fridgeItemContainer}>
                  <View style={section.title === "Ingredients" ? styling.imageContainerBorder : styling.imageContainerNoBorder}>
                      <Image style={styling.foodGroupImage} source={{uri: item.food.food_group.image}}/>
                  </View>
                  {item.unlisted_food ? 
                    <Text style={styling.fridgeItemName}>{item.unlisted_food + quantity + "\n"}
                      <Text style={styling.secondaryText} lightColor="#ccc" darkColor="#ccc">{this.determineSecondaryText(item.expiration_date)}</Text>
                    </Text> :
                    <Text style={styling.fridgeItemName}>{item.food.food_name + quantity + "\n"}
                      <Text style={styling.secondaryText} lightColor="#ccc" darkColor="#ccc">{this.determineSecondaryText(item.expiration_date)}</Text>
                    </Text>
                  }
                  <View style={styling.autoLeft}>
                      {(section.title === "Ingredients") ? (
                        <Ionicons name="ios-remove" color="black" style={styling.addItemButton}/>
                        ) : (
                        <Ionicons name="ios-add" color="black" style={styling.addItemButton}/> ) }
                  </View>
                  </View>
                </TouchableWithoutFeedback>
            </View>
            )}
        }}
        renderSectionHeader={() => ( <View style={styling.sectionBuffer}/> )}
        /> 
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    return (
      <View style={StyleSheet.flatten([styling.noHeader, styling.container])}>
        <View style={styling.flexRow}>
          <Text style={styling.title}>Hello!{'\n'}Which ingredients would you like to use today?</Text>
          <TouchableWithoutFeedback 
            onPress={() => this.props.navigation.navigate('HomeResultScreen', { specifiedItems: this.state.ingredients.map((ingredient) => { return ingredient.food.food_id }) })} 
            disabled={this.state.ingredients.length < 1}
            >
            {this.state.ingredients.length < 1 ? (<Text></Text>) : 
              (<Ionicons 
                name="ios-arrow-round-forward" color="black" style={styling.arrow}/>)}
          </TouchableWithoutFeedback>
        </View>
        <View style={styling.fullSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <SearchBar
          onChangeText={text => this.OnChangeSearch(text)}
          onClear={this.OnClearSearch}
          value={this.state.search}
          platform={(Platform.OS === "android" || Platform.OS === "ios") ? Platform.OS : "default"}
          {...this.searchBarProps}
        />
        {this.state.search !== '' ? this.SearchRender() : this.FoodRender()}
      </View>
    );
  }
}
