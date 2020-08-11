import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text, View, Image } from './Themed';

interface Props {
  imageIndex: number
  title: string
  daysToExp: number
  selected: boolean
}

const images = [
  require("./vegetable.png"),
  require("./protein.png"),
  require("./milk.png"),
  require("./sauce.png"),
  require("./corn.png"),
]

export default class FridgeItem extends React.Component<Props> {
  render() {
    let secondaryText = ''
    if (this.props.daysToExp && this.props.daysToExp === 1) secondaryText = 'this expires today'
    else if (this.props.daysToExp) secondaryText = `this expires in ${this.props.daysToExp} days`

    return (
      <View style={styles.container}>
        <View style={this.props.selected ? styles.imageContainerBorder : styles.imageContainerNoBorder} >
          <Image style={styles.image} source={this.props.imageIndex !== -1 ? images[this.props.imageIndex] : images[4]}/>
        </View>
        <Text style={styles.itemName}>{this.props.title + "\n"}
          <Text style={styles.secondary} lightColor="#ccc" darkColor="#ccc">{secondaryText}</Text>
        </Text>
        <MaterialCommunityIcons name="dots-horizontal" size={25} style={styles.icon} />
      </View>
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
  icon:{
    marginTop: 5,
    justifyContent: 'flex-end',
    marginLeft: 'auto'
  }
});