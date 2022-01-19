import React from 'react';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Fontisto } from '@expo/vector-icons'; 
import { recipeType } from '../objectTypes'
import { Text, View, Image } from './Themed';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { styling } from '../style'

interface Props {
  updateLoading: boolean
  recipe: recipeType
  saved: boolean
  onPressNavigate: Function
  saveRecipe: Function
  dismissRecipe: Function
}

interface State {
  updateLoading: boolean
  recipe_id: string
  recipe_name: string
  owner_username: string
  image: string
  dietaryPreferences: Array<{
    diet_id: number,
    diet: string
  }>
  saved: boolean
}

export default class RecipeOverview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      updateLoading: this.props.updateLoading,
      recipe_id: this.props.recipe.recipe_id,
      recipe_name: this.props.recipe.recipe_name,
      owner_username: this.props.recipe.owner_username,
      image: this.props.recipe.image,
      dietaryPreferences: this.props.recipe.diets,
      saved: this.props.saved
    }

    this.OnPressNavigate = this.OnPressNavigate.bind(this)
    this.OnPressSave = this.OnPressSave.bind(this)
    this.OnPressDismiss = this.OnPressDismiss.bind(this)
  }

  componentDidUpdate() {
    // if the new recipe id is different from stored state recipe id or if the saved flag has changed, update state
    if (this.state.recipe_id !== this.props.recipe.recipe_id || this.state.saved !== this.props.saved || this.state.updateLoading !== this.props.updateLoading) {
      this.setState({
        updateLoading: this.props.updateLoading,
        recipe_id: this.props.recipe.recipe_id,
        recipe_name: this.props.recipe.recipe_name,
        owner_username: this.props.recipe.owner_username,
        image: this.props.recipe.image,
        dietaryPreferences: this.props.recipe.diets,
        saved: this.props.saved
      })
    }
  }

  OnPressNavigate = () => {
    // trigger a navigation to the individual recipe screen
    this.props.onPressNavigate(this.state.recipe_id)
  }

  OnPressSave = () => {
    // save the recipe
    this.props.saveRecipe(this.state.recipe_id)
  }

  OnPressDismiss = () => {
    // dismiss the recipe from view
    this.props.dismissRecipe(this.state.recipe_id)
  }

  render() {
    // formatting for the dietary preferences related to this recipe
    let dietaryPrefs = ''
    this.state.dietaryPreferences.forEach((pref, index) => {
      dietaryPrefs = dietaryPrefs.concat(pref.diet)
      if (index !== this.state.dietaryPreferences.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    
    return (
      <View style={styling.overviewContainer}>
        <View style={{flex: 5}}>
        <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={this.OnPressNavigate}>
          <View>
            <Image style={styling.overviewImage} source={{uri: this.state.image}}/>
          </View>
          <View>
            <Text style={styling.overviewName}>{this.state.recipe_name}</Text>
            <Text style={styling.ownerSpacing}>{this.state.owner_username}</Text>
          </View>
        </TouchableWithoutFeedback>
        </View>
        <View style={styling.flexRow}>
            <View style={styling.iconContainer}> 
              <View style={styling.iconSpacing}>
                <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={this.OnPressSave}>
                  <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} style={styling.iconSize} color="black" />
                </TouchableWithoutFeedback>
              </View>
              <View style={styling.iconSpacing}>
                <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={this.OnPressDismiss}>
                  <MaterialIcons name="clear" style={styling.iconSize} color="black"/>
                </TouchableWithoutFeedback>
              </View>
            </View>
            </View>
      </View>
    );
  }
}