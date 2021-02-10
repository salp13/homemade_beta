import * as React from 'react';
import { ActivityIndicator, StyleSheet, FlatList, Platform, TouchableWithoutFeedback, SectionList} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; 


import { Text, View, SearchBar } from '../components/Themed';
import { SearchParamList } from '../types'
import RecipeOverview from '../components/RecipeOverview'
import FilterModal from '../components/FilterModal'

type recipe = {
  recipe_id: string
  recipe_name: string
  image: string
  diets: Array<{
    diet_id: number
    diet: string
  }>
  cuisine: {
    cuisine_id: number
    cuisine: string
  }
  meal_type: {
    meal_type_id: number
    meal_type: string
  }
}

type filterObject = {
  mealType: Array<string>
  dietaryPreference: Array<string>
  cuisine: Array<string>
}

interface Props {
  navigation: StackNavigationProp<SearchParamList, 'SearchScreen'>,
  route: RouteProp<SearchParamList, 'SearchScreen'>
}

interface State {
  isLoading: boolean
  search: string
  recipes: Array<recipe>
  dismissed: Set<string>
  user_saved: Set<string>
  filters: filterObject
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
    containerStyle: styles.searchBarContainerStyle,
    inputContainerStyle: styles.searchBarInputContainerStyle,
    inputStyle: styles.searchBarTextStyle,
    cancelButtonProps: {buttonTextStyle: {fontSize: 15}},
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
  }

  async componentDidMount() {
    let recipe_data = await fetch(`http://localhost:8000/homemade/many_recipes`, {
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
    const allRecipesSearched = this.arrayholder.filter(function(item: recipe) {
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
    this.setState({
      recipes: this.arrayholder,
      search: '',
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

  async filterModalResults(filters: any) {
    await this.setState({
      filterModalViewable: false,
      filters: filters
    })
    let url = `http://localhost:8000/homemade/many_recipes`
    let query_string = "?"

    this.state.filters.mealType.forEach((type) => query_string = query_string.concat(`&meal_type=${type}`))
    this.state.filters.dietaryPreference.forEach((type) => query_string = query_string.concat(`&dietaryPreference=${type}`))
    this.state.filters.cuisine.forEach((type) => query_string = query_string.concat(`&cuisine=${type}`))
    if (query_string !== "?") url = url + query_string

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

  navigateRecipe(recipeId: string) {
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
        <View style={{flexDirection: 'row'}}>
          <SearchBar
            onChangeText={text => this.OnChangeSearch(text)}
            onClear={this.OnClearSearch}
            value={this.state.search}
            platform={Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "default"}
            {...this.searchBarProps}
          />
          <View style={{marginTop: 18, marginLeft: 10}}>
            <TouchableWithoutFeedback onPress={this.onPressFilter}>
              <MaterialIcons name="filter-list" size={24} color="black" 
                style={{marginLeft: 'auto'}} />
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={{flexDirection:'row', marginRight: 25, marginBottom: 10}}>
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
        </View>
        <FlatList
          keyboardShouldPersistTaps='always'
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
    paddingTop: 50,
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
    width: 335,
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