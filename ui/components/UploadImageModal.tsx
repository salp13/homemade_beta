import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { BottomModal, ModalContent } from 'react-native-modals';
import { Text, View } from './Themed'
import { styling } from '../style'

interface Props {
    modalProperties: {
      visible: boolean,
      take_photo: boolean,
      upload_photo: boolean
    },
    ModalResultFunc: Function
}

interface State {
  visible: boolean
}

export default class UploadImageModal extends React.Component<Props, State> {
  private BottomModalProps = {
    rounded: true, 
    swipeDirection: 'down', 
    swipeThreshold: 50, 
    opacity: .7
  }

  constructor(props: Props) {
    super(props)
    const propValues = JSON.parse(JSON.stringify(this.props.modalProperties))
    this.state = {
      visible: propValues.visible,
    }

    this.cancel = this.cancel.bind(this)
  }

  componentDidUpdate() {
    // if the incoming modal visibility is different from the component's current stored modal visibility, update state to reflect new visibility
    if (this.props.modalProperties.visible !== this.state.visible) {
      const propValues = JSON.parse(JSON.stringify(this.props.modalProperties))
      this.setState({
        visible: propValues.visible,
      })
    }
  }

  selected(take_photo: boolean) {
    if (take_photo) this.props.ModalResultFunc(true, false)
    else this.props.ModalResultFunc(false, true)
  }

  cancel() {
    this.props.ModalResultFunc(false, false)
  }

  render() {
    return (
      <View>
        <BottomModal
          {... this.BottomModalProps}
          visible={this.state.visible}
          onSwipeOut={() => {this.cancel()}}
          onTouchOutside={() => (this.cancel())}
          >
            <View style={styling.modalBar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
            <ModalContent>
                  <View style={{alignSelf: 'center'}}>
                    <TouchableWithoutFeedback onPress={() => {this.selected(true)}}> 
                      <Text style={[styling.modalOption, {alignSelf: 'center'}]}>Take Photo</Text>
                    </TouchableWithoutFeedback>
                    <View style={styling.fullSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                    <TouchableWithoutFeedback onPress={() => {this.selected(false)}}> 
                      <Text style={[styling.modalOption, {alignSelf: 'center'}]}>Choose from Photo Library</Text>
                    </TouchableWithoutFeedback>
                    <View style={styling.fullSeparator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                    <TouchableWithoutFeedback onPress={() => {this.cancel()}}>
                      <Text style={[styling.modalOption, {alignSelf: 'center'}]}>Cancel</Text>
                    </TouchableWithoutFeedback>
                </View>
            </ModalContent>
        </BottomModal>
      </View>
    );
  }
}