import * as React from 'react';
import { ActivityIndicator, Button, StyleSheet, TextInput, ScrollView, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList } from '../types'
import { Image, Text, View } from '../components/Themed';
import { ingredientType, recipeEntireType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import { FlatList, SectionList, TouchableWithoutFeedback } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { Formik, Form, FieldArray, Field, FormikProps } from 'formik'

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
    temp_ingredients: Array<{
      amount: string 
      food: string
    }>
    temp_directions: Array<string>
}

export default class IndividualRecipeScreen extends React.Component<Props, State> {
  private formikRef1 = React.createRef<FormikProps<any>>()
  private formikRef2 = React.createRef<FormikProps<any>>()

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
        ingredients: [],
      },
      saved: false,
      temp_ingredients: [{
        amount: '',
        food: '',
      }],
      temp_directions: ['']
    };

    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.setRecipeName = this.setRecipeName.bind(this)
    this.selectMealType = this.selectMealType.bind(this)
    this.selectDiet = this.selectDiet.bind(this)
    this.selectCuisine = this.selectCuisine.bind(this)
    this.addIngredients = this.addIngredients.bind(this)
    this.addDirections = this.addDirections.bind(this)
    this.submitRecipe = this.submitRecipe.bind(this)
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

  addIngredients() {
    return (
      <View>
          <Text style={{fontSize: 18, marginVertical: 10}}>Ingredients</Text>
          <View style={styling.flexRow}>
            <Formik 
              initialValues={{ingredients: this.state.temp_ingredients}}
              onSubmit={(values, actions) => {
                console.log("HANDLING SUBMIT")
                console.log({values})
                this.setState({
                  temp_ingredients: values.ingredients
                })
                actions.setSubmitting(false)
                return values.ingredients
              }}
              innerRef={this.formikRef1}
              render={({ values, handleChange, handleBlur })=> (
                <FieldArray 
                name="ingredients"
                render={arrayHelpers => (
                  <View>
                    {values.ingredients && values.ingredients.length > 0 ? (
                      values.ingredients.map((ingredient, index) => (
                        <View key={`ingredients[${index}]`} style={styling.flexRow}>
                          <TextInput 
                            data-name={`ingredients[${index}].amount`}
                            key={`ingredients[${index}].amount`} 
                            value={values.ingredients[index].amount}
                            placeholder="amount"
                            style={[{marginHorizontal: 20, marginTop: 5}]}
                            autoCapitalize='none'
                            onChangeText={handleChange(`ingredients[${index}].amount`)}
                            onBlur={handleBlur(`ingredients[${index}].amount`)}
                            defaultValue={''} />
                          <TextInput 
                            data-name={`ingredients[${index}].food`} 
                            key={`ingredients[${index}].food`} 
                            value={values.ingredients[index].food}
                            placeholder="ingredient"
                            style={[{marginHorizontal: 20, marginTop: 5}]}
                            autoCapitalize='none'
                            onChangeText={handleChange(`ingredients[${index}].food`)}
                            onBlur={handleBlur(`ingredients[${index}].food`)}
                            defaultValue={''} />
                            {(index === values.ingredients.length - 1) ? (
                              <Button title="+" color='black' onPress={() => arrayHelpers.push({amount: '', food: ''})} />
                            ) : (
                              <Button title="-" color='black' onPress={() => arrayHelpers.remove(index)} /> 
                            )}
                            
                          </View>
                      ))) : (
                      <View>
                        <Button title="+" color='black' onPress={() => arrayHelpers.push({amount: '', food: ''})} />
                      </View>
                    )}

                  </View>
                )}
                />
              )}
              />
            </View>
        </View>
    )
  }

  addDirections() {
    return (
      <View>
          <Text style={{fontSize: 18, marginVertical: 10}}>Directions</Text>
          <View style={styling.flexRow}>
            <Formik 
              initialValues={{directions: this.state.temp_directions}}
              onSubmit={(values, actions) => {
                console.log("HANDLING SUBMIT")
                console.log({values})
                this.setState({
                  temp_directions: values.directions
                })
                actions.setSubmitting(false)
                return values.directions
              }}
              innerRef={this.formikRef2}
              render={({ values, handleChange, handleBlur, setSubmitting })=> (
                <FieldArray 
                name="directions"
                render={arrayHelpers => (
                  <View>
                    {values.directions && values.directions.length > 0 ? (
                      values.directions.map((direction, index) => (
                        <View key={`directions[${index}]`} style={styling.flexRow}>
                          <Text style={{marginTop: 12, marginLeft: 5}}>{index+1}. </Text>
                          <TextInput 
                            data-name={`directions[${index}]`} 
                            key={`directions[${index}].directions`} 
                            value={values.directions[index]}
                            placeholder="direction"
                            style={[{marginHorizontal: 20, marginTop: 5}]}
                            autoCapitalize='none'
                            onChangeText={handleChange(`directions[${index}]`)}
                            onBlur={handleBlur(`directions[${index}]`)}
                            defaultValue={''} />
                            {(index === values.directions.length - 1) ? (
                              <Button title="+" color='black' onPress={() => arrayHelpers.push('')} /> 
                            ) : (
                              <Button title="-" color='black' onPress={() => arrayHelpers.remove(index)} /> 
                            )}
                            
                          </View>
                      ))) : (
                      <View>
                        <Button title="+" color='black' onPress={() => arrayHelpers.push('')} />
                      </View>
                    )}

                  </View>
                )}
                />
              )}
              />
            </View>
        </View>
    )
  }

  async submitRecipe() {
    await this.formikRef1.current?.submitForm()
    await this.formikRef2.current?.submitForm()

    let recipe = this.state.recipe
    // format this.state.recipes.ingredients
    let unformatted_ingredients = this.state.temp_ingredients
    let ingredients = unformatted_ingredients.map((ingredient) => ({
        description: ingredient.amount + " " + ingredient.food,
        food: {
          food_id: '', 
          food_name: ingredient.food,
        }, 
        unlisted_food: ''
      }))
    recipe.ingredients = ingredients
    // format this.state.recipes.directions
    let unformatted_directions = this.state.temp_directions
    let directions = ""
    unformatted_directions.forEach((direction, index) => {
      directions = `${directions}\n${index + 1}. ${direction}`
    })
    recipe.instructions = directions
    this.setState({ recipe })
    console.log({recipe})
    // post request to create a recipe
    // await this.submitRecipe()
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

    return (
    <View style={styling.container}>
      <ScrollView>
        <View style={styling.positioningBackArrow}>
          <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
            <Ionicons name="ios-arrow-back" color="black" style={StyleSheet.flatten([{marginLeft: -10}, styling.largeIconSize, styling.noHeader])}/>
          </TouchableWithoutFeedback>
        </View>
        <View>
          <View style={styling.flexRow}>
              <TextInput
                  style={[styling.fullRecipeName, styling.noHeader, {marginHorizontal: 40, marginBottom: 20}]}
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
        {this.addIngredients()}
        {this.addDirections()}
        {/* TODO: Upload image */}
        <Button title="Submit" onPress={() => this.submitRecipe()}/>
        </ScrollView>
      </View>
    );
  }
}

/*
TODO:
  - upload image
  - format ingredients
  - format directions
  - post request to create recipe
*/