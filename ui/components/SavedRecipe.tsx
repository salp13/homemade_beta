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

    this.OnPressNavigate = this.OnPressNavigate.bind(this)
    this.OnPressUnsave = this.OnPressUnsave.bind(this)
  }

  componentDidUpdate() {
    if (this.state.id !== this.props.id || this.state.saved !== this.props.saved) {
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

  OnPressUnsave = () => {
    this.props.saveRecipe(this.state.id)
  }
    
    
  render() {
    let dietaryPrefs = ''
    this.state.dietaryPreferences.forEach((pref, index) => {
      dietaryPrefs = dietaryPrefs.concat(pref)
      if (index !== this.state.dietaryPreferences.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    return (
      <View style={styles.container}>
          <View style={{flexDirection:'row'}}>
            <TouchableWithoutFeedback onPress={this.OnPressNavigate}>
                <View style ={{flexDirection: 'row'}}>
                    <Image style={styles.image} source={images[this.state.imageIndex]}/>
                    <View style={{marginLeft: 20, marginTop: 20}}>
                        <Text style={{fontWeight: 'bold', marginBottom: 4}}>{this.state.title}</Text>
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


/*
  BE-TODO
    REQUESTS
      - GET: image to render from database
*/