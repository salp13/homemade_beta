import * as React from 'react';
import { ActivityIndicator, Alert, Button, Keyboard, TextInput, ScrollView, Switch, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList, RootStackParamList } from '../types'
import { Text, View } from '../components/Themed';
import { createRecipeType } from '../objectTypes'
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { FlatList } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik, FieldArray, FormikProps } from 'formik'
import UploadImageModal from '../components/UploadImageModal'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import FormData from 'form-data'
import * as yup from 'yup'

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

type ProfileNavigationProp = CompositeNavigationProp<StackNavigationProp<ProfileParamList, 'CreateRecipeScreen'>, StackNavigationProp<RootStackParamList>>;
type ProfileRouteProp = RouteProp<ProfileParamList, 'CreateRecipeScreen'>;

interface Props {
  navigation: ProfileNavigationProp,
  route: ProfileRouteProp
}

interface State {
    isLoading: boolean
    errorText: string
    token: string
    user_id: string
    indicator: string
    private: boolean
    trigger: boolean
    no_alert: boolean
    invalid: boolean
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

export default class CreateRecipeScreen extends React.Component<Props, State> {
  private formikRef1 = React.createRef<FormikProps<any>>()
  private formikRef2 = React.createRef<FormikProps<any>>()
  private amount_props = {
    placeholder: "amount",
    placeholderTextColor: '#696969',
    style: styling.amount_props,
    defaultValue: '',
  }
  private food_props = {
    placeholder: "ingredient",
    placeholderTextColor: '#696969',
    style: [styling.amount_props, styling.marginHorizontal20],
    defaultValue: '',
  }
  private dir_props = {
    multiline: true,
    placeholder: "direction",
    placeholderTextColor: '#696969',
    style: styling.direction_props,
    defaultValue: '',
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      errorText: '',
      token: '', 
      user_id: '', 
      indicator: 'start',
      private: false,
      trigger: this.props.route.params.trigger,
      no_alert: false,
      invalid: false,
      modal: {
        visible: false,
        take_photo: false,
        upload_photo: false
      },
      recipe: {
        recipe_name: '',
        owner: '',
        private: false,
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
    this.errorMessage = this.errorMessage.bind(this)
    this.renderStart = this.renderStart.bind(this)
    this.renderMealTypes = this.renderMealTypes.bind(this)
    this.renderDietaryPrefs = this.renderDietaryPrefs.bind(this)
    this.renderCuisines = this.renderCuisines.bind(this)
    this.renderIngredients = this.renderIngredients.bind(this)
    this.renderDirections = this.renderDirections.bind(this)
    this.renderDescription = this.renderDescription.bind(this)
    this.submitSetState = this.submitSetState.bind(this)
    this.setRecipeName = this.setRecipeName.bind(this)
    this.selectMealType = this.selectMealType.bind(this)
    this.selectDiet = this.selectDiet.bind(this)
    this.selectCuisine = this.selectCuisine.bind(this)
    this.setDescription = this.setDescription.bind(this)
    this.launchingCamera = this.launchingCamera.bind(this)
    this.launchLibrary = this.launchLibrary.bind(this)
    this.uploadImageModalUpdate = this.uploadImageModalUpdate.bind(this)
    this.verifyRecipe = this.verifyRecipe.bind(this)
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
        recipe: update_recipe,
      })
    }
    let recipe_id = JSON.parse(JSON.stringify(this.props.route.params.recipe_id))
    if (recipe_id !== '' ) {
      let recipe_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_recipe/${recipe_id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
      })
        .then(response => response.json())
        .then(data => { return data })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });

      let recipe = this.state.recipe
      let temp_ingredients = this.state.temp_ingredients
      let temp_directions = this.state.temp_directions
      let temp_image = this.state.temp_image
      
      recipe.recipe_name = recipe_data.recipe_name 
      recipe.private = recipe_data.private
      recipe.image = recipe_data.image
      recipe.cuisine = recipe_data.cuisine.cuisine
      recipe.meal_type = recipe_data.meal_type.meal_type
      recipe.diets = recipe_data.diets.map((ele) => { return ele.diet })
      recipe.description = recipe_data.description
      temp_ingredients = recipe_data.ingredients.map((ele) => {
        let food_name = (ele.unlisted_food) ? ele.unlisted_food : ele.food.food_name
        let amount = ele.description.slice(0, ele.description.length - food_name.length)
        return {
          amount: amount,
          food: food_name
        }
      })
      temp_directions = recipe_data.instructions.split("\n").map((ele) => {return ele.trim()})
      let obj: string | Blob
      obj = recipe_data.image
      temp_image.append('image', {uri: obj, name: "image", contentType: 'image/jpg'}, 'image.jpg')

      this.setState({
        recipe: recipe,
        private: recipe_data.private,
        temp_directions: temp_directions,
        temp_ingredients: temp_ingredients,
        temp_image: temp_image,
        isLoading: false,
      })

    } else this.setState({ isLoading: false })

  }

  private goingBack = this.props.navigation.addListener('beforeRemove', async (e) => {
    if (this.state.no_alert) return
    await e.preventDefault();
    await this.setState({ no_alert: true })
    Alert.alert(
      'Discard changes?',
      'You may have unsaved changes. Are you sure to discard them and leave the screen?',
      [
        { text: "Don't leave", style: 'cancel', onPress: () => {} },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => this.props.navigation.dispatch(e.data.action),
        },
      ],
    )
    await this.setState({ no_alert: false })
  })

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
      let obj: string | Blob
      obj = result.uri
      form.append('image', {uri: obj, name: "image", contentType: 'image/jpg'}, 'image.jpg')
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
    Keyboard.dismiss() 

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

  async verifyRecipe() {
    let schema = yup.object().shape({
      recipe_name: yup.string().min(2).max(30).required(),
      owner: yup.string().uuid().required(),
      private: yup.boolean().required(),
      diets: yup.array().of(yup.string().required()),
      cuisine: yup.string().required(),
      meal_type: yup.string().required(),
      instructions: yup.string().min(2).required(),
      description: yup.string().min(2).max(150).required(),
      foods: yup.array().of(yup.object().shape({
        description: yup.string().required(),
        food: yup.string().required(),
      })),
    });

    let image_schema = yup.object().shape({
      image: yup.mixed().required('Image is required'),
    })

    
      
    return schema.isValid(this.state.recipe).then(valid => {
      if (valid) {
        let image = this.state.temp_image.getParts().find(item => item.fieldName === 'image')
        return image_schema.isValid({image}).then(valid => { return valid })
      }
      return valid
    })
  }

  async submitRecipe() {
    await this.setState({ no_alert: true, invalid: false, })
    
    let recipe = this.state.recipe
    let unformatted_ingredients = this.state.temp_ingredients
    let ingredients = unformatted_ingredients.map((ingredient) => ({
        description: ingredient.amount + " " + ingredient.food,
        food: ingredient.food,
      }))
    recipe.foods = ingredients
    let unformatted_directions = this.state.temp_directions
    let directions = ""
    let recipe_id_test = JSON.parse(JSON.stringify(this.props.route.params.recipe_id))
    unformatted_directions.forEach((direction, index) => {
      if (recipe_id_test === '') { directions = (index === 0) ? `${index + 1}. ${direction}` : `${directions}\n${index + 1}. ${direction}` }
      else { directions = (index === 0) ? `${direction}` : `${directions}\n${direction}` }
    })
    recipe.instructions = directions
    recipe.private = this.state.private

    let valid = await this.verifyRecipe()
    if (!valid) {
      this.setState({ no_alert: false, invalid: true })
      return
    }

    let temp_image = this.state.temp_image
    temp_image.append('recipe', JSON.stringify(recipe))

    await this.setState({ recipe: recipe, temp_image: temp_image })
    

    let recipe_id = JSON.parse(JSON.stringify(this.props.route.params.recipe_id))
    // post request to create a recipe
    if (recipe_id === '') {
      let recipe_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_recipes/${this.state.user_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Token ' + this.state.token,
        },
        body: this.state.temp_image
      }).then(response => response.json())
      .then(data => { return data })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
      recipe_id = recipe_data.recipe_id

      // add this new recipe to owned_recipes
      let arr = await AsyncStorage.getItem('@owned_recipes')
        .then((data) => { 
          if (data) { 
            let parsed_data = JSON.parse(data)
            parsed_data.push(recipe_data)
            return parsed_data
          }}
        )
      try {
        await AsyncStorage.setItem('@owned_recipes', JSON.stringify(arr))
      } catch (e) {
        console.error(e)
      }
    } else {
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_recipe/${recipe_id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Token ' + this.state.token,
        },
        body: this.state.temp_image
      })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
    }
    
    this.props.navigation.replace('Root')
  }

  async deleteRecipe() {
    if (JSON.parse(JSON.stringify(this.props.route.params.recipe_id)) === '') {
      this.props.navigation.goBack()
      return
    }

    const AsyncAlert = async () => new Promise((resolve) => {
      Alert.alert(
        'Delete',
        'Are you sure you want to delete this recipe?',
        [
          { text: "Cancel", style: 'cancel', onPress: () => {resolve('YES')} },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await this.setState({no_alert: true})
              resolve('YES')
            },
          },
        ],
      )
    });
    
    await AsyncAlert();
    
    if (!this.state.no_alert) return

    let recipe_id = JSON.parse(JSON.stringify(this.props.route.params.recipe_id))
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_recipe/${recipe_id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      }
    })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // delete this owned_recipes
    let arr = await AsyncStorage.getItem('@owned_recipes')
      .then((data) => { 
        if (data) { 
          let parsed_data = JSON.parse(data)
          let index = parsed_data.findIndex((ele) => { return ele === recipe_id })
          parsed_data.splice(index, 1)
          return parsed_data
        }}
      )
    try {
      AsyncStorage.setItem('@owned_recipes', JSON.stringify(arr))
    } catch (e) {
      console.error(e)
    }

    this.props.navigation.replace('Root')
  }

  async submitSetState(indicator: string, ingredient: boolean) {
    if (ingredient) await this.formikRef1.current?.submitForm()
    else await this.formikRef2.current?.submitForm()
    this.setState({ indicator: indicator })
  }

  IsLoadingRender() {
    return (
      <View style={[styling.container, styling.noHeader]}>
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

  renderStart() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <View style={{flex: 3, justifyContent: 'center'}}>
        {(this.state.no_alert) ? (<ActivityIndicator />) : (<View></View>)}
          <TextInput
              style={[styling.noHeader, styling.descriptionInput]}
              placeholder="recipe name"
              placeholderTextColor='#696969'
              autoCapitalize='none'
              editable={!this.state.no_alert}
              onChangeText={text => (!this.state.no_alert) ? this.setRecipeName(text) : {}}
              defaultValue={this.state.recipe.recipe_name} />
          <Text style={[styling.errorMessageText, styling.marginHorizontal20, {textAlign: 'left'}]}>
            {(this.state.invalid && (this.state.recipe.recipe_name.length > 30 || this.state.recipe.recipe_name.length < 2)) ? 
              "recipe name must be between 2 and 30 characters" : ""}</Text>
          <View style={styling.privateView}>
            <Text style={styling.privateText}>Private</Text>
            <Switch disabled={this.state.no_alert} style={styling.privateSwitch} value={this.state.private} onValueChange={() => {
              this.setState({ private: !this.state.private })
              Keyboard.dismiss()
              }} />
          </View>
          <TouchableWithoutFeedback disabled={this.state.no_alert} onPress={() => (!this.state.no_alert) ? this.uploadImageModalUpdate() : {}} >
            <Text style={styling.buttonTextSmall}>{this.state.temp_image.getParts().find(item => item.fieldName === 'image') ? `Upload Different Image` : `Upload Image`}</Text>
          </TouchableWithoutFeedback>
          <Text style={[styling.errorMessageText, styling.marginHorizontal20, {textAlign: 'left'}]}>
            {(this.state.invalid && !this.state.temp_image.getParts().find(item => item.fieldName === 'image')) ? 
              "must upload an image" : ""}</Text>
        </View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback disabled={this.state.no_alert} onPress={() => (!this.state.no_alert) ? this.deleteRecipe() : {}} >
              <Text style={styling.buttonTextLarge}>Delete</Text>
            </TouchableWithoutFeedback>
          <TouchableWithoutFeedback disabled={this.state.no_alert} onPress={() => (!this.state.no_alert) ? this.setState({ indicator: "meal_type" }) : {}}>
            <Ionicons name="ios-arrow-round-forward" color="black" style={styling.arrowForward}/>
          </TouchableWithoutFeedback>
        </View>
        <UploadImageModal modalProperties={this.state.modal} ModalResultFunc={this.uploadImageModalUpdate} />
      </View>)
  }

  renderMealTypes() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <View style={[styling.marginHorizontal20, {flex: 3, justifyContent: 'center'}]}>
          <Text style={styling.createRecipeHeader}>Meal Type</Text>
          <Text style={styling.createRecipeSubtext}>  (select one)</Text>
          <Text style={[styling.errorMessageText, {textAlign: 'left'}]}>
            {(this.state.invalid && !this.state.recipe.meal_type) ? 
              "must select one meal type" : ""}</Text>
          <View style={styling.activityMargin}></View>
          <View style={{justifyContent: 'center'}}>
            <FlatList
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={styling.separatorMargin}></View>)}
              data={sectionsArray[0].data} 
              renderItem={({item}) => {
                return (
                  <View style={styling.flexRow}>
                    <Text style={styling.mediumFont}>{item}</Text>
                    <TouchableWithoutFeedback onPress={() => this.selectMealType(item)}>
                      {(this.state.recipe.meal_type !== item) ? 
                      (<Ionicons name="ios-square-outline" style={styling.squarePicker}/>) :
                      (<Ionicons name="ios-square" style={styling.squarePicker}/>)}
                    </TouchableWithoutFeedback>
                  </View>
                )}}
              keyExtractor={(item, index) => item} />
              </View>
        </View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback onPress={() => this.setState({ indicator: "start" })}>
            <Ionicons name="ios-arrow-round-back" color="black" style={styling.arrowBackward}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.setState({ indicator: "diet_pref" })}>
            <Ionicons name="ios-arrow-round-forward" color="black" style={styling.arrowForward}/>
          </TouchableWithoutFeedback>
        </View>
      </View>)
  }

  renderDietaryPrefs() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <View style={[styling.marginHorizontal20, {flex: 3, justifyContent: 'center'}]}>
          <Text style={styling.createRecipeHeader}>Dietary Preferences</Text>
          <Text style={styling.createRecipeSubtext}>  (select multiple if applicable)</Text>
          <Text style={[styling.errorMessageText, {textAlign: 'left'}]}>
            {(this.state.invalid && this.state.recipe.diets.length === 0) ? 
              "must select at least one dietary preference" : ""}</Text>
          <View style={styling.activityMargin}></View>
          <View style={{justifyContent: 'center'}}>
            <FlatList
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={styling.separatorMargin}></View>)}
              data={sectionsArray[1].data} 
              renderItem={({item}) => {
                return (
                  <View style={styling.flexRow}>
                    <Text style={styling.mediumFont}>{item}</Text>
                    <TouchableWithoutFeedback onPress={() => this.selectDiet(item)}>
                      {(this.state.recipe.diets.findIndex((ele) => ele === item) === -1) ? 
                      (<Ionicons name="ios-square-outline" style={styling.squarePicker}/>) :
                      (<Ionicons name="ios-square" style={styling.squarePicker}/>)}
                    </TouchableWithoutFeedback>
                  </View>
                )}}
              keyExtractor={(item, index) => item} />
          </View>
        </View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback onPress={() => this.setState({ indicator: "meal_type" })}>
            <Ionicons name="ios-arrow-round-back" color="black" style={styling.arrowBackward}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.setState({ indicator: "cuisine" })}>
            <Ionicons name="ios-arrow-round-forward" color="black" style={styling.arrowForward}/>
          </TouchableWithoutFeedback>
        </View>
      </View>)
  }

  renderCuisines() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <View style={[styling.marginHorizontal20, {flex: 3, justifyContent: 'center'}]}>
          <Text style={styling.createRecipeHeader}>Cuisine</Text>
          <Text style={styling.createRecipeSubtext}>  (select one)</Text>
          <Text style={[styling.errorMessageText, {textAlign: 'left'}]}>
            {(this.state.invalid && !this.state.recipe.cuisine) ? 
              "must select one cuisine" : ""}</Text>
          <View style={styling.activityMargin}></View>
          <View style={{justifyContent: 'center'}}>
            <FlatList
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (<View style={styling.separatorMargin}></View>)}
              data={sectionsArray[2].data} 
              renderItem={({item}) => {
                return (
                  <View style={styling.flexRow}>
                    <Text style={styling.mediumFont}>{item}</Text>
                    <TouchableWithoutFeedback onPress={() => this.selectCuisine(item)}>
                      {(this.state.recipe.cuisine !== item) ? 
                      (<Ionicons name="ios-square-outline" style={styling.squarePicker}/>) :
                      (<Ionicons name="ios-square" style={styling.squarePicker}/>)}
                    </TouchableWithoutFeedback>
                  </View>
                )}}
              keyExtractor={(item, index) => item} />
          </View>
        </View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback onPress={() => this.setState({ indicator: "diet_pref" })}>
            <Ionicons name="ios-arrow-round-back" color="black" style={styling.arrowBackward}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.setState({ indicator: "ingredients" })}>
            <Ionicons name="ios-arrow-round-forward" color="black" style={styling.arrowForward}/>
          </TouchableWithoutFeedback>
        </View>
        <UploadImageModal modalProperties={this.state.modal} ModalResultFunc={this.uploadImageModalUpdate} />
      </View>)
  }

  renderIngredients() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 8}} contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <View style={[styling.marginHorizontal20]}>
          <Text style={styling.createRecipeHeader}>Ingredients</Text>
          <View style={styling.flexRow}>
            <Formik 
              enableReinitialize
              initialValues={{ingredients: this.state.temp_ingredients}}
              onSubmit={(values, actions) => { this.setState({ temp_ingredients: values.ingredients }) }}
              innerRef={this.formikRef1}
              render={({ values, handleChange, handleBlur }) => {
                return(
                <FieldArray 
                name="ingredients"
                render={arrayHelpers => { 
                  return (
                    <View style={styling.setFlex}>
                      {values.ingredients && values.ingredients.length > 0 ? (
                        values.ingredients.map((ingredient, index) => {
                          const key = `ingredients[${index}]`
                          const amount_key = `ingredients[${index}].amount`
                          const food_key = `ingredients[${index}].food`
                          return (
                            <View style={styling.elementBuffer}>
                                <View key={key} style={styling.flexRow}>
                                  <TextInput 
                                    data-name={amount_key} 
                                    key={amount_key} 
                                    value={values.ingredients[index].amount} 
                                    autoCapitalize='none'
                                    onChangeText={handleChange(amount_key)} 
                                    onBlur={handleBlur(amount_key)}
                                    {...this.amount_props}/>
                                  <TextInput 
                                    data-name={food_key} 
                                    key={food_key} 
                                    value={values.ingredients[index].food} 
                                    autoCapitalize='none'
                                    onChangeText={handleChange(food_key)} 
                                    onBlur={handleBlur(food_key)}
                                    {...this.food_props}/>
                                </View> 
                                <View style={styling.ingredientAdd}>
                                  {(index === values.ingredients.length - 1) ? (
                                    <TouchableWithoutFeedback onPress={() => arrayHelpers.push({amount: '', food: ''})}>
                                      <Ionicons name="ios-add" color="black" style={styling.largeIconSize}/>
                                    </TouchableWithoutFeedback>) :
                                    (
                                    <TouchableWithoutFeedback onPress={() => arrayHelpers.remove(index)}>
                                      <Ionicons name="ios-remove" color="black" style={styling.largeIconSize}/>
                                    </TouchableWithoutFeedback>)}
                                </View>
                                <Text style={[styling.errorMessageText, {textAlign:'left'} ]}>{(this.state.invalid && (this.state.temp_ingredients[0].amount === '' || this.state.temp_ingredients[0].food === '')) ? `must have at least 1 ingredient` : ""}</Text>
                            </View>
                        )})) : ( 
                      <View> 
                        <Button title="+" onPress={() => arrayHelpers.push({amount: '', food: ''})} /> 
                      </View> )}
            </View> )}} /> )}} />
          </View>
        </View>
        </ScrollView>
        <View style={{flex: 0.4}}></View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback onPress={() => this.submitSetState('cuisine', true)}>
            <Ionicons name="ios-arrow-round-back" color="black" style={styling.arrowBackward}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.submitSetState('directions', true)}>
            <Ionicons name="ios-arrow-round-forward" color="black" style={styling.arrowForward}/>
          </TouchableWithoutFeedback>
        </View>
      </View>)
  }

  renderDirections() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <ScrollView showsVerticalScrollIndicator={false} style={{flex: 8}} contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <View style={[styling.marginHorizontal20]}>
          <Text style={styling.createRecipeHeader}>Directions</Text>
          <View style={styling.flexRow}>
              <Formik 
                enableReinitialize
                initialValues={{directions: this.state.temp_directions}}
                onSubmit={(values, actions) => { this.setState({ temp_directions: values.directions }) }}
                innerRef={this.formikRef2}
                render={({ values, handleChange, handleBlur })=> (
                  <FieldArray 
                  name="directions"
                  render={arrayHelpers => (
                    <View style={styling.setFlex}>
                      {values.directions && values.directions.length > 0 ? (
                        values.directions.map((direction, index) =>  {
                          const key = `directions[${index}]`
                          const dir_key = `directions[${index}].directions`
                          return (
                          <View key={key} style={[styling.flexRow, styling.elementBuffer]}>
                            <Text style={styling.descriptionIndexFont}>{index+1}. </Text>
                            <View style={styling.marginRight50}>
                              <TextInput 
                                data-name={key} 
                                key={dir_key} 
                                value={values.directions[index]} 
                                autoCapitalize='none'
                                onChangeText={handleChange(key)} 
                                onBlur={handleBlur(key)}
                                {...this.dir_props} />
                              </View>
                              <View style={styling.ingredientAdd}>
                                {(index === values.directions.length - 1) ? (
                                  <TouchableWithoutFeedback onPress={() => arrayHelpers.push({amount: '', food: ''})}>
                                    <Ionicons name="ios-add" color="black" style={styling.largeIconSize}/>
                                  </TouchableWithoutFeedback>) :
                                  (
                                  <TouchableWithoutFeedback onPress={() => arrayHelpers.remove(index)}>
                                    <Ionicons name="ios-remove" color="black" style={styling.largeIconSize}/>
                                  </TouchableWithoutFeedback>)}
                              </View>
                            </View> )})) : (
                        <View> 
                          <Button title="+" color='black' onPress={() => arrayHelpers.push('')} /> 
                        </View> )} 
                  <Text style={[styling.errorMessageText, styling.marginHorizontal20, {textAlign:'left'} ]}>{(this.state.invalid && this.state.temp_directions[0] === '') ? `must have at least 1 direction` : ""}</Text>
                </View> )} /> )} /> 
            </View>
        </View>
        </ScrollView>
        <View style={{flex: 0.4}}></View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback onPress={() => this.submitSetState('ingredients', false)}>
            <Ionicons name="ios-arrow-round-back" color="black" style={styling.arrowBackward}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.submitSetState('description', false)}>
            <Ionicons name="ios-arrow-round-forward" color="black" style={styling.arrowForward}/>
          </TouchableWithoutFeedback>
        </View>
      </View>)
  }

  renderDescription() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <View style={[styling.marginHorizontal20, {flex: 3, justifyContent: 'center'}]}>
          {(this.state.no_alert) ? (<ActivityIndicator />) : (<View></View>)}
          <Text style={styling.createRecipeHeader}>Description</Text>
          <Text style={[styling.errorMessageText, {textAlign: 'left'}]}>
            {(this.state.invalid && !this.state.recipe.meal_type) ? 
              "description must be between 2 and 150 characters" : ""}</Text>
          <View style={styling.activityMargin}></View>
          <TextInput 
            editable={!this.state.no_alert}
            blurOnSubmit={true}
            value={this.state.recipe.description}
            placeholder="Please add a short description"
            placeholderTextColor='#696969'
            style={styling.descriptionTextInput}
            multiline
            onChangeText={(text) => (!this.state.no_alert && this.state.recipe.description.length < 150) ? this.setDescription(text) : {}}
            defaultValue={''} />
          <Text style={[styling.errorMessageText, {color: 'black', textAlign: 'right'}]}>{`${150 - this.state.recipe.description.length} char left`}</Text>
        </View>
        <View style={styling.flexRow}>
          <TouchableWithoutFeedback disabled={this.state.no_alert} onPress={() => {(!this.state.no_alert) ? this.setState({ indicator: "directions" }) : {}}}>
            <Ionicons name="ios-arrow-round-back" color="black" style={styling.arrowBackward}/>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback disabled={this.state.no_alert} onPress={() => (!this.state.no_alert) ? this.submitRecipe() : {}}>
            <Text style={styling.buttonTextLargeRight}>Submit</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>)
  }

  render() {
    if (this.state.isLoading) return this.IsLoadingRender()
    else if (this.state.errorText !== '') return this.errorMessage()
    else if (this.state.indicator === "start") return this.renderStart()
    else if (this.state.indicator === "meal_type") return this.renderMealTypes()
    else if (this.state.indicator === "diet_pref") return this.renderDietaryPrefs()
    else if (this.state.indicator === "cuisine") return this.renderCuisines()
    else if (this.state.indicator === "ingredients") return this.renderIngredients()
    else if (this.state.indicator === "directions") return this.renderDirections()
    else if (this.state.indicator === "description") return this.renderDescription()
  }
}
