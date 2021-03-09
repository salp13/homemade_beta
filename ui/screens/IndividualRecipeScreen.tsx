import * as React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Fontisto, Ionicons } from '@expo/vector-icons';
// import Ionicons from 'react-native-vector-icons/Ionicons';

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { TouchableWithoutFeedback, SectionList } from 'react-native'

import { Text, View, Image } from '../components/Themed';
import dummyData from "../dummyData.json";
import { HomeParamList, SearchParamList, ProfileParamList } from '../types'

type HomeNavigationProp = StackNavigationProp<HomeParamList, 'IndividualRecipeScreen'>;
type HomeRouteProp = RouteProp<HomeParamList, 'IndividualRecipeScreen'>;
type SearchNavigationProp = StackNavigationProp<SearchParamList, 'IndividualRecipeScreen'>;
type SearchRouteProp = RouteProp<SearchParamList, 'IndividualRecipeScreen'>;
type ProfileNavigationProp = StackNavigationProp<ProfileParamList, 'IndividualRecipeScreen'>;
type ProfileRouteProp = RouteProp<ProfileParamList, 'IndividualRecipeScreen'>;

type ingredient = {
    description: string
    food: {
        food_id: string
        food_name: string
    }
    unlisted_food: string | undefined
}

type recipe = {
    recipe_id: string
    recipe_name: string
    image: string
    diets: Array<{
        diet_id: number
        diet: string
    }>
    cuisine: {
        cuisine_id: number
        cuisine: string
    } | undefined
    meal_type: {
        meal_type_id: number
        cuisine: string
    } | undefined
    instructions: string
    description: string
    ingredients: Array<ingredient>
}

interface Props {
  navigation: HomeNavigationProp | SearchNavigationProp | ProfileNavigationProp,
  route: HomeRouteProp | SearchRouteProp | ProfileRouteProp
}

interface State {
    isLoading: boolean
    recipe: recipe
    saved: boolean
}

export default class IndividualRecipeScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            recipe: {
                recipe_id: JSON.parse(JSON.stringify(this.props.route.params.recipe_id)),
                recipe_name: '',
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

        this.saveRecipe = this.saveRecipe.bind(this)
    }

    async componentDidMount() {
        let recipe_data = await fetch(`http://localhost:8000/homemade/single_recipe/${this.state.recipe.recipe_id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            })
            .then(response => response.json())
            .then(data => { return data })
            .catch(error => {
            console.error(error);
        });

        await fetch(`http://localhost:8000/homemade/many_saved_recipes/3beea29d-19a3-4a8b-a631-ce9e1ef876ea`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            })
            .then(response => response.json())
            .then(data => {
                const filtered_data = data.filter((recipe) => {recipe.recipe_id === this.state.recipe.recipe_id})
                this.setState({
                    isLoading: false,
                    recipe: recipe_data,
                    saved: filtered_data.length > 0,
                });
            })
            .catch(error => {
            console.error(error);
        });
    }

    async saveRecipe() {
        if (this.state.saved) {
            await fetch(`http://localhost:8000/homemade/single_saved_recipe/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${this.state.recipe.recipe_id}`, {
              method: 'DELETE',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
            .catch(error => {
            console.error(error);
            });
            this.setState({
              saved: false
            })
          } else {
            await fetch(`http://localhost:8000/homemade/single_saved_recipe/3beea29d-19a3-4a8b-a631-ce9e1ef876ea/${this.state.recipe.recipe_id}`, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
              .catch(error => {
                console.error(error);
              });
      
            this.setState({
              saved: true
            })
        }
    }

    render() {
      if (this.state.isLoading) {
        return (
          <View style={{ flex: 1, paddingTop: 20 }}>
            <ActivityIndicator />
          </View>
        );
      }
      let dietaryPrefs = ''
      this.state.recipe.diets.forEach((pref, index) => {
      dietaryPrefs = dietaryPrefs.concat(pref.diet)
      if (index !== this.state.recipe.diets.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
      })
      let instructions = this.state.recipe.instructions.split("\n")
      return (
      <View style={styles.container}>
          <View style={{position: 'absolute', marginTop: 50, marginLeft: 20, zIndex: 1, backgroundColor: 'transparant'}}>
              <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
                  <Ionicons name="ios-arrow-back" size={40} color="black" style={{marginTop: -5}}/>
              </TouchableWithoutFeedback>
          </View>
          
          <Image style={styles.image} source={{uri: `/Users/susiealptekin/Desktop/homemade/homemade_beta/homemade_beta/api/api${this.state.recipe.image}`}}/>
          <View style={{marginHorizontal: 20, flex: 1}}>
              <View style={{flexDirection: 'row', marginVertical: 10}}>
                  <Text style={{fontSize: 25, flex: 1, flexWrap: "wrap"}}>{this.state.recipe.recipe_name}</Text>
                  <View style={{marginLeft: 'auto', marginRight: 10, marginTop: 10}}>  
                      <TouchableWithoutFeedback onPress={this.saveRecipe}>
                          <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} size={24} color="black" />
                      </TouchableWithoutFeedback>
                  </View>
                  
              </View>
              <View style={{flexDirection: 'row'}}>
                  <Text style={{marginBottom: 4}}>{dietaryPrefs}</Text>
              </View>
              <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <SectionList
                  style={{flex:1, marginTop: 20}}
                  stickySectionHeadersEnabled={false}
                  sections={[ {recipe_name: "Ingredients", data: this.state.recipe.ingredients.map((ingredient) => ingredient.description)}, {recipe_name: "Directions", data: instructions} ]}
                  renderItem={({item}) => {
                  return (
                  <Text style={{marginVertical: 5, marginLeft: 10}}>{item}</Text>
                  )}}
                  renderSectionHeader={({section}) => ( <Text style={{fontWeight: 'bold', marginBottom: 10, fontSize: 15}}>{section.recipe_name}</Text> )}
                  renderSectionFooter={() => (<View style={{marginBottom: 20}}></View>)}
                  /> 
              
          </View>
          
      </View>
      );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1
  },
  image: {
    width: '100%',
    marginBottom: 5,
    height: undefined,
    aspectRatio: 5/4,
  },
  completeSeparator: {
    marginVertical: 10,
    height: 1,
  },
});