import * as React from 'react';
import { StyleSheet, TouchableWithoutFeedback, SectionList, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SimpleLineIcons } from '@expo/vector-icons';

import { Text, View, Image } from '../components/Themed';
import SavedRecipe from '../components/SavedRecipe'
import { ProfileParamList } from '../types'
import dummyData from '../dummyData.json'

type ProfileScreenNavigationProp = StackNavigationProp<ProfileParamList, 'ProfileScreen'>;
type ProfileScreenRouteProp = RouteProp<ProfileParamList, 'ProfileScreen'>;

interface Props {
  navigation: ProfileScreenNavigationProp,
  route: ProfileScreenRouteProp
}

interface State {
  toggle: boolean
  metrics: any
  savedRecipes: Array<any>
  fridgeCount: number
  username: string
  name: string
}

const images = [
  require("../components/vegetable.png"),
  require("../components/protein.png"),
  require("../components/milk.png"),
  require("../components/sauce.png"),
  require("../components/corn.png"),
]

export default class HomeScreen extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props)

    this.state = {
      toggle: true,
      metrics: {},
      savedRecipes: [],
      fridgeCount: 0,
      username: '',
      name: '',
    }

    this.unsaveRecipe = this.unsaveRecipe.bind(this)
    this.navigateRecipe = this.navigateRecipe.bind(this)
    this.onPressSettings = this.onPressSettings.bind(this)
  }


  componentDidMount() {
    const userData = JSON.parse(JSON.stringify(dummyData.dummyUserData))
    this.props.navigation.setOptions({ headerTitle: userData.username })
    this.setState({
      username: userData.username,
      name: userData.name,
      fridgeCount: userData.currentFridgeCount,
      savedRecipes: userData.savedRecipes,
      metrics: {
        percentage: userData.notWastedPercentage,
        foodGroupIndex: userData.foodGroupWastedImageIndex,
        averageFridgeCount: userData.averageFridgeCount,
      },
    })

    // get user data
  }

  unsaveRecipe(recipeId: string) {
    // delete recipeId from user's savedrecipes
    console.log(recipeId)
  }

  navigateRecipe(recipeId: string) {
    console.log(`navigate to recipe with id ${recipeId}`)
    this.props.navigation.navigate('IndividualRecipeScreen', {recipeId: recipeId})
  }

  onPressSettings() {
    this.props.navigation.navigate('SettingsScreen')
  }

  render() {
    return (
      <View style={styles.container}>
          <View style={{marginLeft: 'auto', marginRight: 20, marginTop: 10}}>
            <TouchableWithoutFeedback onPress={this.onPressSettings}>
              <SimpleLineIcons name="settings" size={24} color="black" />
            </TouchableWithoutFeedback>
          </View>
        <View style={{marginTop: 30, marginBottom: 50}}>
          <Text style={styles.usersName}>{this.state.name}</Text>
          <Text style={styles.currentFridgeCount}>your fridge has {this.state.fridgeCount} items</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View style={{marginRight:'auto', marginLeft: 60}}>
            <Text style={this.state.toggle ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>Your Metrics</Text>
          </View>
          <View style={{marginLeft:'auto', marginRight: 55}}>
            <Text style={!this.state.toggle ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>Saved Recipes</Text>
          </View>
        </View> 
        <View>
          <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <View style={!this.state.toggle ? StyleSheet.flatten([styles.halfSeparator, {marginLeft: 'auto'}]) : styles.halfSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </View>
        {this.state.toggle ? 
        (<View>
          <View style={{flexDirection: 'row', marginVertical: 40}}>
            <View style={styles.fridgeCountCircle}>
            <Text style={{marginTop: 28, marginLeft: 15, fontSize: 35}}>{this.state.metrics.percentage}%</Text>
            </View>
            <Text style={{marginTop: 20, marginLeft: 30, fontSize: 15}}>Great Job!{"\n"}94% of food in your fridge{"\n"} is eaten instead of wasted!</Text>
          </View>
          <View style={{flexDirection: 'row', marginBottom: 40}}>
            <View style={styles.fridgeCountCircle}>
            <Text style={{marginTop: 5, marginLeft: 25, fontSize: 75}}>{this.state.metrics.averageFridgeCount}</Text>
            </View>
            <Text style={{marginTop: 40, marginLeft: 30, fontSize: 15}}>items on average in fridge</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={images[this.state.metrics.foodGroupIndex]}/>
            </View>
            <Text style={{marginTop: 40, marginLeft: 30, fontSize: 15}}>food group wasted the most often</Text>
          </View>
        </View>) : 
        (<View>
          <FlatList 
            data={this.state.savedRecipes}
            renderItem={({item}) => (
              <SavedRecipe 
              id={item.id}
              title={item.title}
              imageIndex={item.imageIndex}
              dietaryPreferences={item.dietaryPreference}
              saved={item.saved}
              onPressNavigate={this.navigateRecipe}
              saveRecipe={this.unsaveRecipe}
            />)}
            />
        </View>)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: -240,
  },
  usersName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 5
  },
  currentFridgeCount: {
    fontSize: 15,
    marginHorizontal: 20
  },
  completeSeparator: {
    marginVertical: 10,
    height: 1,
  },
  halfSeparator: {
    marginTop: -11.5,
    height: 1,
    borderWidth: 0.5,
    width: "50%",
  },
  toggleHeader: {
    marginVertical: 30,
    height: 1,
  },
  fridgeCountCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: 20,
    borderWidth: 1
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: 20,
    overflow: "hidden",
    backgroundColor: "#ccc"
  },
  image: {
    width: 75,
    height: 75,
    marginTop: 7,
    left: 11,
    backgroundColor: "#ccc"
  },
});


/*
  FE-TODO
    FUNCTIONALITY
      - metric visuals
      - toggle swipe

  BE-TODO
    REQUESTS
      - GET: user data
*/