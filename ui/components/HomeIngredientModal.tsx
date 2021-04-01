import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals'
import { Text, View } from './Themed'
import { styling } from '../style'

interface Props {
  modalProperties: {
    modalVisible: boolean,
    id: number | string | undefined,
  },
  ModalResultFunc: Function
}

interface State {
  modalVisible: boolean
  index: number | string | undefined
}

export default class HomeIngredientModal extends React.Component<Props, State> {
  private BottomModalProps = {
    rounded: true, 
    swipeDirection: 'down', 
    swipeThreshold: 50, 
    opacity: .7
  }
  constructor(props: Props) {
    super(props)
    this.state = {
      modalVisible: this.props.modalProperties.modalVisible,
      index: this.props.modalProperties.id
    }
    this.modalRemove = this.modalRemove.bind(this)
    this.modalCancel = this.modalCancel.bind(this)
  }

  componentDidUpdate() {
    // if the incoming modal visibility is different from the component's current stored modal visibility, update state to reflect new visibility
    if (this.props.modalProperties.modalVisible !== this.state.modalVisible) {
      this.setState({
        modalVisible: this.props.modalProperties.modalVisible,
        index: this.props.modalProperties.id
      })
    }
  }

  modalRemove() {
    // remove item from ingredients list
    this.props.ModalResultFunc(this.state.index, "remove")
  }

  modalCancel() {
    // cancel modal
    this.props.ModalResultFunc(this.state.index)
  }

  render() {
    return (
      <View>
        <BottomModal
          {... this.BottomModalProps}
          visible={this.state.modalVisible}
          onSwipeOut={() => {this.modalCancel()}}
          onTouchOutside={() => (this.modalCancel())}
          >
            <View style={styling.modalBar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
            <ModalContent>
              <TouchableWithoutFeedback onPress={() => {this.modalRemove()}}> 
                <Text style={styling.modalOption}>Remove from the ingredients list</Text>
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
