import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Fontisto } from '@expo/vector-icons'; 

import { Text, View, Image } from './Themed';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';

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

interface Props {
  recipe: recipe
  saved: boolean
  onPressNavigate: Function
  saveRecipe: Function
  dismissRecipe: Function
}

interface State {
  recipe_id: string
  recipe_name: string
  imageIndex: string
  dietaryPreferences: Array<{
    diet_id: number,
    diet: string
  }>
  saved: boolean
}

const images = [
  require("./CurryGroundTurkey.jpg"),
  require("./GroundTurkeyEmpanada.jpg"),
  require("./GroundTurkeyPasta.jpeg"),
  require("./GroundTurkeyPastaDinner.jpg"),
  require("./GroundTurkeySloppyJoes.jpg"),
  require("./GroundTurkeyStroganoff.jpg"),
  require("./GroundTurkeyTacoZoodles.jpg")
]

export default class RecipeOverview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      recipe_id: this.props.recipe.recipe_id,
      recipe_name: this.props.recipe.recipe_name,
      imageIndex: this.props.recipe.image,
      dietaryPreferences: this.props.recipe.diets,
      saved: this.props.saved
    }

    this.OnPressNavigate = this.OnPressNavigate.bind(this)
    this.OnPressSave = this.OnPressSave.bind(this)
    this.OnPressDismiss = this.OnPressDismiss.bind(this)
  }

  componentDidUpdate() {
    if (this.state.recipe_id !== this.props.recipe.recipe_id || this.state.saved !== this.props.saved) {
      this.setState({
        recipe_id: this.props.recipe.recipe_id,
        recipe_name: this.props.recipe.recipe_name,
        imageIndex: this.props.recipe.image,
        dietaryPreferences: this.props.recipe.diets,
        saved: this.props.saved
      })
    }
  }

  OnPressNavigate = () => {
    this.props.onPressNavigate(this.state.recipe_id)
  }

  OnPressSave = () => {
    this.props.saveRecipe(this.state.recipe_id)
  }

  OnPressDismiss = () => {
    this.props.dismissRecipe(this.state.recipe_id)
  }
    
    
  render() {
    let dietaryPrefs = ''
    this.state.dietaryPreferences.forEach((pref, index) => {
      dietaryPrefs = dietaryPrefs.concat(pref.diet)
      if (index !== this.state.dietaryPreferences.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={this.OnPressNavigate}>
          <Image style={styles.image} source={images[this.state.imageIndex]}/>
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