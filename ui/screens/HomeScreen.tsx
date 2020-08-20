import * as React from 'react';
import { StyleSheet, ActivityIndicator, Platform, SectionList, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View, SearchBar } from '../components/Themed';
import dummyData from "../dummyData.json";
import FridgeItem from '../components/FridgeItem'
import HomeFridgeModal from '../components/HomeFridgeModal'
import HomeIngredientModal from '../components/HomeIngredientModal'
import { SearchBar as SearchBarElement } from 'react-native-elements';
import { HomeParamList } from '../types'

type HomeScreenNavigationProp = StackNavigationProp<HomeParamList, 'HomeScreen'>;
type HomeScreenRouteProp = RouteProp<HomeParamList, 'HomeScreen'>;

interface Props {
  navigation: HomeScreenNavigationProp,
  route: HomeScreenRouteProp
}

interface State {
  isLoading: boolean
  search: string
  allFood: Array<any>
  fridgeItems: Array<any>
  ingredients: Array<any>
  modalFridge: {
    modalVisible: boolean,
    index: number | undefined
  }
  modalIngredient: {
    modalVisible: boolean,
    index: number | undefined
  }
  swipingAction: boolean
}

export default class HomeScreen extends React.Component<Props, State> {
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
      modalFridge: {
        modalVisible: false, 
        index: undefined
      },
      modalIngredient: {
        modalVisible: false, 
        index: undefined
      },
      swipingAction: false,
    };

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

  componentDidMount() {
    const fridgeItemsDeepCopy = JSON.parse(JSON.stringify(dummyData.dummyFridgeItems));
    this.setState({
      isLoading: false,
      fridgeItems: fridgeItemsDeepCopy
    })

    // return fetch('https://jsonplaceholder.typicode.com/posts')
    //   .then(response => response.json())
    //   .then(data => {
    //     this.setState(
    //       {
    //         isLoading: false,
    //         fridgeItems: data,
    //       }
    //     );
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }

  OnChangeSearch(text: string) {
    const lowerCaseText = text.toLowerCase()
    const newFood = dummyData.dummyAllFoods
    .filter((food) => {
      return food.title.includes(lowerCaseText)
    }).filter((food) => {
      return !this.state.ingredients
      .find((ingredient) => {
        return ingredient.title === food.title})
      })
    
    this.setState({
      allFood: newFood,
      search: text
    });

    // return fetch('https://jsonplaceholder.typicode.com/posts', {body: JSON.stringify(text)})
    //   .then(response => response.json())
    //   .then(data => {
    //     this.setState(
    //       {
    //         allFood: data,
    //       }
    //     );
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }

  OnClearSearch() {
    this.setState({
      allFood: [],
      search: '',
    });
  }

  OnPressSearch(index: number) {    
    const replaceFridgeItems = this.state.fridgeItems
    const fridgeIndex = replaceFridgeItems.findIndex((fridgeItem) => {return fridgeItem.title === this.state.allFood[index].title})
    let item = {
      title: this.state.allFood[index].title,
      imageIndex: this.state.allFood[index].imageIndex,
      daysToExp: undefined,
      selected: true,
      viewable: true
    } 
    if (fridgeIndex !== -1) {
      item = {
        title: this.state.fridgeItems[fridgeIndex].title,
        imageIndex: this.state.fridgeItems[fridgeIndex].imageIndex,
        daysToExp: this.state.fridgeItems[fridgeIndex].daysToExp,
        selected: true,
        viewable: true
      } 
      replaceFridgeItems[fridgeIndex].viewable = false
    } else {
      item = {
        title: this.state.allFood[index].title,
        imageIndex: this.state.allFood[index].imageIndex,
        daysToExp: undefined,
        selected: true,
        viewable: true
      } 
    }
    this.setState({
      allFood: [],
      search: '',
      ingredients: this.state.ingredients.concat([item]),
      fridgeItems: replaceFridgeItems
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

  modalUpdate(index: number, selected: boolean) {
    if (selected) {
      this.setState({
        modalIngredient: {
          modalVisible: true, 
          index: index
        }
      })
    } else {
      this.setState({
        modalFridge: {
          modalVisible: true, 
          index: index
        }
      })
    }
  }

  modalResult(index: number, action?: string) {
    if (action === "add") this.FridgeToIngredient(index)
    else if (action === "dismiss") this.FridgeDismiss(index)
    else if (action === "remove") this.IngredientRemove(index)
    else {
      this.setState({
        modalFridge: {
          modalVisible: false,
          index: undefined
        },
        modalIngredient: {
          modalVisible: false,
          index: undefined
        }
      })
    }
  }

  FridgeToIngredient(index: number) {
    const item = {
      title: this.state.fridgeItems[index].title,
      daysToExp: this.state.fridgeItems[index].daysToExp,
      imageIndex: this.state.fridgeItems[index].imageIndex,
      selected: true,
      viewable: true
    }
    const replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems[index].viewable = false
    this.setState({
      fridgeItems: replaceFridgeItems,
      ingredients: this.state.ingredients.concat([item]),
      modalFridge: {
        modalVisible: false, 
        index: undefined
      },
    })
  }

  IngredientRemove(index: number) {
    const item = this.state.ingredients[index]
    const replaceFridgeItems = this.state.fridgeItems
    const fridgeIndex = replaceFridgeItems.findIndex((fridgeItem) => {return fridgeItem.title === item.title})
    if (fridgeIndex !== -1) replaceFridgeItems[fridgeIndex].viewable = true
    const ingredientRemoved = this.state.ingredients
    ingredientRemoved.splice(index,1)
    this.setState({
      fridgeItems: replaceFridgeItems,
      ingredients: ingredientRemoved,
      modalIngredient: {
        modalVisible: false, 
        index: undefined
      },
    })
  }

  FridgeDismiss(index: number) {
    const replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems[index].viewable = false
    this.setState({
      fridgeItems: replaceFridgeItems,
      modalFridge: {
        modalVisible: false, 
        index: undefined 
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
          onPress={() => this.props.navigation.navigate('HomeResultScreen', {specifiedItems: this.state.ingredients})} 
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
            <TouchableWithoutFeedback onPress={() => this.OnPressSearch(index)}>
              <Text style={styles.searchResultText}>{item.title}</Text>
            </TouchableWithoutFeedback>
          )}
          keyExtractor={(item, index) => item}
        />) :
        (
          <SectionList
            scrollEnabled={!this.state.swipingAction}
            sections={[ {data: this.state.ingredients}, {data: this.state.fridgeItems} ]}
            renderItem={({item, index}) => {
              if (!item.viewable) return (<Text style={{marginTop: -20}}></Text>)
              return (
              <FridgeItem
                item={item} 
                index={index} 
                modalUpdateFunc={this.modalUpdate}
                swipeStart={this.OnSwipeNoScroll}
                swipeEnd={this.OnSwipeScroll}
                swipeLeftFunc={item.selected ? this.IngredientRemove : this.FridgeDismiss}
                swipeRightFunc={item.selected ? (index: number) => { return index } : this.FridgeToIngredient}
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


/*
  FE-TODO
    DESIGN
    - change highlight border color
    - make image background lighter
    - make secondary text color darker
    - modal options design (add icon and fix layout)
    - swipe icons (red needs dismiss and green needs add)

  BE-TODO
    REQUESTS
    - GET: all user's fridge items
    - GET: specific food items based on search text

  FS-TODO
    SEARCH
    - best way to search database of all food 
      - load everything and filter through it? fetch on every change? 
    - specify exact object types for state and props
    - style sheet for entire project
*/