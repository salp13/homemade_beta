import * as React from 'react';
import { ActivityIndicator, FlatList, SectionList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import FilterModal from '../components/FilterModal'
import { filterObjectType, fridgeItemType, recipeType } from '../objectTypes'
import { HomeParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; 
import RecipeOverview from '../components/RecipeOverview'
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, View } from '../components/Themed';
import { styling } from '../style';

interface Props {
  navigation: StackNavigationProp<HomeParamList, 'HomeResultScreen'>,
  route: RouteProp<HomeParamList, 'HomeResultScreen'>
}

interface State {
  isLoading: boolean
  specifiedItems: Array<fridgeItemType>
  recipes: Array<recipeType>
  dismissed: Set<string>
  user_saved: Set<string>
  filters: filterObjectType
  filterModalViewable: boolean
}

export default class HomeResultScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const specifiedItems = JSON.parse(JSON.stringify(this.props.route.params.specifiedItems))
    this.state = { 
      isLoading: true,
      specifiedItems: specifiedItems,
      recipes: [],
      dismissed: new Set(),
      user_saved: new Set(),
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
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.RecipeRender = this.RecipeRender.bind(this)
  }

  async componentDidMount() {
    // hit api to get recipes that contain the ingredients from the specified items, must be a post request to be able to send a body
    let body = {"specifiedItems": this.state.specifiedItems}
    let recipe_data = await fetch('http://localhost:8000/homemade/many_recipes/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => { return data })
      .catch(error => {
        console.error(error);
      });
    
    // hit api to get the saved recipes from user
    await fetch(`http://localhost:8000/homemade/many_saved_recipes/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      let saved_set = new Set<string>()
      data.forEach((recipe) => {saved_set.add(recipe.recipe_id)})
      this.setState({
        isLoading: false,
        recipes: recipe_data,
        user_saved: saved_set,
      });
    })
    .catch(error => {
      console.error(error);
    });
  }

  onPressFilter() {
    // trigger filter modal
    this.setState({
      filterModalViewable: false,
    })
    // timeout in order to make sure the visibility persists between component updates
    setTimeout(() => this.setState({
      filterModalViewable: true,
    }), 10)
  }

  async filterModalResults(filters: filterObjectType) {
    await this.setState({
      filterModalViewable: false,
      filters: filters
    })
    // format query url for filter results
    let url = `http://localhost:8000/homemade/many_recipes/`
    let query_string = "?"

    this.state.filters.mealType.forEach((type) => query_string = query_string.concat(`&meal_type=${type}`))
    this.state.filters.dietaryPreference.forEach((type) => query_string = query_string.concat(`&dietary_preference=${type}`))
    this.state.filters.cuisine.forEach((type) => query_string = query_string.concat(`&cuisine=${type}`))
    if (query_string !== "?") url = url + query_string

    // hit api for filtered recipes with specified items
    let body = {"specifiedItems": this.state.specifiedItems}
    await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
      this.setState({
        isLoading: false,
        recipes: data,
      });
    })
    .catch(error => {
      console.error(error);
    });
  }

  navigateRecipe(recipe_id: string) {
    // navigate to the individual recipe
    this.props.navigation.navigate('IndividualRecipeScreen', {recipe_id: recipe_id})
  }

  async saveRecipe(recipeId: string) {
    // if the user has the recipe saved, delete it from saved
    if (this.state.user_saved.has(recipeId)) {
      await fetch(`http://localhost:8000/homemade/single_saved_recipe/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${recipeId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .catch(error => {
          console.error(error);
        });

      let assign_saved = this.state.user_saved
      assign_saved.delete(recipeId)
      this.setState({
        user_saved: assign_saved
      })
    // if the user does not have the recipe saved, save it 
    } else {
      await fetch(`http://localhost:8000/homemade/single_saved_recipe/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${recipeId}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .catch(error => {
          console.error(error);
        });

      this.setState({
        user_saved: this.state.user_saved.add(recipeId)
      })
    }
  }

  dismissRecipe(recipeId: string) {
    // dismiss the recipe
    this.setState({
      dismissed: this.state.dismissed.add(recipeId)
    })
  }

  modalVisibility(visible: boolean) {
    // update modal visibility
    this.setState({
      filterModalViewable: visible
    })
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
  }

  RecipeRender(item) {
    return (
      <RecipeOverview 
        recipe={item}
        saved={(this.state.user_saved.has(item.recipe_id)) ? true : false}
        onPressNavigate={this.navigateRecipe}
        saveRecipe={this.saveRecipe}
        dismissRecipe={this.dismissRecipe}
        />
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    return (
      <View style={StyleSheet.flatten([styling.noHeader, styling.container])}>
        <View style={styling.backArrow}>
          <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
            <Ionicons name="ios-arrow-back" color="black" style={styling.iconSize}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.onPressFilter}>
            <MaterialIcons name="filter-list" color="black" style={StyleSheet.flatten([styling.iconSize, styling.autoLeft])}/>
          </TouchableWithoutFeedback>
        </View>
        <View style={styling.filterTextContainer}>
          {(this.state.filters.mealType.length || 
              this.state.filters.dietaryPreference.length || 
              this.state.filters.cuisine.length) ? 
              <Text style={{fontWeight: 'bold'}}>Filters: </Text> : 
              <Text></Text>}
            <SectionList
              horizontal
              contentContainerStyle={styling.filterTextPadding}
              sections={[ 
                {data: this.state.filters.mealType}, 
                {data: this.state.filters.dietaryPreference}, 
                {data: this.state.filters.cuisine} ]}
              renderItem={({ item }) => (<Text>{item + "   "}</Text>)}
            />
          </View>
        <FlatList
          horizontal={false}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => (<View style={styling.userInfoBuffer}></View>)}
          data={this.state.recipes.filter((recipe) => {return !this.state.dismissed.has(recipe.recipe_id)})} 
          renderItem={({item}) => this.RecipeRender(item)}
          keyExtractor={(item, index) => item.recipe_id}
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
