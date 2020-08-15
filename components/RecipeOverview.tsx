import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Fontisto } from '@expo/vector-icons'; 

import { Text, View, Image } from './Themed';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface Props {
  id: string
  title: string
  imageIndex: number
  dietaryPreferences: Array<string>
  saved: boolean
  onPressNavigate: Function
  saveRecipe: Function
  dismissRecipe: Function
}

interface State {
  id: string
  title: string
  imageIndex: number
  dietaryPreferences: Array<string>
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
      id: this.props.id,
      title: this.props.title,
      imageIndex: this.props.imageIndex,
      dietaryPreferences: this.props.dietaryPreferences,
      saved: this.props.saved
    }

    this.OnPressDismiss = this.OnPressNavigate.bind(this)
    this.OnPressSave = this.OnPressSave.bind(this)
    this.OnPressDismiss = this.OnPressDismiss.bind(this)
  }

  componentDidUpdate() {
    if (this.state.id !== this.props.id) {
      this.setState({
          id: this.props.id,
          title: this.props.title,
          imageIndex: this.props.imageIndex,
          dietaryPreferences: this.props.dietaryPreferences,
          saved: this.props.saved
      })
    }
  }

  OnPressNavigate = () => {
    this.props.onPressNavigate(this.state.id)
  }

  OnPressSave = () => {
    this.props.saveRecipe(this.state.id)
  }

  OnPressDismiss = () => {
    this.props.dismissRecipe(this.state.id)
  }
    
    
  render() {
    let dietaryPrefs = ''
    this.state.dietaryPreferences.forEach((pref, index) => {
      dietaryPrefs = dietaryPrefs.concat(pref)
      if (index !== this.state.dietaryPreferences.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={this.OnPressNavigate}>
          <Image style={styles.image} source={images[this.state.imageIndex]}/>
          <View>
            <Text style={{fontWeight: 'bold', marginBottom: 4}}>{this.state.title}</Text>
            <Text style={{marginBottom: 4}}>{dietaryPrefs}</Text>
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
        </TouchableWithoutFeedback>
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


/*
  BE-TODO
    - get images to render from backend
*/