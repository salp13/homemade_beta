import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals'
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

export default class HomeIngredientModal extends React.Component<Props, State> {
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
              <TouchableWithoutFeedback onPress={() => {this.modalRemove()}}> 
                <Text style={styles.option}>Remove from the ingredients list</Text>
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