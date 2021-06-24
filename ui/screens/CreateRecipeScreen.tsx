import * as React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileParamList } from '../types'
import { Image, Text, View } from '../components/Themed';
import { recipeEntireType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import { SectionList, TouchableWithoutFeedback } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-gesture-handler';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';



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
        ingredients: [],
      },
      saved: false,
    };

    this.IsLoadingRender = this.IsLoadingRender.bind(this)
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
      <View style={styling.container}>
        <View style={styling.flexRow}>
            <TextInput
                style={[styling.fullRecipeName, styling.noHeader, {marginHorizontal: 20}]}
                placeholder="recipe name"
                autoCapitalize='none'
                onChangeText={text => this.setRecipeName(text)}
                defaultValue={''} />
          </View>
        </View>
        {/* TODO: Upload image */}
        <View style={styling.flexRow}>
            <Text>{dietaryPrefs}</Text>
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
          
      </View>
    );
  }
}