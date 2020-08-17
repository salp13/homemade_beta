import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals';

import { Text, View } from './Themed'

interface Props {
    modalProperties: {
      visible: boolean,
      index: number | undefined,
    },
    ModalResultFunc: Function
}

interface State {
  visible: boolean
  index: number | undefined
}

export default class HomeFridgeModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      visible: this.props.modalProperties.visible,
      index: this.props.modalProperties.index
    }

    this.addFridge = this.addFridge.bind(this)
    this.remove = this.remove.bind(this)
    this.reorder = this.reorder.bind(this)
    this.modalCancel = this.modalCancel.bind(this)
  }

  componentDidUpdate() {
    if (this.props.modalProperties.visible !== this.state.visible) {
      this.setState({
        visible: this.props.modalProperties.visible,
        index: this.props.modalProperties.index
      })
    }
  }

  addFridge() {
    this.props.ModalResultFunc(this.state.index, "addFridge")
  }

  remove() {
    this.props.ModalResultFunc(this.state.index, "remove")
  }

  reorder() {
    this.props.ModalResultFunc(this.state.index, "reorder")
  }

  modalCancel() {
    this.props.ModalResultFunc(this.state.index)
  }

  render() {
    return (
      <View>
        <BottomModal
          visible={this.state.visible}
          rounded
          swipeDirection='down'
          onSwipeOut={() => {this.modalCancel()}}
          onTouchOutside={() => (this.modalCancel())}
          swipeThreshold={50}
          opacity={.7}
          >
            <View style={styles.bar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
            <ModalContent style={styles.container}>
              <TouchableWithoutFeedback onPress={() => {this.addFridge()}}> 
                <Text style={styles.option}>Remove and add to fridge</Text>
              </TouchableWithoutFeedback>
              <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <TouchableWithoutFeedback onPress={() => {this.remove()}}> 
                <Text style={styles.option}>Remove</Text>
              </TouchableWithoutFeedback>
              <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <TouchableWithoutFeedback onPress={() => {this.reorder()}}> 
                <Text style={styles.option}>Reorder</Text>
              </TouchableWithoutFeedback>
              <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <TouchableWithoutFeedback onPress={() => {this.modalCancel()}}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableWithoutFeedback>
            </ModalContent>
        </BottomModal>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  bar: {
    marginTop: 15,
    height: 3, 
    width: 40,
    borderRadius: 3,
    alignSelf: 'center'
  },
  container: {
    margin: 20,
  },
  option: {
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 15,
    fontSize: 20,
    fontWeight: "normal"
  },
  cancel: {
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 15,
    fontSize: 15,
    alignSelf: 'center',
    fontWeight: "normal"
  },
  separator: {
    marginVertical: 10,
    height: 1,
  },
})