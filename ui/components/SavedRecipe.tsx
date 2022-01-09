import React from 'react';
import { StyleSheet } from 'react-native';
import { Fontisto } from '@expo/vector-icons'; 
import { Text, View, Image } from './Themed';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { styling } from '../style';


interface Props {
  recipe_id: string
  recipe_name: string
  image: string
  dietaryPreferences: Array<{
    diet_id: number
    diet: string
  }>
  saved: boolean
  onPressNavigate: Function
  saveRecipe: Function
}

interface State {
  recipe_id: string
  recipe_name: string
  image: string
  dietaryPreferences: Array<{
    diet_id: number
    diet: string
  }>
  saved: boolean
}

export default class RecipeOverview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      recipe_id: this.props.recipe_id,
      recipe_name: this.props.recipe_name,
      image: this.props.image,
      dietaryPreferences: this.props.dietaryPreferences,
      saved: this.props.saved
    }

    this.OnPressNavigate = this.OnPressNavigate.bind(this)
    this.OnPressUnsave = this.OnPressUnsave.bind(this)
  }

  componentDidUpdate() {
    // if the new recipe id is different from stored state recipe id or if the saved flag has changed, update state
    if (this.state.recipe_id !== this.props.recipe_id || this.state.saved !== this.props.saved) {
      this.setState({
        recipe_id: this.props.recipe_id,
        recipe_name: this.props.recipe_name,
        image: this.props.image,
        dietaryPreferences: this.props.dietaryPreferences,
        saved: this.props.saved
      })
    }
  }

  OnPressNavigate = () => {
    // trigger a navigation to the individual recipe screen
    this.props.onPressNavigate(this.state.recipe_id)
  }

  OnPressUnsave = () => {
    // unsave the recipe
    this.props.saveRecipe(this.state.recipe_id)
  }
    
  render() {
    // formatting for the dietary preferences related to this recipe
    let dietaryPrefs = ''
    this.state.dietaryPreferences.forEach((pref, index) => {
      dietaryPrefs = dietaryPrefs.concat(pref.diet)
      if (index !== this.state.dietaryPreferences.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })

    dietaryPrefs = (dietaryPrefs.length > 30) ? dietaryPrefs.slice(0, 30) + "..." : dietaryPrefs

    let recipe_name = (this.state.recipe_name.length > 25) ? this.state.recipe_name.slice(0, 25) + "..." : this.state.recipe_name
    // recipe_name = this.state.recipe_name
    return (
      <View style={styling.setFlex}>
          <View style={styling.flexRow}>
            <View style={{flex: 6}}>
              <TouchableWithoutFeedback onPress={this.OnPressNavigate}>
                  <View style={[styling.flexRow]}>
                      <Image style={styling.savedRecipeImage} source={{uri: this.state.image}}/>
                      <View style={styling.upRightBuffer}>
                          <Text style={styling.savedRecipeText}>{recipe_name}</Text>
                          <Text style={styling.defaultFontSize}>{dietaryPrefs}</Text>
                      </View>
                  </View>
              </TouchableWithoutFeedback>
            </View>
            <View style={[styling.savedBookmarkPadding, {flex: 1}]}> 
                <TouchableWithoutFeedback onPress={this.OnPressUnsave}>
                    <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} style={styling.iconSize} color="black" />
                </TouchableWithoutFeedback>
            </View>
          </View>
      </View>
    );
  }
}