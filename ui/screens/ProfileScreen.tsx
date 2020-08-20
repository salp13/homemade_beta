import * as React from 'react';
import { StyleSheet, TouchableWithoutFeedback, SectionList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SimpleLineIcons } from '@expo/vector-icons';

import { Text, View } from '../components/Themed';
import { ProfileParamList } from '../types'
import dummyData from '../dummyData.json'

type ProfileScreenNavigationProp = StackNavigationProp<ProfileParamList, 'ProfileScreen'>;
type ProfileScreenRouteProp = RouteProp<ProfileParamList, 'ProfileScreen'>;

interface Props {
  navigation: ProfileScreenNavigationProp,
  route: ProfileScreenRouteProp
}

interface State {
  toggle: boolean
  metrics: any
  savedRecipes: Array<any>
  fridgeCount: number
  username: string
  name: string
}

export default class HomeScreen extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props)

    this.state = {
      toggle: true,
      metrics: {},
      savedRecipes: [],
      fridgeCount: 0,
      username: '',
      name: '',
    }
  }

  componentDidMount() {
    const userData = JSON.parse(JSON.stringify(dummyData.dummyUserData))
    this.setState({
      username: userData.username,
      name: userData.name,
      fridgeCount: userData.fridgeCount,
      savedRecipes: userData.savedRecipes,
      metrics: {
        percentage: userData.notWastedPercentage,
        foodGroupIndex: userData.foodGroupWastedImageIndex,
        averageFridgeCount: userData.averageFridgeCount,
      },
    })

    // get user data
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 25, fontWeight: 'bold'}}>{this.state.username}</Text>
          <View style={{marginLeft: 'auto'}}>
            <TouchableWithoutFeedback>
              <SimpleLineIcons name="settings" size={24} color="black" />
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <View>
          <Text>{this.state.name}</Text>
          <Text>your fridge has {this.state.fridgeCount} items</Text>
        </View>
        <View style={styles.completeSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <View style={{flexDirection: 'row'}}>
          <View style={styles.toggleHeader}>
            <Text style={this.state.toggle ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>Your Metrics</Text>
            <View style={this.state.toggle ? StyleSheet.flatten([styles.halfSeparator, {borderWidth: 3}]) : styles.halfSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          </View>
          <View style={styles.toggleHeader}>
            <Text style={!this.state.toggle ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>Saved Recipes</Text>
            <View style={!this.state.toggle ? StyleSheet.flatten([styles.halfSeparator, {borderWidth: 3}]) : styles.halfSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          </View>
        </View> 
        {this.state.toggle ? 
        (<View>
          <Text>
            {this.state.metrics.percentage}
            <Text>
              Great Job!{"\n"}94% of food in your fridge is eaten instead of wasted!
            </Text>
          </Text>
          <Text>{this.state.metrics.averageFridgeCount} items on average in your fridge</Text>
          <Text>{this.state.metrics.foodGroupIndex} food group wasted the most often</Text>
        </View>) : 
        (<View>
          {/* <SectionList
            scrollEnabled={!this.state.swipingAction}
            sections={[ {data: this.state.ingredients}, {data: this.state.fridgeItems} ]}
            renderItem={({item, index}) => {
              if (!item.viewable) return (<Text style={{marginTop: -20}}></Text>)
              return (
              <FridgeItem
                item={item} 
                index={index} 
                modalUpdateFunc={this.modalUpdate}
                swipeStart={this.OnSwipeNoScroll}
                swipeEnd={this.OnSwipeScroll}
                swipeLeftFunc={item.selected ? this.IngredientRemove : this.FridgeDismiss}
                swipeRightFunc={item.selected ? (index: number) => { return index } : this.FridgeToIngredient}
              />
            )}}
            renderSectionHeader={() => ( <View style={{marginTop: 10}}/> )}
            />  */}
        </View>)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  completeSeparator: {
    marginVertical: 30,
    height: 1,
  },
  halfSeparator: {
    marginVertical: 30,
    height: 1,
    width: "50%",
  },
  toggleHeader: {
    marginVertical: 30,
    height: 1,
    width: "50%",
  },
});


/*
  FE-TODO
    FUNCTIONALITY
      - metric visuals

  BE-TODO
    REQUESTS
      - GET: user data
*/