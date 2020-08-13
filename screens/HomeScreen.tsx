import * as React from 'react';
import { StyleSheet, ActivityIndicator, Platform, SectionList} from 'react-native';

import { Text, View, SearchBar } from '../components/Themed';
import dummyData from "../dummyData.json";
import FridgeItem from '../components/FridgeItem'
import HomeFridgeModal from '../components/HomeFridgeModal'
import HomeIngredientModal from '../components/HomeIngredientModal'

interface Props {}

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
  arrayholder: Array<any> = [];

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
    this.OnSwipeNoScroll = this.OnSwipeNoScroll.bind(this)
    this.OnSwipeScroll = this.OnSwipeScroll.bind(this)
    this.modalUpdate = this.modalUpdate.bind(this)
    this.modalResult = this.modalResult.bind(this)
    this.FridgeToIngredient = this.FridgeToIngredient.bind(this)
    this.IngredientRemove = this.IngredientRemove.bind(this)
    this.FridgeDismiss = this.FridgeDismiss.bind(this)
  }

  componentDidMount() {
    this.setState({
      isLoading: false,
      fridgeItems: dummyData.dummyFridgeItems
    })

    // BE-TODO: query for user's fridge items
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
    this.setState({
      allFood: dummyData.dummyAllFoods,
      search: text
    });
    
    // BE-TODO: query all foods
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
    let item = this.state.fridgeItems[index]
    console.log(item)
    item.selected = true
    let replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems.splice(index,1)
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
    let item = this.state.ingredients[index]
    item.selected = false
    const updateFridgeItems = item.daysToExp ? this.state.fridgeItems.concat([item]) : this.state.fridgeItems
    let ingredientRemoved = this.state.ingredients
    ingredientRemoved.splice(index,1)
    this.setState({
      fridgeItems: updateFridgeItems,
      ingredients: ingredientRemoved,
      modalIngredient: {
        modalVisible: false, 
        index: undefined
      },
    })
  }

  FridgeDismiss(index: number) {
    const replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems.splice(index,1)
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
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <SearchBar
          onChangeText={text => this.OnChangeSearch(text)}
          onClear={this.OnClearSearch}
          value={this.state.search}
          placeholder="Find an ingredient to use..."
          autoCorrect={false}
          platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
          showCancel
          containerStyle={styles.searchBarContainerStyle}
          inputContainerStyle={styles.searchBarInputContainerStyle}
          inputStyle={styles.searchBarTextStyle}
        />
        <SectionList
          scrollEnabled={!this.state.swipingAction}
          sections={[
            {title: "ingredients", data: this.state.ingredients},
            {title: "fridgeItems", data: this.state.fridgeItems}
          ]}
          renderItem={({item, index}) => (
            <FridgeItem
              item={item}
              index={index}
              modalUpdateFunc={this.modalUpdate}
              swipeLeftFunc={
                item.selected ?
                this.IngredientRemove :
                this.FridgeDismiss}
              swipeRightFunc={
                item.selected ? 
                (index: number) => { return index } :
                this.FridgeToIngredient}
              swipeStart={this.OnSwipeNoScroll}
              swipeEnd={this.OnSwipeScroll}
            />
          )}
          renderSectionHeader={() => (
            <View style={{marginTop: 10}}/>
          )}
        /> 
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
});


/*
  FE-TODO
    SEARCH
    - display search recommendations
    - tap off search bar to cancel 
    FEATURES
    - if ingredients is not empty, option to proceed
    DESIGN
    - change highlight border color
    - make image background lighter, 
    - make secondary text color darker
    - modal options design (add icon and fix layout)
    - swipe icons
    FUNCTIONALITY
    - resort after returning to fridge from ingredient list
*/

/*
  BE-TODO
    QUERIES
    - query for user's fridge items
    - query for specific food items based on search text
*/

/*
  FS-TODO
    SEARCH
    - best way to search database of all food 
      - load everything and filter through it? fetch on every change? 
*/