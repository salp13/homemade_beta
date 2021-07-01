import * as React from 'react';
import { ActivityIndicator, Button, StyleSheet, TextInput, ScrollView, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList } from '../types'
import { Image, Text, View } from '../components/Themed';
import { createRecipeType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import { FlatList } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { launchCamera, CameraOptions, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Formik, Form, FieldArray, Field, FormikProps } from 'formik'
import UploadImageModal from '../components/UploadImageModal'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'
import FormData from 'form-data'
import * as ImageManipulator from 'expo-image-manipulator';

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

// interface FormDataValue {
//   uri: string;
//   name: string;
//   type: string;
// }

// interface FormData {
//   append(name: string, value: string | Blob | FormDataValue, fileName?: string): void;
//   delete(name: string): void;
//   get(name: string): FormDataEntryValue | null;
//   getAll(name: string): FormDataEntryValue[];
//   has(name: string): boolean;
//   set(name: string, value: string | Blob | FormDataValue, fileName?: string): void;
// }

// declare let FormData: {
//   prototype: FormData;
//   new (form?: HTMLFormElement): FormData;
// };

// interface FormData {
//   entries(): IterableIterator<[string, string | File]>;
//   keys(): IterableIterator<string>;
//   values(): IterableIterator<string | File>;
//   [Symbol.iterator](): IterableIterator<string | File>;
// }

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
    modal: {
      visible: boolean
      take_photo: boolean
      upload_photo: boolean
    }
    recipe: createRecipeType
    saved: boolean
    temp_ingredients: Array<{
      amount: string 
      food: string
    }>
    temp_directions: Array<string>
    temp_image: FormData
    uri: string
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
      modal: {
        visible: false,
        take_photo: false,
        upload_photo: false
      },
      recipe: {
        recipe_name: '',
        owner: '',
        image: '', 
        diets: [],
        cuisine: undefined,
        meal_type: undefined,
        instructions: '',
        description: '',
        foods: [],
      },
      saved: false,
      temp_ingredients: [{
        amount: '',
        food: '',
      }],
      temp_directions: [''],
      temp_image: new FormData(),
      uri: ''
    };

    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.setRecipeName = this.setRecipeName.bind(this)
    this.selectMealType = this.selectMealType.bind(this)
    this.selectDiet = this.selectDiet.bind(this)
    this.selectCuisine = this.selectCuisine.bind(this)
    this.addIngredients = this.addIngredients.bind(this)
    this.addDirections = this.addDirections.bind(this)
    this.setDescription = this.setDescription.bind(this)
    this.launchingCamera = this.launchingCamera.bind(this)
    this.launchLibrary = this.launchLibrary.bind(this)
    this.uploadImageModalUpdate = this.uploadImageModalUpdate.bind(this)
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
    updated_recipe.meal_type = meal_type
    this.setState({
      recipe: updated_recipe,
    })
  }

  selectDiet(diet: string) {
    let index = this.state.recipe.diets.findIndex((ele) => ele === diet)
    if (index !== -1) {
      let updated_recipe = this.state.recipe
      updated_recipe.diets.splice(index, 1)
      this.setState({
        recipe: updated_recipe,
      })
    } else {
      let updated_recipe = this.state.recipe
      updated_recipe.diets = updated_recipe.diets.concat([diet])
      this.setState({
        recipe: updated_recipe,
      })
    }
  }

  selectCuisine(cuisine: string) {
    let updated_recipe = this.state.recipe
    updated_recipe.cuisine = cuisine
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
                this.setState({
                  temp_ingredients: values.ingredients
                })
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
                this.setState({
                  temp_directions: values.directions
                })
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

  setDescription(text: string) {
    let updated_recipe = this.state.recipe
    updated_recipe.description = text
    this.setState({
      recipe: updated_recipe,
    })
  }

  async launchingCamera() {
    const permissions = await Permissions.getAsync(Permissions.CAMERA)
    if (permissions.status != 'granted' && Platform.OS !== 'web') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return
      }
    } else if (permissions.status != 'granted') {
      alert('Sorry, this functionality is not compatible. Please try again on a mobile device!');
      return
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.cancelled != true) {
      let form = this.state.temp_image 
      form.append('file', {uri: result.uri})
      this.setState({ temp_image: form })
    }
    
  }

  async launchLibrary() {
    const permissions = await Permissions.getAsync(Permissions.CAMERA_ROLL)
    if (permissions.status != 'granted' && Platform.OS !== 'web') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return
      }
    } else if (permissions.status != 'granted') {
      alert('Sorry, this functionality is not compatible. Please try again on a mobile device!');
      return
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result)
    if (result.cancelled != true && result.uri) {
      this.setState({uri: result.uri})
      let form = this.state.temp_image 
      let obj: string | Blob
      obj = result.uri
      form.append('image', {uri: obj, name: "image", contentType: 'image/jpg'}, 'image.jpg')
      this.setState({ temp_image: form })
    }
  }

  uploadImageModalUpdate(take_photo: boolean = false, upload_photo: boolean = false) {
    this.setState({ 
      modal: {
        visible: !this.state.modal.visible,
        take_photo: take_photo,
        upload_photo: upload_photo
      }
    })
    if (take_photo) {
      this.launchingCamera()
    } else if (upload_photo) {
      this.launchLibrary()
    }
  }

  async submitRecipe() {
    await this.formikRef1.current?.submitForm()
    await this.formikRef2.current?.submitForm()

    let recipe = this.state.recipe

    let unformatted_ingredients = this.state.temp_ingredients
    let ingredients = unformatted_ingredients.map((ingredient) => ({
        description: ingredient.amount + " " + ingredient.food,
        food: ingredient.food,
      }))
    recipe.foods = ingredients

    let unformatted_directions = this.state.temp_directions
    let directions = ""
    unformatted_directions.forEach((direction, index) => {
      directions = `${directions}\n${index + 1}. ${direction}`
    })
    recipe.instructions = directions
    this.setState({ recipe })
    // post request to create a recipe
    let recipe_data = await fetch(`http://localhost:8000/homemade/many_recipes/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      'Authorization': 'Token ' + this.state.token,
      },
      body: JSON.stringify(this.state.recipe)
    }).then(response => response.json())
    .then(data => { return data })
      .catch(error => {
        console.error(error);
      });
      console.log(recipe_data)
    console.log(this.state.temp_image)
      await fetch(`http://localhost:8000/homemade/upload_recipe_image/${recipe_data.recipe_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Token ' + this.state.token,
        },
        body: this.state.temp_image
      })
        .catch(error => {
          console.error(error);
        });
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
                      <Text style={(this.state.recipe.meal_type === item) ? {color:'blue'} : {color:'black'}}>{item}</Text>
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
                    <Text style={(this.state.recipe.diets.findIndex((ele) => ele === item) !== -1) ? {color:'blue'} : {color:'black'}}>{item}</Text>
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
                  <Text style={(this.state.recipe.cuisine === item) ? {color:'blue'} : {color:'black'}}>{item}</Text>
                </TouchableWithoutFeedback>
                )}}
              keyExtractor={(item, index) => item} />
          </View>
        </View>
        {this.addIngredients()}
        {this.addDirections()}
        <Text style={{fontSize: 18, marginVertical: 10}}>Description</Text>
        <TextInput 
          value={this.state.recipe.description}
          placeholder="Description"
          style={[{marginHorizontal: 20, marginTop: 5, fontSize: 16}]}
          multiline
          onChangeText={(text) => this.setDescription(text)}
          defaultValue={''} />
        <Button title="Upload Image" onPress={() => this.uploadImageModalUpdate()}/>
        <UploadImageModal modalProperties={this.state.modal} ModalResultFunc={this.uploadImageModalUpdate} />
        <Button title="Submit" onPress={() => this.submitRecipe()}/>
        </ScrollView>
      </View>
    );
  }
}

/*
TODO:
  - page design
*/