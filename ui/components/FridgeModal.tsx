import React from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import {BottomModal, ModalContent} from 'react-native-modals';
import { AntDesign } from '@expo/vector-icons'; 

import { Text, View } from './Themed'

interface Props {
    modalProperties: {
      visible: boolean,
      index: number | undefined,
      daysToExp: number | undefined
    },
    ModalResultFunc: Function
}

interface State {
  visible: boolean
  index: number | undefined
  daysToExp: number | undefined
  editting: boolean
}

export default class HomeFridgeModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    const propValues = JSON.parse(JSON.stringify(this.props.modalProperties))
    this.state = {
      visible: propValues.visible,
      index: propValues.index,
      daysToExp: propValues.daysToExp,
      editting: false
    }

    this.edit = this.edit.bind(this)
    this.saveEdit = this.saveEdit.bind(this)
    this.cancelEdit = this.cancelEdit.bind(this)
    this.editPlus = this.editPlus.bind(this)
    this.editMinus = this.editMinus.bind(this)
    this.eaten = this.eaten.bind(this)
    this.wasted = this.wasted.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  componentDidUpdate() {
    if (this.props.modalProperties.visible !== this.state.visible) {
      const propValues = JSON.parse(JSON.stringify(this.props.modalProperties))
      this.setState({
        visible: propValues.visible,
        index: propValues.index,
        daysToExp: propValues.daysToExp,
      })
    }
  }

  edit() {
    this.setState({
      editting: true
    })
  }

  saveEdit() {
    this.setState({
      editting: false,
    })
    this.props.ModalResultFunc(this.state.index, "edit", this.state.daysToExp)
  }

  cancelEdit() {
    const daysToExp = JSON.parse(JSON.stringify(this.props.modalProperties.daysToExp))
    this.setState({
      editting: false,
      daysToExp: daysToExp,
      visible: false,
    })
  }

  editPlus() {
    let updateDays = JSON.parse(JSON.stringify(this.state.daysToExp))
    if (updateDays !== undefined) updateDays = updateDays + 1
    this.setState({
      daysToExp: updateDays
    })
  }

  editMinus() {
    let updateDays = JSON.parse(JSON.stringify(this.state.daysToExp))
    if (updateDays) updateDays = updateDays - 1
    this.setState({
      daysToExp: updateDays
    })
  }


  eaten() {
    this.props.ModalResultFunc(this.state.index, "eaten")
  }

  wasted() {
    this.props.ModalResultFunc(this.state.index, "wasted")
  }

  cancel() {
    this.setState({
      editting: false
    })
    this.props.ModalResultFunc(this.state.index)
  }

  render() {
    return (
      <View>
        <BottomModal
          visible={this.state.visible}
          rounded
          swipeDirection='down'
          onSwipeOut={() => {this.cancel()}}
          onTouchOutside={() => (this.cancel())}
          swipeThreshold={50}
          opacity={.7}
          >
            <View style={styles.bar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)"/>
            <ModalContent style={styles.container}>
              {this.state.editting ? 
                <View>
                  <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    {this.state.daysToExp !== 0 ?
                    <View style={{flexDirection: 'row'}}>
                      <TouchableWithoutFeedback onPress={() => {this.editMinus()}}> 
                        <AntDesign name="minus" size={24} color="black" />
                      </TouchableWithoutFeedback>
                      <Text style={{fontSize: 20, marginHorizontal: 20}}>{this.state.daysToExp}</Text>
                    </View> :
                    <View><Text style={{fontSize: 20, marginHorizontal: 20}}>frozen</Text></View>}
                    <TouchableWithoutFeedback onPress={() => {this.editPlus()}}> 
                      <AntDesign name="plus" size={24} color="black" />
                    </TouchableWithoutFeedback>
                  </View>
                  <View style={{flexDirection: 'row', marginTop: 30}}> 
                    <TouchableWithoutFeedback onPress={this.cancelEdit}>
                      <Text>Cancel</Text>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this.saveEdit}>
                      <Text style={{marginLeft: 'auto'}}>Save</Text>
                    </TouchableWithoutFeedback>
                  </View>
                </View> :
                <View>
                  <TouchableWithoutFeedback onPress={() => {this.edit()}}> 
                    <Text style={styles.option}>Edit</Text>
                  </TouchableWithoutFeedback>
                  <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                  <TouchableWithoutFeedback onPress={() => {this.eaten()}}> 
                    <Text style={styles.option}>Eaten</Text>
                  </TouchableWithoutFeedback>
                  <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                  <TouchableWithoutFeedback onPress={() => {this.wasted()}}>
                    <Text style={styles.option}>Wasted</Text>
                  </TouchableWithoutFeedback>
                  <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                  <TouchableWithoutFeedback onPress={() => {this.cancel()}}>
                    <Text style={styles.cancel}>Cancel</Text>
                  </TouchableWithoutFeedback>
                </View>
               }
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

