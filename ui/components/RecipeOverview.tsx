import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Fontisto } from '@expo/vector-icons'; 
import { recipeType } from '../objectTypes'
import { Text, View, Image } from './Themed';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface Props {
  recipe: recipeType
  saved: boolean
  onPressNavigate: Function
  saveRecipe: Function
  dismissRecipe: Function
}

interface State {
  recipe_id: string
  recipe_name: string
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
      recipe_id: this.props.recipe.recipe_id,
      recipe_name: this.props.recipe.recipe_name,
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
    if (this.state.recipe_id !== this.props.recipe.recipe_id || this.state.saved !== this.props.saved) {
      this.setState({
        recipe_id: this.props.recipe.recipe_id,
        recipe_name: this.props.recipe.recipe_name,
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
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={this.OnPressNavigate}>
          <Image style={styles.image} source={{uri: `/Users/susiealptekin/Desktop/homemade/homemade_beta/homemade_beta/api/api${this.state.image}`}}/>
          <View>
            <Text style={{fontWeight: 'bold', marginBottom: 4}}>{this.state.recipe_name}</Text>
            <Text style={{marginBottom: 4}}>{dietaryPrefs}</Text>
          </View>
        </TouchableWithoutFeedback>
            <View style={{flexDirection: 'row', left: 125}}> 
              <View style={{left: -20}}>
                <TouchableWithoutFeedback onPress={this.OnPressDismiss}>
                  <MaterialIcons name="clear" size={24} color="black"/>
                </TouchableWithoutFeedback>
              </View>
              <TouchableWithoutFeedback onPress={this.OnPressSave}>
                <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} size={24} color="black" />
              </TouchableWithoutFeedback>
            </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    marginRight: 20,
    width: 170,
    height: 224
  },
  image: {
    width: 167,
    height: 133,
    marginBottom: 5
  },
});