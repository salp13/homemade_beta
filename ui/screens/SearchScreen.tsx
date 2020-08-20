import * as React from 'react';
import { StyleSheet, FlatList, Platform, TouchableWithoutFeedback, SectionList} from 'react-native';
import {SearchBar as SearchBarElement} from 'react-native-elements'
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; 


import { Text, View, SearchBar } from '../components/Themed';
import dummyData from '../dummyData.json'
import { SearchParamList } from '../types'
import RecipeOverview from '../components/RecipeOverview'
import FilterModal from '../components/FilterModal'

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
  navigation: StackNavigationProp<SearchParamList, 'SearchScreen'>,
  route: RouteProp<SearchParamList, 'SearchScreen'>
}

interface State {
  search: string
  recipes: Array<recipe>
  filters: {
    mealType: Array<string>,
    dietaryPreference: Array<string>,
    cuisine: Array<string>
  }
  filterModalViewable: boolean
}


export default class FridgeScreen extends React.Component<Props, State> {
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
      search: '',
      recipes: [],
      filters: {
        mealType: [],
        dietaryPreference: [],
        cuisine: []
      },
      filterModalViewable: false,
    };

    this.OnChangeSearch = this.OnChangeSearch.bind(this)
    this.OnClearSearch = this.OnClearSearch.bind(this)
    this.onPressFilter = this.onPressFilter.bind(this)
    this.filterModalResults = this.filterModalResults.bind(this)
    this.navigateRecipe = this.navigateRecipe.bind(this)
    this.saveRecipe = this.saveRecipe.bind(this)
    this.dismissRecipe = this.dismissRecipe.bind(this)
    this.modalVisibility = this.modalVisibility.bind(this)
  }

  componentDidMount() {
    const recipes = JSON.parse(JSON.stringify(dummyData.dummyRecipeOverviews)) 

    this.setState({
      recipes: recipes,
    })

    // TODO: query for all recipe items
  }


  OnChangeSearch(text: string) {
    let recipes = JSON.parse(JSON.stringify(dummyData.dummyRecipeOverviews)) 

    if (text === '') {
      this.setState({
        recipes: recipes,
        search: text
      });
      return
    }

    const lowerCaseText = text.toLowerCase()
    const otherrecipes = recipes.filter((recipe) => {return recipe.title.toLowerCase().includes(lowerCaseText)}) 
    
    this.setState({
      recipes: otherrecipes,
      search: text
    });

    // TODO: query for all recipes that match search params
  }

  OnClearSearch() {
    let recipes = JSON.parse(JSON.stringify(dummyData.dummyRecipeOverviews)) 
    
    this.setState({
      recipes: recipes,
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

  filterModalResults(filters: any) {
    this.setState({
      filterModalViewable: false,
      filters: filters
    })

    // TODO: apply filters on recipes
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

    // TODO: post recipe to user's saved
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


/*
  FE-TODO
    DESIGN
      - filter display
    
  BE-TODO
    REQUESTS
      - GET: all recipes
      - GET: all recipes that match search params

  FS-TODO
    - decide how to load many recipes (backend vs frontend)
*/