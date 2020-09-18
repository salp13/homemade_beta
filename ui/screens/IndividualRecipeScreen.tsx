import * as React from 'react';
import { StyleSheet } from 'react-native';
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

interface Props {
  navigation: HomeNavigationProp | SearchNavigationProp | ProfileNavigationProp,
  route: HomeRouteProp | SearchRouteProp | ProfileRouteProp
}

interface State {
    recipeId: string
    title: string
    imageIndex: number
    dietaryPreferences: Array<string>
    servingSize: number
    saved: boolean 
    ingredients: Array<string>
    directions: string
}

const images = [
    require("../components/CurryGroundTurkey.jpg"),
    require("../components/GroundTurkeyEmpanada.jpg"),
    require("../components/GroundTurkeyPasta.jpeg"),
    require("../components/GroundTurkeyPastaDinner.jpg"),
    require("../components/GroundTurkeySloppyJoes.jpg"),
    require("../components/GroundTurkeyStroganoff.jpg"),
    require("../components/GroundTurkeyTacoZoodles.jpg")
  ]

export default class IndividualRecipeScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const recipeId = JSON.parse(JSON.stringify(this.props.route.params.recipeId))
        this.state = {
            recipeId: recipeId,
            title: '',
            imageIndex: 0,
            dietaryPreferences: [],
            servingSize: 0,
            saved: false,
            ingredients: [],
            directions: ''
        };

        this.saveRecipe = this.saveRecipe.bind(this)
    }

    componentDidMount() {
        const recipeData = JSON.parse(JSON.stringify(dummyData.dummyRecipes[0]))
        this.setState({
            title: recipeData.title,
            imageIndex: recipeData.imageIndex,
            dietaryPreferences: recipeData.dietaryPreferences,
            servingSize: recipeData.servingSize,
            saved: recipeData.saved,
            ingredients: recipeData.ingredients,
            directions: recipeData.directions,
        })
    }

    saveRecipe() {
        console.log(this.state.recipeId)
    }

    render() {
        let dietaryPrefs = ''
        this.state.dietaryPreferences.forEach((pref, index) => {
        dietaryPrefs = dietaryPrefs.concat(pref)
        if (index !== this.state.dietaryPreferences.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
        })
        let directions = this.state.directions.split("\n")
        return (
        <View style={styles.container}>
            <View style={{position: 'absolute', marginTop: 50, marginLeft: 20, zIndex: 1, backgroundColor: 'transparant'}}>
                <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
                    <Ionicons name="ios-arrow-back" size={40} color="black" style={{marginTop: -5}}/>
                </TouchableWithoutFeedback>
            </View>
            
            <Image style={styles.image} source={images[this.state.imageIndex]}/>
            <View style={{marginHorizontal: 20, flex: 1}}>
                <View style={{flexDirection: 'row', marginVertical: 10}}>
                    <Text style={{fontSize: 25}}>{this.state.title}</Text>
                    <View style={{marginLeft: 'auto'}}>  
                        <TouchableWithoutFeedback onPress={this.saveRecipe}>
                            <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} size={24} color="black" />
                        </TouchableWithoutFeedback>
                    </View>
                    
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{marginBottom: 4}}>{dietaryPrefs}</Text>
                    <Text style={{marginLeft: 'auto'}}>Serving Size: {this.state.servingSize}</Text>
                </View>
                <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                <SectionList
                    style={{flex:1, marginTop: 20}}
                    stickySectionHeadersEnabled={false}
                    sections={[ {title: "Ingredients", data: this.state.ingredients}, {title: "Directions", data: directions} ]}
                    renderItem={({item}) => {
                    return (
                    <Text style={{marginVertical: 5, marginLeft: 10}}>{item}</Text>
                    )}}
                    renderSectionHeader={({section}) => ( <Text style={{fontWeight: 'bold', marginBottom: 10, fontSize: 15}}>{section.title}</Text> )}
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