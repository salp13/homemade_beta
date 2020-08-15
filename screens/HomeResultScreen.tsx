import * as React from 'react';
import { StyleSheet, SectionList, TouchableWithoutFeedback, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View } from '../components/Themed';
import RecipeOverview from '../components/RecipeOverview'
import FilterModal from '../components/FilterModal'
import dummyData from "../dummyData.json";
import { HomeResultParamList } from '../types';

type recipe = {
  id: string
  title: string
  imageIndex: number
  dietaryPreference: Array<string>
  saved: boolean
  cuisine: string
  mealType: string
}

interface Props {
  navigation: StackNavigationProp<HomeResultParamList, 'HomeResultScreen'>,
  route: RouteProp<HomeResultParamList, 'HomeResultScreen'>
}

interface State {
  selectedFoods: Array<any>
  recipes: Array<recipe>
  filters: {
    mealType: Array<string>,
    dietaryPreference: Array<string>,
    cuisine: Array<string>
  }
  filterModalViewable: boolean
}

export default class HomeResultScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.props.route.params.specifiedItems
    this.state = { 
      selectedFoods: [],
      recipes: [],
      filters: {
        mealType: [],
        dietaryPreference: [],
        cuisine: []
      },
      filterModalViewable: false,
    };

    this.onPressFilter = this.onPressFilter.bind(this)
    this.filterModalResults = this.filterModalResults.bind(this)
    this.navigateRecipe = this.navigateRecipe.bind(this)
    this.saveRecipe = this.saveRecipe.bind(this)
    this.dismissRecipe = this.dismissRecipe.bind(this)
  }

  componentDidMount() {
    this.setState({
      recipes: dummyData.dummyRecipeOverviews,
    })
    // return fetch('https://jsonplaceholder.typicode.com/posts', {body: JSON.stringify(this.state.selectedFoods)})
    //   .then(response => response.json())
    //   .then(data => {
    //     this.setState(
    //       {
    //         recipes: data
    //       }
    //     );
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }

  onPressFilter() {
    this.setState({
      filterModalViewable: true,
    })
  }

  filterModalResults(filters: any) {
    this.setState({
      filterModalViewable: false,
      filters: filters
    })

    // return fetch('https://jsonplaceholder.typicode.com/posts', {body: JSON.stringify(filters)})
    //   .then(response => response.json())
    //   .then(data => {
    //     this.setState(
    //       {
    //         recipes: data,
    //         filterModalViewable: false,
    //         filters: filters
    //       }
    //     );
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }

  navigateRecipe(recipeId: string) {
    console.log(`navigate to recipe with id ${recipeId}`)
  }

  saveRecipe(recipeId: string) {
    const replaceRecipes = this.state.recipes
    const recipeIndex = replaceRecipes.findIndex((recipe) => {return recipe.id === recipeId})
    if (recipeIndex !== -1) {
      replaceRecipes[recipeIndex].saved = !this.state.recipes[recipeIndex].saved
    }
    this.setState({
      recipes: replaceRecipes
    })
  }

  dismissRecipe(recipeId: string) {
    const replaceRecipes = this.state.recipes
    const recipeIndex = replaceRecipes.findIndex((recipe) => {return recipe.id === recipeId})
    if (recipeIndex !== -1) {
      replaceRecipes.splice(recipeIndex, 1)
    }
    this.setState({
      recipes: replaceRecipes
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flexDirection:'row'}}>
          <SectionList
            horizontal
            contentContainerStyle={{marginRight: 50}}
            sections={[ 
              {data: this.state.filters.mealType}, 
              {data: this.state.filters.dietaryPreference}, 
              {data: this.state.filters.cuisine} ]}
            renderItem={({ item }) => (<Text>{item + "   "}</Text>)}
          />
            <TouchableWithoutFeedback onPress={this.onPressFilter}>
              <MaterialIcons name="filter-list" size={24} color="black" 
                style={{marginLeft: 'auto', marginBottom: 10, marginTop: -5}} />
            </TouchableWithoutFeedback>
        </View>
        <FlatList
          horizontal={false}
          numColumns={2}
          data={this.state.recipes} 
          renderItem={({item}) => (
            <RecipeOverview 
            id={item.id}
            title={item.title}
            imageIndex={item.imageIndex}
            dietaryPreferences={item.dietaryPreference}
            saved={item.saved}
            onPressNavigate={this.navigateRecipe}
            saveRecipe={this.saveRecipe}
            dismissRecipe={this.dismissRecipe}
          />
          )}
          keyExtractor={(item, index) => item.id}
        />        
        <FilterModal 
          modalVisible={this.state.filterModalViewable} 
          filters={this.state.filters} 
          modalResults={this.filterModalResults}
          />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
    paddingLeft: 15,
    paddingRight: 15,
  },
});


/*
  FE-TODO
    FEATURE
      - back button and slide back 
    FUNCTIONALITY
      - list filters at top (scroll horizontally if too many to display) 
      - fix filtering
    DESIGN
      - filter display
*/

/*
  BE-TODO
    - query for all recipes fitting ingredients specifications 
    - query for all recipes fitting filter specifications
*/