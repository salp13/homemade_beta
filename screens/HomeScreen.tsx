import * as React from 'react';
import { StyleSheet, ActivityIndicator, Platform, SectionList} from 'react-native';

import { Text, View, SearchBar } from '../components/Themed';
import FridgeItem from '../components/FridgeItem'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import dummyData from "../dummyData.json";

interface Props {}

interface State {
  isLoading: boolean
  search: string
  allFood: Array<any>
  fridgeItems: Array<any>
  ingredients: Array<any>
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class HomeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];

  constructor(props?: any) {
    super(props);
    //setting default state
    this.state = { 
      isLoading: true, 
      search: '',
      allFood: [],
      fridgeItems: [],
      ingredients: [],
    };
    this.arrayholder = [];
    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnPressFridge = this.OnPressFridge.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
  }

  componentDidMount() {
    this.setState(
      {
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
    this.setState(
      {
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
    this.setState(
      {
        allFood: [],
        search: '',
      });
  }

  OnPressFridge(index: any) {
    let item = this.state.fridgeItems[index]
    item.selected = true
    const replaceFridgeItems = this.state.fridgeItems
    replaceFridgeItems.splice(index,1)
    this.setState({
      fridgeItems: replaceFridgeItems,
      ingredients: this.state.ingredients.concat([item]),
    })
  }

  render() {
    if (this.state.isLoading) {
      //Loading View while data is loading
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
          sections={[
            {title: "ingredients", data: this.state.ingredients},
            {title: "fridgeItems", data: this.state.fridgeItems}
          ]}
          renderItem={({item, index}) => {
            if (item.selected === true) {
              return (
                <FridgeItem 
                  title={item.title} 
                  imageIndex={item.imageIndex} 
                  daysToExp={item.daysToExp} 
                  selected={item.selected} />
              )
            }
            return (
              <TouchableWithoutFeedback onPress={indexer => this.OnPressFridge(index)}>
                <FridgeItem 
                  title={item.title} 
                  imageIndex={item.imageIndex} 
                  daysToExp={item.daysToExp} 
                  selected={item.selected} />
              </TouchableWithoutFeedback>
            )
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{marginTop: 10}}/>
          )}
        /> 
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
    - best way to search database of all food 
        - load everything and filter through it? fetch on every change? 
    - display search recommendations
    - if ingredients is not empty, option to proceed
    - design: change highlight border color, 
              make image background lighter, 
              make secondary text color darker
    - add/dismiss pop up 
    - swipe capabilities
*/