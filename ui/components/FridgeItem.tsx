import React from 'react';
import { fridgeItemType } from '../objectTypes'
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable';
import { Text, View, Image } from './Themed';

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
    // triggered when user swipes left on food item
    setTimeout(() => {this.props.swipeLeftFunc(this.state.id)}, 200)
  }

  swipeRight = () => {
      // triggered when user swipes right on food item
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
          (<View style={[styles.rightSwipeItem, {backgroundColor: '#96FFAF'}]}></View>)}
        leftContent={(
          <View style={[styles.leftSwipeItem, {backgroundColor: '#FF6A6A'}]}></View>
        )}
        onLeftActionComplete={this.swipeLeft}
        onRightActionComplete={this.swipeRight}
        onSwipeStart={this.props.swipeStart}
        onSwipeEnd={this.props.swipeEnd}
      >
        <View style={styles.container}>
            <View style={this.state.selected ? styles.imageContainerBorder : styles.imageContainerNoBorder} >
                <Image style={styles.image} source={{uri: loadimage}}/>
            </View>
            {this.state.unlisted_food ? 
            <Text style={styles.itemName}>{this.state.unlisted_food + "\n"}
              <Text style={styles.secondary} lightColor="#ccc" darkColor="#ccc">{this.determineSecondaryText()}</Text>
            </Text> :
            <Text style={styles.itemName}>{this.state.food_name + "\n"}
            <Text style={styles.secondary} lightColor="#ccc" darkColor="#ccc">{this.determineSecondaryText()}</Text>
          </Text>
            }
            
            <View style={styles.menuIcon}>
              <TouchableWithoutFeedback onPress={this.updateModalVisible}>
                <MaterialCommunityIcons name="dots-horizontal" size={25}/>
              </TouchableWithoutFeedback>
            </View>
        </View>
      </Swipeable>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 15,
    flexDirection: "row",
  },
  imageContainerBorder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 3,
    borderColor: "yellow",
    overflow: "hidden",
    backgroundColor: "#ccc"
  },
  imageContainerNoBorder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 3,
    borderColor: "transparent",
    overflow: "hidden",
    backgroundColor: "#ccc"
  },
  image: {
    width: 20,
    height: 20,
    marginTop: 3,
    left: 4,
    backgroundColor: "#ccc"
  },
  itemName: {
    paddingLeft: 15,
    fontSize: 15,
    fontWeight: "bold"
  },
  secondary: {
  fontSize: 12,
  fontWeight: "normal"
  },
  menuIcon:{
    marginTop: 5,
    marginLeft: 'auto',
  },
  leftSwipeItem: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    left: -1,
    paddingRight: 20
  },
  rightSwipeItem: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 20
  },
});