import * as React from 'react';
import { ActivityIndicator, StyleSheet, FlatList, Platform, TouchableWithoutFeedback, SectionList} from 'react-native';
import FilterModal from '../components/FilterModal'
import { filterObjectType, recipeType } from '../objectTypes'
import { MaterialIcons } from '@expo/vector-icons'; 
import RecipeOverview from '../components/RecipeOverview'
import { RouteProp } from '@react-navigation/native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { SearchBar, Text, View } from '../components/Themed';
import { StackNavigationProp } from '@react-navigation/stack';
import { SearchParamList } from '../types'
import { styling } from '../style';

interface Props {
  navigation: StackNavigationProp<SearchParamList, 'SearchScreen'>,
  route: RouteProp<SearchParamList, 'SearchScreen'>
}

interface State {
  isLoading: boolean
  search: string
  recipes: Array<recipeType>
  dismissed: Set<string>
  user_saved: Set<string>
  filters: filterObjectType
  filterModalViewable: boolean
}

interface Arrayholder {
  arrayholder: Array<any>
}

export default class FridgeScreen extends React.Component<Props, State, Arrayholder> {
  arrayholder: Array<any> = [];  
  private searchRef = React.createRef<SearchBarElement>();
  private searchBarProps = {
    placeholder: "Search for a recipe...",
    autoCorrect: false,
    showCancel: true,
    containerStyle: styling.searchBarContainerStyle,
    inputContainerStyle: styling.searchBarInputContainerStyle,
    inputStyle: styling.defaultFontSize,
    cancelButtonProps: {buttonTextStyle: styling.defaultFontSize},
    reference: this.searchRef,
  }

  constructor(props?: any) {
    super(props);
    this.state = { 
      isLoading: true,
      search: '',
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
    this.arrayholder = [];

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
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
    // hit api for all recipes
    let recipe_data = await fetch(`http://localhost:8000/homemade/many_recipes/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => { return data })
    .catch(error => {
      console.error(error);
    });

    // hit api for user's saved recipes
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
      this.arrayholder = recipe_data
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

  OnChangeSearch(text: string) {
    // filter recipes based on search text
    const allRecipesSearched = this.arrayholder.filter(function(item: recipeType) {
      const itemData = item.recipe_name ? item.recipe_name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.startsWith(textData);
    });

    this.setState({
      recipes: allRecipesSearched,
      search: text,
    });
  }

  OnClearSearch() {    
    // clear search text and reset recipes
    this.setState({
      recipes: this.arrayholder,
      search: '',
    });
  }

  onPressFilter() {
    // set filter modal to visible with delay for time needed for modal update render
    this.setState({
      filterModalViewable: false,
    })

    setTimeout(() => this.setState({
      filterModalViewable: true,
    }), 10)
  }

  async filterModalResults(filters: any) {
    await this.setState({
      filterModalViewable: false,
      filters: filters
    })
    // format query url using results from filter modal
    let url = `http://localhost:8000/homemade/many_recipes/`
    let query_string = "?"

    this.state.filters.mealType.forEach((type) => query_string = query_string.concat(`&meal_type=${type}`))
    this.state.filters.dietaryPreference.forEach((type) => query_string = query_string.concat(`&dietary_preference=${type}`))
    this.state.filters.cuisine.forEach((type) => query_string = query_string.concat(`&cuisine=${type}`))
    if (query_string !== "?") url = url + query_string

    // hit api for filtered recipes
    await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      this.arrayholder = data
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
    // navigte to individual recipe screen
    this.props.navigation.navigate('IndividualRecipeScreen', {recipe_id: recipe_id})
  }

  async saveRecipe(recipeId: string) {
    // if user has recipe saved, delete it from saved
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
    // if user does not have recipe saved, save it 
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
    // set modal visibility to specified boolean
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
        <View style={styling.flexRow}>
          <SearchBar
            onChangeText={text => this.OnChangeSearch(text)}
            onClear={this.OnClearSearch}
            value={this.state.search}
            platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
            {...this.searchBarProps}
          />
          <View style={styling.addButton}>
            <TouchableWithoutFeedback onPress={this.onPressFilter}>
              <MaterialIcons name="filter-list" color="black" style={StyleSheet.flatten([styling.iconSize, styling.autoLeft])}/>
            </TouchableWithoutFeedback>
          </View>
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
          keyboardShouldPersistTaps='always'
          horizontal={false}
          numColumns={2}
          ItemSeparatorComponent={() => (<View style={{marginHorizontal: 10}}></View>)}
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