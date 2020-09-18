import * as React from 'react';
import { StyleSheet, SectionList, TouchableWithoutFeedback, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Ionicons } from '@expo/vector-icons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Text, View } from '../components/Themed';
import RecipeOverview from '../components/RecipeOverview'
import FilterModal from '../components/FilterModal'
import dummyData from "../dummyData.json";
import { HomeParamList } from '../types';

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
  navigation: StackNavigationProp<HomeParamList, 'HomeResultScreen'>,
  route: RouteProp<HomeParamList, 'HomeResultScreen'>
}

interface State {
  specifiedItems: Array<any>
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
    const specifiedItems = JSON.parse(JSON.stringify(this.props.route.params.specifiedItems))
    this.state = { 
      specifiedItems: specifiedItems,
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
    this.modalVisibility = this.modalVisibility.bind(this)
  }

  componentDidMount() {
    this.setState({
      recipes: dummyData.dummyRecipeOverviews,
    })

    // get all recipes with specifiedItems
  }

  onPressFilter() {
    this.setState({
      filterModalViewable: false,
    })

    setTimeout(() => this.setState({
      filterModalViewable: true,
    }), 10)
  }

  filterModalResults(filters: any) {
    this.setState({
      filterModalViewable: false,
      filters: filters
    })

    // get all recipes with specifiedItems and filters
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

  modalVisibility(visible: boolean) {
    this.setState({
      filterModalViewable: visible
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flexDirection:'row', marginLeft: 5, marginRight: 25}}>
          <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
            <Ionicons name="ios-arrow-back" size={24} color="black" style={{marginTop: -5}}/>
          </TouchableWithoutFeedback>
          {(this.state.filters.mealType.length || 
            this.state.filters.dietaryPreference.length || 
            this.state.filters.cuisine.length) ? 
            <Text style={{ marginLeft: 15, fontWeight: 'bold'}}>Filters:</Text> : 
            <Text></Text>}
          <SectionList
            horizontal
            contentContainerStyle={{marginRight: 50, marginLeft: 10}}
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
          modalVisibility={this.modalVisibility}
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
    DESIGN
      - filter display on top
*/

/*
  BE-TODO
    REQUESTS
      - GET: all recipes fitting ingredients specifications 
      - GET: all recipes fitting filter specifications and ingredients specifications
*/