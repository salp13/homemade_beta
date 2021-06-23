import * as React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { HomeParamList, ProfileParamList, SearchParamList } from '../types'
import { Image, Text, View } from '../components/Themed';
import { recipeEntireType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import { SectionList, TouchableWithoutFeedback } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeNavigationProp = StackNavigationProp<HomeParamList, 'IndividualRecipeScreen'>;
type HomeRouteProp = RouteProp<HomeParamList, 'IndividualRecipeScreen'>;
type SearchNavigationProp = StackNavigationProp<SearchParamList, 'IndividualRecipeScreen'>;
type SearchRouteProp = RouteProp<SearchParamList, 'IndividualRecipeScreen'>;
type ProfileNavigationProp = StackNavigationProp<ProfileParamList, 'IndividualRecipeScreen'>;
type ProfileRouteProp = RouteProp<ProfileParamList, 'IndividualRecipeScreen'>;

interface Props {
  navigation: HomeNavigationProp | SearchNavigationProp | ProfileNavigationProp,
  route: HomeRouteProp | SearchRouteProp | ProfileRouteProp
}

interface State {
    isLoading: boolean
    token: string
    user_id: string
    recipe: recipeEntireType
    saved: boolean
}

export default class IndividualRecipeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      token: '', 
      user_id: '', 
      recipe: {
        recipe_id: JSON.parse(JSON.stringify(this.props.route.params.recipe_id)),
        recipe_name: '',
        image: '',
        diets: [],
        cuisine: undefined,
        meal_type: undefined,
        instructions: '',
        description: '',
        ingredients: [],
      },
      saved: false,
    };

    this.saveRecipe = this.saveRecipe.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
  }

  async componentDidMount() {
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID
      })
    }


    // hit api for single recipe
    let recipe_data = await fetch(`http://localhost:8000/homemade/single_recipe/${this.state.recipe.recipe_id}`, {
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
    });

    // hit api for user's saved recipes
    await fetch(`http://localhost:8000/homemade/many_saved_recipes/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => {
        const filtered_data = data.find((recipe) => {return recipe.recipe_id === this.state.recipe.recipe_id})
        this.setState({
          isLoading: false,
          recipe: recipe_data,
          saved: filtered_data ? true : false,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  async saveRecipe() {
    // if the recipe is saved, delete it from saved recipes
    if (this.state.saved) {
      await fetch(`http://localhost:8000/homemade/single_saved_recipe/${this.state.user_id}/${this.state.recipe.recipe_id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      })
      .catch(error => {
      console.error(error);
      });
      this.setState({
        saved: false
      })
    // if the recipe is not saved, save it to saved recipes
    } else {
      await fetch(`http://localhost:8000/homemade/single_saved_recipe/${this.state.user_id}/${this.state.recipe.recipe_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      })
        .catch(error => {
          console.error(error);
        });

      this.setState({
        saved: true
      })
    }
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    let dietaryPrefs = ''
    this.state.recipe.diets.forEach((pref, index) => {
    dietaryPrefs = dietaryPrefs.concat(pref.diet)
    if (index !== this.state.recipe.diets.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    let instructions = this.state.recipe.instructions.split("\n").map((ele) => {return ele.trim()})

    return (
    <View style={styling.setFlex}>
      <View style={styling.positioningSetUp}>
        <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
          <Ionicons name="ios-arrow-back" color="black" style={StyleSheet.flatten([styling.largeIconSize, styling.noHeader])}/>
        </TouchableWithoutFeedback>
      </View>
      <Image style={styling.fullRecipeImage} source={{uri: `/Users/susiealptekin/Desktop/homemade/homemade_beta/homemade_beta/api/api${this.state.recipe.image}`}}/>
      <View style={styling.container}>
        <View style={styling.flexRow}>
          <Text style={styling.fullRecipeName}>{this.state.recipe.recipe_name}</Text>
          <View style={styling.formatSave}>  
            <TouchableWithoutFeedback onPress={this.saveRecipe}>
                <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} style={styling.iconSize} color="black" />
            </TouchableWithoutFeedback>
          </View>
        </View>

        <View style={styling.flexRow}>
            <Text>{dietaryPrefs}</Text>
        </View>

        <SectionList
          style={styling.sectionBuffer}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          sections={[ 
            {recipe_name: "Ingredients", data: this.state.recipe.ingredients.map((ingredient) => ingredient.description)}, 
            {recipe_name: "Directions", data: instructions} ]}
          renderItem={({item}) => ( <Text style={styling.recipeDirections}>{item}</Text> )}
          renderSectionHeader={({section}) => ( 
            <Text style={styling.recipeDirectionsHeader}>{section.recipe_name}</Text> 
            )}
          renderSectionFooter={() => ( <View style={styling.recipeDirectionsFooter}></View> )}
          /> 
          
      </View>
    </View>
    );
  }
}