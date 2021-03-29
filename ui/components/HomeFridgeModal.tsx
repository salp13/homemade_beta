import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals';
import { Text, View } from './Themed'

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
      modalVisible: this.props.modalProperties.modalVisible,
      index: this.props.modalProperties.id
    }

    this.modalAdd = this.modalAdd.bind(this)
    this.modalDismiss = this.modalDismiss.bind(this)
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

  modalAdd() {
    // add item to ingredients list
    this.props.ModalResultFunc(this.state.index, "add")
  }

  modalDismiss() {
    // dismiss item from being viewable on home screen fridge
    this.props.ModalResultFunc(this.state.index, "dismiss")
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
          <View style={styles.bar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
          <ModalContent style={styles.container}>
            <TouchableWithoutFeedback onPress={() => {this.modalAdd()}}> 
              <Text style={styles.option}>Add this item to ingredients list</Text>
            </TouchableWithoutFeedback>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <TouchableWithoutFeedback onPress={() => {this.modalDismiss()}}> 
              <Text style={styles.option}>Dismiss this item for now</Text>
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