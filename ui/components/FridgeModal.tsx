import React from 'react';
import moment from 'moment';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { BottomModal, ModalContent } from 'react-native-modals';
import { AntDesign } from '@expo/vector-icons'; 
import { Text, View } from './Themed'

interface Props {
    modalProperties: {
      visible: boolean,
      id: number | undefined,
      expiration_date: Date | undefined
    },
    ModalResultFunc: Function
}

interface State {
  visible: boolean
  id: number | undefined
  expiration_date: Date | undefined
  daysToExp: number | undefined
  editting: boolean
}

export default class HomeFridgeModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    const propValues = JSON.parse(JSON.stringify(this.props.modalProperties))
    let daysDiff = (propValues.expiration_date) ? Math.ceil((new Date(propValues.expiration_date).valueOf() - new Date().valueOf()) / (24 * 60 * 60 * 1000)) : 0
    this.state = {
      visible: propValues.visible,
      id: propValues.id,
      expiration_date: propValues.expiration_date,
      daysToExp: daysDiff,
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
    // if the incoming modal visibility is different from the component's current stored modal visibility, update state to reflect new visibility
    if (this.props.modalProperties.visible !== this.state.visible) {
      const propValues = JSON.parse(JSON.stringify(this.props.modalProperties))
      let daysDiff = (propValues.expiration_date) ? Math.ceil((new Date(propValues.expiration_date).valueOf() - new Date().valueOf()) / (24 * 60 * 60 * 1000)) : 0
      this.setState({
        visible: propValues.visible,
        id: propValues.id,
        expiration_date: propValues.expiration_date,
        daysToExp: daysDiff
      })
    }
  }

  edit() {
    // update state to editting true
    this.setState({
      editting: true
    })
  }

  saveEdit() {
    // send expiration date edits to screen 
    this.setState({
      editting: false,
    })
    this.props.ModalResultFunc(this.state.id, "edit", this.state.expiration_date)
  }

  cancelEdit() {
    // revert an edits back to the original
    const expiration_date = JSON.parse(JSON.stringify(this.props.modalProperties.expiration_date))
    let daysDiff = (expiration_date) ? Math.ceil((new Date(expiration_date).valueOf() - new Date().valueOf()) / (24 * 60 * 60 * 1000)) : 0
    this.setState({
      editting: false,
      expiration_date: expiration_date,
      daysToExp: daysDiff,
      visible: false,
    })
  }

  editPlus() {
    // increment expiration date by 1
    let updateDays = JSON.parse(JSON.stringify(this.state.daysToExp))
    let exp_date = JSON.parse(JSON.stringify(this.state.expiration_date))
    if (exp_date) {
      updateDays = updateDays + 1
      exp_date = new Date(new Date(exp_date).valueOf() + 1000*60*60*24)
    } else {
      updateDays = 1
      exp_date = moment().add(1, 'days').format('YYYY-MM-DD')
      console.log(exp_date)
    }
    this.setState({
      expiration_date: exp_date,
      daysToExp: updateDays
    })
  }

  editMinus() {
    // decrement expiration date by 1
    let updateDays = JSON.parse(JSON.stringify(this.state.daysToExp))
    let exp_date = JSON.parse(JSON.stringify(this.state.expiration_date))
    if (exp_date) {
      updateDays = updateDays - 1
      exp_date = new Date(new Date(exp_date).valueOf() - 1000*60*60*24)
      this.setState({
        expiration_date: exp_date,
        daysToExp: updateDays
      })
    } 
  }


  eaten() {
    // mark item as eaten
    this.props.ModalResultFunc(this.state.id, "eaten")
  }

  wasted() {
    // mark item as wasted
    this.props.ModalResultFunc(this.state.id, "wasted")
  }

  cancel() {
    // cancel editting and send information back to screen
    this.setState({
      editting: false
    })
    this.props.ModalResultFunc(this.state.id)
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

