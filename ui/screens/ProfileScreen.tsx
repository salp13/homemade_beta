import * as React from 'react';
import { ActivityIndicator, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Image, Text, View } from '../components/Themed';
import { ProfileParamList } from '../types'
import { RouteProp } from '@react-navigation/native';
import SavedRecipe from '../components/SavedRecipe'
import { StackNavigationProp } from '@react-navigation/stack';
import Swiper from 'react-native-swiper'
import { recipeType, userDataType } from '../objectTypes'
import { styling } from '../style';
import { width, height } from '../App'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileParamList, 'ProfileScreen'>;
type ProfileScreenRouteProp = RouteProp<ProfileParamList, 'ProfileScreen'>;

interface Props {
  navigation: ProfileScreenNavigationProp,
  route: ProfileScreenRouteProp
}

interface State {
  isLoading: boolean
  token: string
  user_id: string
  toggle: boolean
  user_data: userDataType
  most_wasted_group: string
  owned_recipes: Array<recipeType>
}

export default class HomeScreen extends React.Component<Props, State> {
  private swiperRef = React.createRef<Swiper>()
  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: true,
      token: '', 
      user_id: '', 
      toggle: true,
      user_data: {
        user_id: "",
        saved_recipes: [],
        username: "",
        name: "",
        origin_account_date: "",
        wasted_count: 0,
        eaten_count: 0,
        produce_wasted: 0,
        meat_wasted: 0,
        dairy_wasted: 0,
        total_items: 0,
        shopping_list: [],
        fridge: []
      },
      most_wasted_group: "",
      owned_recipes: []
    }

    this.unsaveRecipe = this.unsaveRecipe.bind(this)
    this.navigateRecipe = this.navigateRecipe.bind(this)
    this.onPressSettings = this.onPressSettings.bind(this)
    this.toggle = this.toggle.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.CalculateAverageItems = this.CalculateAverageItems.bind(this)
    this.MetricData = this.MetricData.bind(this)
  }


  async componentDidMount() {
    // set token and user_id
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID
      })
    }
    
    // hit api for user data
    const user_data = await fetch(`http://localhost:8000/homemade/metric_data/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
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
    let group = ''
    let comp_arr = [user_data.produce_wasted, user_data.meat_wasted, user_data.dairy_wasted]
    let i = comp_arr.indexOf(Math.max(...comp_arr));
    if ( i === 0) group = 'produce'
    else if (i === 1) group = 'protein'
    else group = 'dairy'

    const owned_recipes = await fetch(`http://localhost:8000/homemade/owned_recipe/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      return data
    })
    .catch(error => {
      console.error(error);
    });

    this.setState({
      isLoading: false,
      user_data: user_data,
      most_wasted_group: group,
      owned_recipes: owned_recipes,
    });
  }

  async unsaveRecipe(recipe_id: string) {
    if (this.state.user_data.saved_recipes.find(ele => (ele.recipe_id == recipe_id))) {
      // hit api to unsave saved recipe
      await fetch(`http://localhost:8000/homemade/single_saved_recipe/${this.state.user_id}/${recipe_id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
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
    } else {
        await fetch(`http://localhost:8000/homemade/single_saved_recipe/${this.state.user_id}/${recipe_id}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
          },
        })
          .catch(error => {
            console.error(error);
          });

          let new_saved_recipe = this.state.owned_recipes.filter((recipe) => recipe.recipe_id === recipe_id)
          let assign_user_data = this.state.user_data
          assign_user_data.saved_recipes = this.state.user_data.saved_recipes.concat(new_saved_recipe)

        this.setState({
          user_data: assign_user_data
        })
    }
    
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
    return Math.round((this.state.user_data.total_items / total_days))
  }

  MetricData() {
    // metrics calculations and formatting 
    let percentage = Math.round((this.state.user_data.eaten_count / this.state.user_data.total_items)*100)
    let avg_items = this.CalculateAverageItems()
    if (this.state.user_data.total_items === 0 && this.state.user_data.wasted_count === 0) {
      return (
        <View style={styling.paddingMargin}>
          <Text style={styling.username}>{this.state.user_data.name}</Text>
          <Text style={styling.metricsText}>Items in your fridge: {this.state.user_data.fridge.length}</Text>
          <Text style={styling.metricsText}>Average number of items in your fridge: {avg_items}</Text>
        </View>
      )
    } else if (this.state.user_data.wasted_count === 0) {
      return (
        <View style={styling.paddingMargin}>
          <Text style={styling.username}>{this.state.user_data.name}</Text>
          <Text style={styling.metricsText}>Items in your fridge: {this.state.user_data.fridge.length}</Text>
          <Text style={styling.metricsText}>Ratio of food eaten instead of wasted: {percentage}%</Text>
          <Text style={styling.metricsText}>Average number of items in your fridge: {avg_items}</Text>
        </View>
      )
    } else {
      return (
        <View>
          <Text style={styling.metricsText}>Items in your fridge: {this.state.user_data.fridge.length}</Text>
          <Text style={styling.metricsText}>Ratio of food eaten instead of wasted: {percentage}%</Text>
          <Text style={styling.metricsText}>Average number of items in your fridge: {avg_items}</Text>
          <Text style={styling.metricsText}>Food group wasted most often: {this.state.most_wasted_group}</Text>
        </View>
      )
    }
  }

  render() {
    if (this.state.isLoading) this.IsLoadingRender()

    return (
      <View style={{flex: 1}}>
        <View style={styling.paddingMargin}>
          <View style={styling.flexRow}>
            <Text style={styling.username}>{this.state.user_data.name}</Text>
            <View style={styling.autoLeft}>
            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('CreateRecipeScreen', {recipe_id: ''})}>
              <Entypo name="new-message" size={20} color="black" />
            </TouchableWithoutFeedback>
            </View>
          </View>
          {this.MetricData()}
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
          <FlatList 
              data={this.state.owned_recipes}
              ItemSeparatorComponent={() => (<View style={styling.elementBuffer}></View>)}
              renderItem={({item}) => (
                <SavedRecipe 
                  recipe_id={item.recipe_id}
                  recipe_name={item.recipe_name}
                  image={item.image}
                  dietaryPreferences={item.diets}
                  saved={(this.state.user_data.saved_recipes.find(ele => (ele.recipe_id == item.recipe_id))) ? true : false}
                  onPressNavigate={this.navigateRecipe}
                  saveRecipe={this.unsaveRecipe}
                />)}
              />
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