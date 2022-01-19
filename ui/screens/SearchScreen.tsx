import * as React from 'react';
import { ActivityIndicator, StyleSheet, FlatList, Platform, RefreshControl, TouchableWithoutFeedback, SectionList} from 'react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: StackNavigationProp<SearchParamList, 'SearchScreen'>,
  route: RouteProp<SearchParamList, 'SearchScreen'>
}

interface State {
  isLoading: boolean
  updateLoading: boolean
  errorText: string
  token: string
  user_id: string
  refreshing: boolean
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
      updateLoading: false,
      errorText: '',
      token: '', 
      user_id: '', 
      refreshing: false,
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
    this.errorMessage = this.errorMessage.bind(this)
    this.OnRefresh = this.OnRefresh.bind(this)
  }

  async componentDidMount() {
    // set token and user_id
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID
      })
    }

    // hit api for all recipes
    let recipe_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_recipes/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
    .then(response => response.json())
    .then(data => { return data })
    .catch(error => {
      console.error(error);
      this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
    });

    await AsyncStorage.getItem('@saved_recipes')
      .then((data) => { 
        if (data) { 
          let parsed_data = JSON.parse(data)
          let saved_set = new Set<string>()
          parsed_data.forEach((recipe) => {
            saved_set.add(recipe.recipe_id)
          })
          this.setState({ 
            isLoading: false,
            recipes: recipe_data,
            user_saved: saved_set,
          })
        }}
      )

    // hit api for user's saved recipes
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_saved_recipes/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
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
      try {
        AsyncStorage.setItem('@saved_recipes', JSON.stringify(data))
      } catch (e) {
        console.error(e)
      }
    })
    .catch(error => {
      console.error(error);
      this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
    });
  }

  OnChangeSearch(text: string) {
    // filter recipes based on search text
    const allRecipesSearched = this.arrayholder.filter(function(item: recipeType) {
      const itemData = item.recipe_name ? item.recipe_name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      let lenientData = ''
      if (textData != '') lenientData = " " + textData
      return itemData.startsWith(textData) || itemData.includes(lenientData);
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

  OnRefresh() {
    this.setState({refreshing: true})
    setTimeout(() => {this.setState({refreshing: false})}, 1000)
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
      filters: filters,
      updateLoading: true,
    })
    // format query url using results from filter modal
    let url = `https://homemadeapp.azurewebsites.net/homemade/many_recipes/${this.state.user_id}`
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
        'Authorization': 'Token ' + this.state.token,
      },
    })
    .then(response => response.json())
    .then(data => {
      this.arrayholder = data
      const search_text = this.state.search
      let recipes = this.arrayholder.filter(function(item: recipeType) {
        const itemData = item.recipe_name ? item.recipe_name.toUpperCase() : ''.toUpperCase();
        const textData = search_text.toUpperCase();
        let lenientData = ''
        if (textData != '') lenientData = " " + textData
        return itemData.startsWith(textData) || itemData.includes(lenientData);
      });

      this.setState({
        updateLoading: false,
        recipes: recipes,
      });
    })
    .catch(error => {
      console.error(error);
      this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
    });
  }

  navigateRecipe(recipe_id: string) {
    // navigate to individual recipe screen
    this.props.navigation.navigate('IndividualRecipeScreen', {recipe_id: recipe_id, trigger: false })
  }

  async saveRecipe(recipeId: string) {
    this.setState({ updateLoading: true })
    // if user has recipe saved, delete it from saved
    if (this.state.user_saved.has(recipeId)) {
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_saved_recipe/${this.state.user_id}/${recipeId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });

      let assign_saved = this.state.user_saved
      assign_saved.delete(recipeId)
      this.setState({
        user_saved: assign_saved,
        updateLoading: false,
      })
      try {
        await AsyncStorage.getItem('@saved_recipes').then(recipes => {
          if (recipes) AsyncStorage.setItem('@saved_recipes', JSON.stringify(JSON.parse(recipes).filter(recipe => {return recipe.recipe_id !== recipeId})))
        })
      } catch (e) {
        console.error(e)
      }
    // if user does not have recipe saved, save it 
    } else {
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_saved_recipe/${this.state.user_id}/${recipeId}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      }).then(response => response.json())
      .then(data => { 
        try {
          AsyncStorage.getItem('@saved_recipes').then(recipes => {
            if (recipes) AsyncStorage.setItem('@saved_recipes', JSON.stringify(JSON.parse(recipes).concat([data])))
          })
        } catch (e) { console.error(e) }
       })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });
      this.setState({
        user_saved: this.state.user_saved.add(recipeId),
        updateLoading: false,
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
      <View style={[styling.container, styling.noHeader]}>
        <ActivityIndicator />
      </View>
    )
  }

  errorMessage() {
    return (
        <View style={[styling.container, styling.noHeader]}>
        <Text>{this.state.errorText}</Text>
        </View>
    )
  }

  RecipeRender(item) {
    return (
      <RecipeOverview 
        recipe={item}
        updateLoading={this.state.updateLoading}
        saved={(this.state.user_saved.has(item.recipe_id)) ? true : false}
        onPressNavigate={this.navigateRecipe}
        saveRecipe={this.saveRecipe}
        dismissRecipe={this.dismissRecipe}
        />
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()
    if (this.state.errorText !== '') return this.errorMessage()

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
          {this.state.updateLoading ? (<ActivityIndicator style={styling.activityMargin} />) : (
            <View style={styling.addButton}>
              <TouchableWithoutFeedback onPress={this.onPressFilter}>
                <MaterialIcons name="filter-list" color="black" style={StyleSheet.flatten([styling.iconSize, styling.autoLeft])}/>
              </TouchableWithoutFeedback>
            </View>
          )}
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
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.OnRefresh} />
          }
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