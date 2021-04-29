import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Image, Text, View } from '../components/Themed';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import SavedRecipe from '../components/SavedRecipe'
import { StackNavigationProp } from '@react-navigation/stack';
import Swiper from 'react-native-swiper'
import { userDataType } from '../objectTypes'
import { styling } from '../style';
import { width, height } from '../App'

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
  most_wasted_group: string
}

export default class HomeScreen extends React.Component<Props, State> {
  private swiperRef = React.createRef<Swiper>()
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
      most_wasted_group: ""
    }

    this.unsaveRecipe = this.unsaveRecipe.bind(this)
    this.navigateRecipe = this.navigateRecipe.bind(this)
    this.onPressSettings = this.onPressSettings.bind(this)
    this.toggle = this.toggle.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
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

    // determine most wasted food group
    let group = ""
    if (this.state.user_data.produce_wasted >= this.state.user_data.meat_wasted && this.state.user_data.produce_wasted >= this.state.user_data.dairy_wasted) {
      group = 'produce'
    } else if (this.state.user_data.meat_wasted >= this.state.user_data.dairy_wasted && this.state.user_data.meat_wasted > this.state.user_data.produce_wasted) {
      group = 'protein'
    } else {
      group = 'dairy'
    } 
    this.setState({
      isLoading: false,
      user_data: user_data,
      most_wasted_group: group
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
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
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
    let avg_items = this.CalculateAverageItems()

    return (
      <View style={{flex: 1}}>
        <View style={styling.paddingMargin}>
          <Text style={styling.username}>{this.state.user_data.name}</Text>
          <Text style={styling.metricsText}>Items in your fridge: {this.state.user_data.fridge.length}</Text>
          <Text style={styling.metricsText}>Ratio of food eaten instead of wasted: {percentage}%</Text>
          <Text style={styling.metricsText}>Average number of items in your fridge: {avg_items}</Text>
          <Text style={styling.metricsText}>Food group wasted most often: {this.state.most_wasted_group}</Text>
        </View>
        <View style={styling.flexPadding}>
          <View style={styling.halfWidth}>
            <TouchableWithoutFeedback onPress={() => {
              this.swiperRef.current?.scrollTo(0)
              this.toggle}}>
              <Text style={this.state.toggle ? styling.toggledText : styling.untoggledText}>Your Recipes</Text>
            </TouchableWithoutFeedback>
          </View>
          <View style={styling.halfWidth}>
            <TouchableWithoutFeedback onPress={() => {
              this.swiperRef.current?.scrollTo(1)
              this.toggle}}>
              <Text style={!this.state.toggle ? styling.toggledText : styling.untoggledText}>Saved Recipes</Text>
            </TouchableWithoutFeedback>
          </View>
        </View> 
        <View style={styling.flexPadding}>
          <View style={!this.state.toggle ? styling.untoggledSeparator : styling.toggledSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <View style={!this.state.toggle ? styling.toggledSeparator : styling.untoggledSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </View>
        <Swiper 
          showsButtons={false} 
          loop={false} 
          scrollsToTop={true}
          onIndexChanged={this.toggle}
          showsPagination={false}
          ref={this.swiperRef}
          style={styling.paddingHorizontal}
          >
          <View>
            <Text>Coming soon...</Text>
          </View>
          <View>
            <FlatList 
              data={this.state.user_data.saved_recipes}
              ItemSeparatorComponent={() => (<View style={styling.elementBuffer}></View>)}
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
        </Swiper>
      </View>
    )
  }
}

/*
TODO: fix issue with setState in onIndexChanged
*/