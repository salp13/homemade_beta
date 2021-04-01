import React from 'react';
import { fridgeItemType } from '../objectTypes'
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable';
import { Text, View, Image } from './Themed';
import { styling } from '../style'

interface Props {
  id: number | string
  selected: boolean
  item: fridgeItemType
  modalUpdateFunc: Function
  swipeLeftFunc: Function
  swipeRightFunc: Function
  swipeStart: Function
  swipeEnd: Function
}

interface State {
  id: number | string
  image: string | undefined
  food_name: string
  unlisted_food: string | undefined
  expiration_date: Date | undefined
  selected: boolean
}

export default class FridgeItem extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props)
    this.state = {
      id: this.props.id,
      image: this.props.item.food.food_group.image,
      food_name: this.props.item.food.food_name,
      unlisted_food: this.props.item.unlisted_food,
      expiration_date: this.props.item.expiration_date,
      selected: this.props.selected,
    }

    this.updateModalVisible = this.updateModalVisible.bind(this)
    this.swipeLeft = this.swipeLeft.bind(this)
    this.swipeRight = this.swipeRight.bind(this)
    this.determineSecondaryText = this.determineSecondaryText.bind(this)
  }

  componentDidUpdate() {
    // if the new food name is different from stored state food name or if the expiration date has changed, update state
    // food name change comes from removing or adding items
    if (this.props.item.food.food_name !== this.state.food_name || this.props.item.expiration_date !== this.state.expiration_date) {
      this.setState({
        id: this.props.id,
        image: this.props.item.food.food_group.image,
        food_name: this.props.item.food.food_name,
        unlisted_food: this.props.item.unlisted_food,
        expiration_date: this.props.item.expiration_date,
        selected: this.props.selected,
      })
    }
  }

  updateModalVisible = () => {
    // send updated modal visibility info to screen
    this.props.modalUpdateFunc(this.state.id, this.state.selected)
  }

  swipeLeft = () => {
    console.log("swipeLeftCompleted")
    // triggered when user swipes left on food item
    setTimeout(() => {this.props.swipeLeftFunc(this.state.id)}, 200)
  }

  swipeRight = () => {
      // triggered when user swipes right on food item
      console.log("swipeRightCompleted")
    setTimeout(() => {this.props.swipeRightFunc(this.state.id)}, 200)
  }

  determineSecondaryText() {
    // formatting for expiration date and sub text surrounding expiration date
    let secondaryText = ''
    if (this.state.expiration_date) {
      let currentDate = new Date()
      let placehold = new Date(this.state.expiration_date)
      let daysToExp = Math.ceil((placehold.valueOf() - currentDate.valueOf())/(24 * 60 * 60 * 1000))
      if (daysToExp === 1) secondaryText = 'this expires today'
      else if (daysToExp < 1) secondaryText = 'expired'
      else secondaryText = `this expires in ${daysToExp} days`
    }
    return secondaryText
  }

  render() {
    let loadimage = this.state.image ? `/Users/susiealptekin/Desktop/homemade/homemade_beta/homemade_beta/api/api${this.state.image}` : `corn.png`

    return (
      <Swipeable
        leftActionActivationDistance={70}
        rightActionActivationDistance={70}
        rightContent={this.state.selected ? (<Text></Text>) : 
          (<View style={styling.rightSwipeItem}></View>)}
        leftContent={(
          <View style={styling.leftSwipeItem}></View>
        )}
        onLeftActionComplete={this.swipeLeft}
        onRightActionComplete={this.swipeRight}
        onSwipeStart={this.props.swipeStart}
        onSwipeRelease={this.props.swipeEnd}
      >
        <View style={styling.fridgeItemContainer}>
            <View style={this.state.selected ? styling.imageContainerBorder : styling.imageContainerNoBorder} >
                <Image style={styling.foodGroupImage} source={{uri: loadimage}}/>
            </View>
            {this.state.unlisted_food ? 
            <Text style={styling.fridgeItemName}>{this.state.unlisted_food + "\n"}
              <Text style={styling.secondaryText} lightColor="#ccc" darkColor="#ccc">{this.determineSecondaryText()}</Text>
            </Text> :
            <Text style={styling.fridgeItemName}>{this.state.food_name + "\n"}
            <Text style={styling.secondaryText} lightColor="#ccc" darkColor="#ccc">{this.determineSecondaryText()}</Text>
          </Text>
            }
            
            <View style={styling.autoLeft}>
              <TouchableWithoutFeedback onPress={this.updateModalVisible}>
                <MaterialCommunityIcons name="dots-horizontal" style={styling.iconSize}/>
              </TouchableWithoutFeedback>
            </View>
        </View>
      </Swipeable>
    );
  }
}

/*
TODO: no need for corn.png
*/