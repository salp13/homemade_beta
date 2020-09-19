import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Swipeable from 'react-native-swipeable';

import { Text, View, Image } from './Themed';

interface Props {
  item: any
  index: number
  modalUpdateFunc: Function
  swipeLeftFunc: Function
  swipeRightFunc: Function
  swipeStart: Function
  swipeEnd: Function
}

interface State {
  imageIndex: number
  title: string
  daysToExp: number | undefined
  selected: boolean
  index: number
}

const images = [
  require("./vegetable.png"),
  require("./protein.png"),
  require("./milk.png"),
  require("./sauce.png"),
  require("./corn.png"),
]

export default class FridgeItem extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props)
    this.state = {
      imageIndex: this.props.item.imageIndex,
      title: this.props.item.title,
      daysToExp: this.props.item.daysToExp,
      selected: this.props.item.selected,
      index: this.props.index,
    }
  }

  componentDidUpdate() {
    if (this.props.item.title !== this.state.title || this.props.item.daysToExp !== this.state.daysToExp) {
      this.setState({
        imageIndex: this.props.item.imageIndex,
        title: this.props.item.title,
        daysToExp: this.props.item.daysToExp,
        selected: this.props.item.selected,
        index: this.props.index,
      })
    }
  }

  updateModalVisible = () => {
    this.props.modalUpdateFunc(this.state.index, this.state.selected)
  }

  swipeLeft = () => {
    setTimeout(() => {this.props.swipeLeftFunc(this.state.index)}, 200)
  }

  swipeRight = () => {
    setTimeout(() => {this.props.swipeRightFunc(this.state.index)}, 200)
  }

  render() {
    let secondaryText = ''
    if (this.state.daysToExp && this.state.daysToExp === 1) secondaryText = 'this expires today'
    else if (this.state.daysToExp) secondaryText = `this expires in ${this.state.daysToExp} days`

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
              <Image style={styles.image} source={this.state.imageIndex !== -1 ? images[this.state.imageIndex] : images[4]}/>
            </View>
            <Text style={styles.itemName}>{this.state.title + "\n"}
              <Text style={styles.secondary} lightColor="#ccc" darkColor="#ccc">{secondaryText}</Text>
            </Text>
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


/*
  BE-TODO
    REQUESTS
    - GET: images to render from database
*/