import * as React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList } from '../types'
import { Image, Text, View } from '../components/Themed';
import { recipeEntireType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import { FlatList, SectionList, TouchableWithoutFeedback } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-gesture-handler';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const sectionsArray = [{
  title: "mealType",
  data: [
    "dinner",
    "lunch",
    "breakfast",
    "dessert", 
    "side"
  ]},
  {
  title: "dietaryPreference",
  data: [
    "vegetarian",
    "vegan",
    "sustainable",
    "dairy-free",
    "gluten-free"
  ]}, 
  {
  title: "cuisine",
  data: [
    "italian",
    "mexican",
    "chinese",
    "korean",
    "indian",
    "mediterranean",
    "spanish",
    "french",
    "american"
  ]
}]

type ProfileNavigationProp = StackNavigationProp<ProfileParamList, 'CreateRecipeScreen'>;
type ProfileRouteProp = RouteProp<ProfileParamList, 'CreateRecipeScreen'>;

interface Props {
  navigation: ProfileNavigationProp,
  route: ProfileRouteProp
}

interface State {
    isLoading: boolean
    token: string
    user_id: string
    recipe: recipeEntireType
    saved: boolean
}

export default class IndividualRecipeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      token: '', 
      user_id: '', 
      recipe: {
        recipe_id: '',
        recipe_name: '',
        owner: '', 
        image: '',
        diets: [],
        cuisine: undefined,
        meal_type: undefined,
        instructions: '',
        description: '',
        ingredients: [{
          description: '',
          food: {
            food_name: '', 
            food_id: '', 
          },
          unlisted_food: ''
        }],
      },
      saved: false,
    };

    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.setRecipeName = this.setRecipeName.bind(this)
    this.selectMealType = this.selectMealType.bind(this)
    this.selectDiet = this.selectDiet.bind(this)
    this.selectCuisine = this.selectCuisine.bind(this)
    this.setIngredientAmount = this.setIngredientAmount.bind(this)
    this.setIngredientFood = this.setIngredientFood.bind(this)
  }

  async componentDidMount() {
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      let update_recipe = this.state.recipe
      update_recipe.owner = setUserID
      this.setState({
        token: setToken,
        user_id: setUserID,
        isLoading: false,
        recipe: update_recipe,
      })
    }
  }

  setRecipeName(text: string) {
    let updated_recipe = this.state.recipe
    updated_recipe.recipe_name = text
    this.setState({
      recipe: updated_recipe,
    })
  }

  selectMealType(meal_type: string) {
    let updated_recipe = this.state.recipe
    updated_recipe.meal_type = {meal_type_id: 0, meal_type: meal_type}
    this.setState({
      recipe: updated_recipe,
    })
  }

  selectDiet(diet: string) {
    let index = this.state.recipe.diets.findIndex((ele) => ele.diet === diet)
    if (index !== -1) {
      let updated_recipe = this.state.recipe
      updated_recipe.diets.splice(index, 1)
      this.setState({
        recipe: updated_recipe,
      })
    } else {
      let updated_recipe = this.state.recipe
      updated_recipe.diets = updated_recipe.diets.concat([{diet_id: 0, diet: diet}])
      this.setState({
        recipe: updated_recipe,
      })
    }
  }

  selectCuisine(cuisine: string) {
    let updated_recipe = this.state.recipe
    updated_recipe.cuisine = {cuisine_id: 0, cuisine: cuisine}
    this.setState({
      recipe: updated_recipe,
    })
  }

  setIngredientAmount(text: string, index: number) {
    let updated_recipe = this.state.recipe
    if (index >= updated_recipe.ingredients.length) {
      updated_recipe.ingredients = updated_recipe.ingredients.concat([{
        description: "",
        food: {food_id: "", food_name: ""},
        unlisted_food: "",
      }])
    }
    updated_recipe.ingredients[index].description = text + updated_recipe.ingredients[index].unlisted_food
    this.setState({
      recipe: updated_recipe,
    })
  }

  setIngredientFood(text: string, index: number) {
    let updated_recipe = this.state.recipe
    if (index >= updated_recipe.ingredients.length) {
      updated_recipe.ingredients = updated_recipe.ingredients.concat([{
        description: "",
        food: {food_id: "", food_name: ""},
        unlisted_food: text,
      }])
    }
    updated_recipe.ingredients[index].unlisted_food = text
    this.setState({
      recipe: updated_recipe,
    })
  }

  IsLoadingRender() {
    return (
      <View style={styling.container}>
        <ActivityIndicator />
      </View>
    )
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()

    let dietaryPrefs = ''
    this.state.recipe.diets.forEach((pref, index) => {
    dietaryPrefs = dietaryPrefs.concat(pref.diet)
    if (index !== this.state.recipe.diets.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    let instructions = this.state.recipe.instructions.split("\n").map((ele) => {return ele.trim()})

    return (
    <View style={styling.container}>
      <View style={styling.positioningBackArrow}>
        <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
          <Ionicons name="ios-arrow-back" color="black" style={StyleSheet.flatten([styling.largeIconSize, styling.noHeader])}/>
        </TouchableWithoutFeedback>
      </View>
      <View>
        <View style={styling.flexRow}>
            <TextInput
                style={[styling.fullRecipeName, styling.noHeader, {marginHorizontal: 20}]}
                placeholder="recipe name"
                autoCapitalize='none'
                onChangeText={text => this.setRecipeName(text)}
                defaultValue={''} />
          </View>
        </View>
        <View style={styling.flexRow}>
          <View style={{marginHorizontal: 10}}>
            <Text style={{fontSize: 18, marginVertical: 10}}>Meal Type</Text>
            <FlatList
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={{marginVertical: 10}}></View>)}
              data={sectionsArray[0].data} 
              renderItem={({item}) => {
                return (
                  <TouchableWithoutFeedback onPress={() => this.selectMealType(item)}>
                    <Text style={(this.state.recipe.meal_type?.meal_type === item) ? {color:'blue'} : {color:'black'}}>{item}</Text>
                  </TouchableWithoutFeedback>
                )}}
              keyExtractor={(item, index) => item} />
          </View>
          <View style={{marginHorizontal: 10}}>
            <Text style={{fontSize: 18, marginVertical: 10}}>Dietary {'\n'}Preferences</Text>
            <FlatList
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={{marginVertical: 10}}></View>)}
              data={sectionsArray[1].data} 
              renderItem={({item}) => {
                return (
                  <TouchableWithoutFeedback onPress={() => this.selectDiet(item)}>
                  <Text style={(this.state.recipe.diets.findIndex((ele) => ele.diet === item) !== -1) ? {color:'blue'} : {color:'black'}}>{item}</Text>
                </TouchableWithoutFeedback>
                )}}
              keyExtractor={(item, index) => item} />
          </View>
          <View style={{marginHorizontal: 10}}>
            <Text style={{fontSize: 18, marginVertical: 10}}>Cuisine</Text>
            <FlatList
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={{marginVertical: 10}}></View>)}
              data={sectionsArray[2].data} 
              renderItem={({item}) => {
                return (
                  <TouchableWithoutFeedback onPress={() => this.selectCuisine(item)}>
                  <Text style={(this.state.recipe.cuisine?.cuisine === item) ? {color:'blue'} : {color:'black'}}>{item}</Text>
                </TouchableWithoutFeedback>
                )}}
              keyExtractor={(item, index) => item} />
          </View>
        </View>
        <View>
          <Text style={{fontSize: 18, marginVertical: 10}}>Ingredients</Text>
          <View style={styling.flexRow}>
            <FlatList 
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={{marginVertical: 10}}></View>)}
              data={this.state.recipe.ingredients} 
              // ListHeaderComponent={(
              //   <View style={styling.flexRow}>
              //       <TextInput
              //       style={[styling.noHeader, {marginHorizontal: 20}]}
              //       placeholder="amount"
              //       autoCapitalize='none'
              //       onChangeText={text => this.setIngredientAmount(text, this.state.recipe.ingredients.length)}
              //       defaultValue={''} />
              //     <TextInput
              //       style={[styling.noHeader, {marginHorizontal: 20}]}
              //       placeholder="ingredient"
              //       autoCapitalize='none'
              //       onChangeText={text => this.setIngredientFood(text, this.state.recipe.ingredients.length)}
              //       defaultValue={''} />
              //   </View>
              // )}
              // ISSUE: RERENDERS EACH CHANGE TEXT -- cannot properly update
              renderItem={({item, index}) => {
                return (
                  <View>
                  <View style={styling.flexRow}>
                    <TextInput
                      style={[styling.noHeader, {marginHorizontal: 20}]}
                      placeholder="amount"
                      autoCapitalize='none'
                      onChangeText={text => this.setIngredientAmount(text, index)}
                      defaultValue={''} />
                    <TextInput
                      style={[styling.noHeader, {marginHorizontal: 20}]}
                      placeholder="ingredient"
                      autoCapitalize='none'
                      onChangeText={text => this.setIngredientFood(text, index)}
                      defaultValue={''} />
                    </View>
                    {((index === this.state.recipe.ingredients.length - 1) && (item.description != '')) ? (
                    <View style={styling.flexRow}>
                      <TextInput
                        style={[styling.noHeader, {marginHorizontal: 20}]}
                        placeholder="amount"
                        autoCapitalize='none'
                        onChangeText={text => this.setIngredientAmount(text, index)}
                        defaultValue={''} />
                      <TextInput
                        style={[styling.noHeader, {marginHorizontal: 20}]}
                        placeholder="ingredient"
                        autoCapitalize='none'
                        onChangeText={text => this.setIngredientFood(text, index)}
                        defaultValue={''} />
                    </View>) : 
                    (<View></View>)}
                    </View>
                )}}
              keyExtractor={(item, index) => item.description + index} />
              {/* <View style={styling.flexRow}>
                <TextInput
                  style={[styling.fullRecipeName, styling.noHeader, {marginHorizontal: 20}]}
                  placeholder="amount"
                  autoCapitalize='none'
                  onChangeText={text => this.setIngredientAmount(text, this.state.recipe.ingredients.length)}
                  defaultValue={''} />
                <TextInput
                  style={[styling.fullRecipeName, styling.noHeader, {marginHorizontal: 20}]}
                  placeholder="ingredient"
                  autoCapitalize='none'
                  onChangeText={text => this.setIngredientFood(text, this.state.recipe.ingredients.length)}
                  defaultValue={''} />
              </View> */}
          </View>
        </View> 
        <View>
          <Text style={{fontSize: 18, marginVertical: 10}}>Directions</Text>
        </View> 
        <SectionList
          style={styling.sectionBuffer}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          sections={[ 
            {recipe_name: "Ingredients", data: this.state.recipe.ingredients.map((ingredient) => ingredient.description)}, 
            {recipe_name: "Directions", data: instructions} ]}
          renderItem={({item}) => ( <Text style={styling.recipeDirections}>{item}</Text> )}
          renderSectionHeader={({section}) => ( 
            <Text style={styling.recipeDirectionsHeader}>{section.recipe_name}</Text> 
            )}
          renderSectionFooter={() => ( <View style={styling.recipeDirectionsFooter}></View> )}
          /> 
          {/* TODO: Upload image */}
      </View>
    );
  }
}