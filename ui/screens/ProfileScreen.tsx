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
  errorText: string
  token: string
  user_id: string
  toggle: boolean
  update_trigger: boolean
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
      errorText: '',
      token: '', 
      user_id: '', 
      toggle: true,
      update_trigger: false,
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
    this.errorMessage = this.errorMessage.bind(this)
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

    // AsyncStorage for metric data, saved recipes, owned recipes
    await AsyncStorage.getItem('@owned_recipes')
    .then(data =>{ if (data) this.setState({ owned_recipes: JSON.parse(data) }) })

    await AsyncStorage.getItem('@metric_data')
    .then(data => {
      if (data) {
        let user_data = JSON.parse(data)
        let group = ''
        let comp_arr = [user_data.produce_wasted, user_data.meat_wasted, user_data.dairy_wasted]
        let i = comp_arr.indexOf(Math.max(...comp_arr));
        if ( i === 0) group = 'produce'
        else if (i === 1) group = 'protein'
        else group = 'dairy'
        
        AsyncStorage.getItem('@saved_recipes').then(saved_recipes => {
          if (saved_recipes) {
            user_data.saved_recipes = JSON.parse(saved_recipes)
            this.setState({
              user_data: user_data,
              most_wasted_group: group,
              isLoading: false,
            })
          }
        })
    }})


    // hit api for user data
    const user_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/metric_data/${this.state.user_id}`, {
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
      this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
    });

    // determine most wasted food group
    let group = ''
    let comp_arr = [user_data.produce_wasted, user_data.meat_wasted, user_data.dairy_wasted]
    let i = comp_arr.indexOf(Math.max(...comp_arr));
    if ( i === 0) group = 'produce'
    else if (i === 1) group = 'protein'
    else group = 'dairy'

    const owned_recipes = await fetch(`https://homemadeapp.azurewebsites.net/homemade/owned_recipe/${this.state.user_id}`, {
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
      this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
    });

    this.setState({
      isLoading: false,
      user_data: user_data,
      most_wasted_group: group,
      owned_recipes: owned_recipes,
    });

    // set owned_recipes and merge metric_data for any changes
    try {
      AsyncStorage.setItem('@owned_recipes', JSON.stringify(owned_recipes))
      AsyncStorage.setItem('@metric_data', JSON.stringify(user_data))
    } catch (e) {
      console.error(e)
    }
  }

  async componentDidUpdate() {
    if (this.state.update_trigger !== this.props.route.params.trigger) {
      this.setState({isLoading: true, update_trigger: this.props.route.params.trigger})

      const owned_recipes = await fetch(`https://homemadeapp.azurewebsites.net/homemade/owned_recipe/${this.state.user_id}`, {
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
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });
      this.setState({ owned_recipes: owned_recipes, isLoading: false })
    }
  }

  async unsaveRecipe(recipe_id: string) {
    if (this.state.user_data.saved_recipes.find(ele => (ele.recipe_id == recipe_id))) {
      
      // hit api to unsave saved recipe
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_saved_recipe/${this.state.user_id}/${recipe_id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

      let assign_saved_recipes = this.state.user_data.saved_recipes.filter((recipe) => recipe.recipe_id !== recipe_id)
      let assign_user_data = this.state.user_data
      assign_user_data.saved_recipes = assign_saved_recipes
      this.setState({
        user_data: assign_user_data,
      });
      
      
    } else {
        await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_saved_recipe/${this.state.user_id}/${recipe_id}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
          },
        }).then(response => response.json())
        .then(data => { 
          try {
            AsyncStorage.getItem('@saved_recipes').then(recipes => {
              if (recipes) AsyncStorage.setItem('@saved_recipes', JSON.stringify(JSON.parse(recipes).concat([data])))
            })
          } catch (e) { console.error(e) }
         })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });

      let new_saved_recipe = this.state.owned_recipes.filter((recipe) => recipe.recipe_id === recipe_id)
      let assign_user_data = this.state.user_data
      assign_user_data.saved_recipes = this.state.user_data.saved_recipes.concat(new_saved_recipe)

      this.setState({
        user_data: assign_user_data
      })

      try {
        AsyncStorage.setItem('@metric_data', JSON.stringify(assign_user_data))
      } catch (e) {
        console.error(e)
      }
    }
  }

  navigateRecipe(recipe_id: string) {
    // navigate to individual recipe screen
    this.props.navigation.navigate('IndividualRecipeScreen', {recipe_id: recipe_id, trigger: this.state.update_trigger})
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

  errorMessage() {
    return (
        <View style={[styling.container, styling.noHeader]}>
        <Text>{this.state.errorText}</Text>
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
          <Text style={styling.metricsText}>Items in your fridge: {this.state.user_data.fridge.length}</Text>
          <Text style={styling.metricsText}>Average number of items in your fridge: {avg_items}</Text>
        </View>
      )
    } else if (this.state.user_data.wasted_count === 0) {
      return (
        <View style={styling.paddingMargin}>
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
    if (this.state.isLoading) return this.IsLoadingRender()
    if (this.state.errorText !== '') return this.errorMessage()

    return (
      <View style={styling.setFlex}>
        <View style={styling.paddingMargin}>
          <View style={styling.flexRow}>
            <Text style={styling.username}>{this.state.user_data.name}</Text>
            <View style={styling.autoLeft}>
            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('CreateRecipeScreen', {recipe_id: '', trigger: this.state.update_trigger})}>
              <Entypo name="new-message" style={styling.fontSize20} color="black" />
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
              renderItem={({item, index}) => (
                <SavedRecipe 
                  recipe_id={item.recipe_id}
                  recipe_name={item.recipe_name}
                  image={item.image}
                  dietaryPreferences={item.diets}
                  saved={(this.state.user_data.saved_recipes.find(ele => (ele.recipe_id == item.recipe_id))) ? true : false}
                  onPressNavigate={this.navigateRecipe}
                  saveRecipe={this.unsaveRecipe}
                />)}
              keyExtractor={(item, index) => item.recipe_id}
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
                />)
              }
              />
          </View>
        </Swiper>
      </View>
    )
  }
}