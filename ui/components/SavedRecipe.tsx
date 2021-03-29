import React from 'react';
import { StyleSheet } from 'react-native';
import { Fontisto } from '@expo/vector-icons'; 
import { Text, View, Image } from './Themed';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

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
    
    return (
      <View style={styles.container}>
          <View style={{flexDirection:'row'}}>
            <TouchableWithoutFeedback onPress={this.OnPressNavigate}>
                <View style ={{flexDirection: 'row'}}>
                    <Image style={styles.image} source={{uri: `/Users/susiealptekin/Desktop/homemade/homemade_beta/homemade_beta/api/api${this.state.image}`}}/>
                    <View style={{marginLeft: 20, marginTop: 20}}>
                        <Text style={{fontWeight: 'bold', marginBottom: 4}}>{this.state.recipe_name}</Text>
                        <Text style={{marginBottom: 4}}>{dietaryPrefs}</Text>
                    </View>
                </View>
            
            </TouchableWithoutFeedback>
            <View style={{marginLeft: 'auto', marginTop: 25}}> 
                <TouchableWithoutFeedback onPress={this.OnPressUnsave}>
                    <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} size={24} color="black" />
                </TouchableWithoutFeedback>
            </View>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 20
  },
  image: {
    width: 100,
    height: 80,
    marginBottom: 5
  },
});