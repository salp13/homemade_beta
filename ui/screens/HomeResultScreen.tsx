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
  }

  async componentDidMount() {
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
    this.setState({
      filterModalViewable: false,
    })

    setTimeout(() => this.setState({
      filterModalViewable: true,
    }), 10)
  }

  async filterModalResults(filters: filterObjectType) {
    await this.setState({
      filterModalViewable: false,
      filters: filters
    })
    let url = `http://localhost:8000/homemade/many_recipes/`
    let query_string = "?"

    this.state.filters.mealType.forEach((type) => query_string = query_string.concat(`&meal_type=${type}`))
    this.state.filters.dietaryPreference.forEach((type) => query_string = query_string.concat(`&dietary_preference=${type}`))
    this.state.filters.cuisine.forEach((type) => query_string = query_string.concat(`&cuisine=${type}`))
    if (query_string !== "?") url = url + query_string

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
    this.props.navigation.navigate('IndividualRecipeScreen', {recipe_id: recipe_id})
  }

  async saveRecipe(recipeId: string) {
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
    this.setState({
      dismissed: this.state.dismissed.add(recipeId)
    })
  }

  modalVisibility(visible: boolean) {
    this.setState({
      filterModalViewable: visible
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
          data={this.state.recipes.filter((recipe) => {return !this.state.dismissed.has(recipe.recipe_id)})} 
          renderItem={({item}) => (
            <RecipeOverview 
            recipe={item}
            saved={(this.state.user_saved.has(item.recipe_id)) ? true : false}
            onPressNavigate={this.navigateRecipe}
            saveRecipe={this.saveRecipe}
            dismissRecipe={this.dismissRecipe}
          />
          )}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
    paddingLeft: 15,
    paddingRight: 15,
  },
});
