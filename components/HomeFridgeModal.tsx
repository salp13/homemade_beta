import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals';

import { Text, View } from './Themed'

interface Props {
    modalProperties: {
      modalVisible: boolean,
      index: number | undefined,
    },
    ModalResultFunc: Function
}

interface State {
  modalVisible: boolean
  index: number | undefined
}

export default class HomeFridgeModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      modalVisible: this.props.modalProperties.modalVisible,
      index: this.props.modalProperties.index
    }

    this.modalAdd = this.modalAdd.bind(this)
    this.modalDismiss = this.modalDismiss.bind(this)
    this.modalCancel = this.modalCancel.bind(this)
  }

  componentDidUpdate() {
    if (this.props.modalProperties.modalVisible !== this.state.modalVisible) {
      this.setState({
        modalVisible: this.props.modalProperties.modalVisible,
        index: this.props.modalProperties.index
      })
    }
  }

  modalAdd() {
    this.props.ModalResultFunc(this.state.index, "add")
  }

  modalDismiss() {
    this.props.ModalResultFunc(this.state.index, "dismiss")
  }

  modalCancel() {
    this.props.ModalResultFunc(this.state.index)
  }

  render() {
    return (
      <View>
        <BottomModal
          visible={this.state.modalVisible}
          rounded
          swipeDirection='down'
          onSwipeOut={() => {this.modalCancel()}}
          onTouchOutside={() => (this.modalCancel())}
          swipeThreshold={50}
          opacity={.7}
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