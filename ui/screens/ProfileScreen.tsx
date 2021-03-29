import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Image, Text, View } from '../components/Themed';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import SavedRecipe from '../components/SavedRecipe'
import { StackNavigationProp } from '@react-navigation/stack';
import Swiper from 'react-native-swiper'
import { userDataType } from '../objectTypes'

type ProfileScreenNavigationProp = StackNavigationProp<ProfileParamList, 'ProfileScreen'>;
type ProfileScreenRouteProp = RouteProp<ProfileParamList, 'ProfileScreen'>;

interface Props {
  navigation: ProfileScreenNavigationProp,
  route: ProfileScreenRouteProp
}

interface State {
  isLoading: boolean
  toggle: boolean
  user_data: userDataType
  most_wasted_image: string
}

export default class HomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true,
      toggle: true,
      user_data: {
        user_id: "",
        saved_recipes: [],
        username: "",
        name: "",
        origin_account_date: "",
        waste_count: 0,
        eaten_count: 0,
        produce_wasted: 0,
        meat_wasted: 0,
        dairy_wasted: 0,
        total_items: 0,
        shopping_list: [],
        fridge: []
      },
      most_wasted_image: ""
    }

    this.unsaveRecipe = this.unsaveRecipe.bind(this)
    this.navigateRecipe = this.navigateRecipe.bind(this)
    this.onPressSettings = this.onPressSettings.bind(this)
    this.toggle = this.toggle.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.DetermineExclamation = this.DetermineExclamation.bind(this)
    this.CalculateAverageItems = this.CalculateAverageItems.bind(this)
  }


  async componentDidMount() {
    // hit api for user data
    const user_data = await fetch(`http://localhost:8000/homemade/metric_data/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      return data
    })
    .catch(error => {
      console.error(error);
    });

    // determine food group id of most wasted food group
    let id = 0
    if (this.state.user_data.produce_wasted >= this.state.user_data.meat_wasted && this.state.user_data.produce_wasted >= this.state.user_data.dairy_wasted) {
      id = 2
    } else if (this.state.user_data.meat_wasted >= this.state.user_data.dairy_wasted && this.state.user_data.meat_wasted > this.state.user_data.produce_wasted) {
      id = 3
    } else {
      id = 8
    } 
    // hit api to get most wasted food group's image
    await fetch(`http://localhost:8000/homemade/single_food_group/${id}`, {      
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      this.setState({
        isLoading: false,
        user_data: user_data,
        most_wasted_image: data.image
      });
    })
    .catch(error => {
      console.error(error);
    });
  }

  async unsaveRecipe(recipe_id: string) {
    // hit api to unsave saved recipe
    await fetch(`http://localhost:8000/homemade/single_saved_recipe/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${recipe_id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .catch(error => {
      console.error(error);
    });

    let assign_saved_recipes = this.state.user_data.saved_recipes.filter((recipe) => recipe.recipe_id !== recipe_id)
    let assign_user_data = this.state.user_data
    assign_user_data.saved_recipes = assign_saved_recipes
    this.setState({
      user_data: assign_user_data,
    });
  }

  navigateRecipe(recipe_id: string) {
    // navigate to individual recipe screen
    this.props.navigation.navigate('IndividualRecipeScreen', {recipe_id: recipe_id})
  }

  onPressSettings() {
    // navigate to settings screen
    this.props.navigation.navigate('SettingsScreen')
  }

  toggle() {
    // flip toggle to switch between metrics and saved recipes
    this.setState({
      toggle: !this.state.toggle
    })
  }

  IsLoadingRender() {
    return (
      <View style={{ flex: 1, paddingTop: 20 }}>
        <ActivityIndicator />
      </View>
    )
  }

  DetermineExclamation(percentage) {
    if (percentage < 70) return "Needs some work"
    else if (percentage < 80) return "Keep it up"
    else if (percentage < 90) return "You're doing great"
    else return "You're amazing!"
  }

  CalculateAverageItems() {
    let currentDate = new Date()
    let placehold = new Date(this.state.user_data.origin_account_date)
    let total_days = Math.ceil((currentDate.valueOf() - placehold.valueOf())/(24 * 60 * 60 * 1000))
    return Math.round((this.state.user_data.total_items / total_days) * 100)
  }

  render() {
    if (this.state.isLoading) this.IsLoadingRender()

    // metrics calculations and formatting 
    let percentage = Math.round((this.state.user_data.eaten_count / this.state.user_data.total_items)*100)
    let exclamation = this.DetermineExclamation(percentage)
    let avg_items = this.CalculateAverageItems()

    return (
      <View style={styles.container}>
        <View style={{marginTop: 30, marginBottom: 50}}>
          <Text style={styles.usersName}>{this.state.user_data.name}</Text>
          <Text style={styles.currentFridgeCount}>your fridge has {this.state.user_data.fridge.length} items</Text>
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
        <Swiper 
          showsButtons={false} 
          loop={false} 
          scrollsToTop={true}
          onIndexChanged={this.toggle} 
          dot={<View></View>} 
          activeDot={<View></View>} 
          >
          <View>
            <View>
              <View style={{flexDirection: 'row', marginVertical: 40}}>
                <View style={styles.fridgeCountCircle}>
                <Text style={{marginTop: 25, marginLeft: 17, fontSize: 35}}>{percentage}%</Text>
                </View>
                <Text style={{marginTop: 20, marginLeft: 30, fontSize: 15}}>{exclamation}{"\n"}{percentage}% of food in your fridge{"\n"} is eaten instead of wasted</Text>
              </View>
              <View style={{flexDirection: 'row', marginBottom: 40}}>
                <View style={styles.fridgeCountCircle}>
                  <Text style={{marginTop: 3, marginLeft: 27, fontSize: 75}}>{avg_items}</Text> 
                </View>
                <Text style={{marginTop: 40, marginLeft: 30, fontSize: 15}}>items on average in fridge</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.imageContainer}>
                  <Image style={styles.image} source={{uri: `/Users/susiealptekin/Desktop/homemade/homemade_beta/homemade_beta/api/api${this.state.most_wasted_image}`}}/>
                </View>
                <Text style={{marginTop: 40, marginLeft: 30, fontSize: 15}}>food group wasted the most often</Text>
              </View>
            </View>
          </View>
          <View>
            <View>
              <FlatList 
                data={this.state.user_data.saved_recipes}
                renderItem={({item}) => (
                  <SavedRecipe 
                    recipe_id={item.recipe_id}
                    recipe_name={item.recipe_name}
                    image={item.image}
                    dietaryPreferences={item.diets}
                    saved={true}
                    onPressNavigate={this.navigateRecipe}
                    saveRecipe={this.unsaveRecipe}
                  />)}
                />
            </View>
          </View>
        </Swiper>
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
