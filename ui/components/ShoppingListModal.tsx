import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals';
import { Text, View } from './Themed'
import { styling } from '../style'

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
  private BottomModalProps = {
    rounded: true,
    swipeDirection: 'down',
    swipeThreshold: 50,
    opacity: .7
  }
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
    // if the incoming modal visibility is different from the component's current stored modal visibility, update state to reflect new visibility
    if (this.props.modalProperties.visible !== this.state.visible) {
      this.setState({
        visible: this.props.modalProperties.visible,
        index: this.props.modalProperties.index
      })
    }
  }

  addFridge() {
    // send added item to screen
    this.props.ModalResultFunc(this.state.index, "addFridge", )
  }

  remove() {
    // send removed item to screen
    this.props.ModalResultFunc(this.state.index, "remove")
  }

  reorder() {
    // send new ordering to screen
    this.props.ModalResultFunc(this.state.index, "reorder")
  }

  modalCancel() {
    // cancel modal changes
    this.props.ModalResultFunc(this.state.index)
  }

  render() {
    return (
      <View>
        <BottomModal
          {... this.BottomModalProps}
          visible={this.state.visible}
          onSwipeOut={() => {this.modalCancel()}}
          onTouchOutside={() => (this.modalCancel())}
          >
          <View style={styling.modalBar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
          <ModalContent>
            <TouchableWithoutFeedback onPress={() => {this.addFridge()}}> 
              <Text style={styling.modalOption}>Remove and add to fridge</Text>
            </TouchableWithoutFeedback>
            <View style={styling.fullSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <TouchableWithoutFeedback onPress={() => {this.remove()}}> 
              <Text style={styling.modalOption}>Remove</Text>
            </TouchableWithoutFeedback>
            <View style={styling.fullSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <TouchableWithoutFeedback onPress={() => {this.reorder()}}> 
              <Text style={styling.modalOption}>Reorder</Text>
            </TouchableWithoutFeedback>
            <View style={styling.fullSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <TouchableWithoutFeedback onPress={() => {this.modalCancel()}}>
              <Text style={StyleSheet.flatten([styling.modalOption, {alignSelf: 'center'}])}>Cancel</Text>
            </TouchableWithoutFeedback>
          </ModalContent>
        </BottomModal>
      </View>
    );
  }
}