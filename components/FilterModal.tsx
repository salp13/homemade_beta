import React from 'react';
import { Modal, TouchableWithoutFeedback, StyleSheet, SectionList, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import { Text, View } from './Themed'

interface Props {
  modalVisible: boolean,
  filters: {
    mealType: Array<string>,
    dietaryPreference: Array<string>,
    cuisine: Array<string>
  }
  modalResults: Function
  modalVisibility: Function
}

interface State {
  modalVisible: boolean
  filters: {
    mealType: Array<string>,
    dietaryPreference: Array<string>,
    cuisine: Array<string>
  }
  showAll: {
    mealType: boolean
    dietaryPreferences: boolean
    cuisine: boolean
  },
}


const filterOptions = {
  mealType: [
    "dinner",
    "lunch",
    "breakfast",
    "dessert", 
    "side"
  ],
  dietaryPreference: [
    "vegetarian",
    "vegan",
    "sustainable",
    "dairy-free",
    "gluten-free"
  ],
  cuisine: [
    "italian",
    "mexican",
    "chinese",
    "korean",
    "indian",
    "mediterranean",
    "spanish",
    "french",
    "american"
  ]
}

export default class HomeFridgeModal extends React.Component<Props, State> {
  

  constructor(props: Props) {
    super(props)
    this.state = {
      modalVisible: false,
      filters: {
        mealType: [],
        dietaryPreference: [],
        cuisine: []
      },
      showAll: {
        mealType: false,
        dietaryPreferences: false,
        cuisine: false
      },
    }

    this.modalResults = this.modalResults.bind(this)
    this.filterClear = this.filterClear.bind(this)
    this.markFilter = this.markFilter.bind(this)
    this.showAllOptions = this.showAllOptions.bind(this)
    this.showFewerOptions = this.showFewerOptions.bind(this)
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.modalVisible !== this.state.modalVisible) {
      const filterDeepCopy = JSON.parse(JSON.stringify(this.props.filters));
      this.setState({
        modalVisible: this.props.modalVisible,
        filters: filterDeepCopy,
        showAll: {
          mealType: false,
          dietaryPreferences: false,
          cuisine: false
        },
      })
    }
  }

  modalResults() {
    this.setState({
      showAll: {
        mealType: false,
        dietaryPreferences: false,
        cuisine: false
      }
    })
    this.props.modalResults(this.state.filters)
  }

  filterClear() {
    this.setState({
      filters: {
        mealType: [],
        dietaryPreference: [],
        cuisine: [],
      },
      showAll: {
        mealType: false,
        dietaryPreferences: false,
        cuisine: false
      }
    })
    this.props.modalResults({mealType: [], dietaryPreference: [], cuisine: []})
  }

  markFilter(filterType: string, item: string) {
    const filterDeepCopy = JSON.parse(JSON.stringify(this.state.filters));
    const filterIndex = filterDeepCopy[filterType].findIndex((filter) => {return filter === item})
    if (filterIndex === -1) filterDeepCopy[filterType].push(item)
    else filterDeepCopy[filterType].splice(filterIndex, 1)
    this.setState({
      filters: filterDeepCopy
    })
  }

  showAllOptions(filterType: string) {
    const showAllDeepCopy = JSON.parse(JSON.stringify(this.state.showAll));
    showAllDeepCopy[filterType] = true
    this.setState({
      showAll: showAllDeepCopy
    })
  }

  showFewerOptions(filterType: string) {
    const showAllDeepCopy = JSON.parse(JSON.stringify(this.state.showAll));
    showAllDeepCopy[filterType] = false
    this.setState({
      showAll: showAllDeepCopy
    })
  }

  render() {

    return (
      <View> 
        <Modal  
          transparent = {false}
          animationType = {"slide"}
          visible = {this.state.modalVisible}
          presentationStyle = "pageSheet"
          >
            <View>
              <View style={styles.bar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <Text style={{alignSelf: 'center', fontSize: 15, fontWeight: 'bold', marginTop: 15}}>Filters</Text>
              <View style={styles.container} >
                <ScrollView>
                  <SectionList 
                    sections={[
                      {title: 'mealType', data: filterOptions.mealType}, 
                      {title: 'dietaryPreference', data: filterOptions.dietaryPreference}, 
                      {title: 'cuisine', data: filterOptions.cuisine}]}
                    renderItem={({item, index, section}) => {
                      if (index < 3 || this.state.showAll[section.title]) {
                        return (   
                          <View style={{flexDirection: 'row', marginBottom: 15}}>
                            <Text>{item}</Text>
                            <View style={{marginLeft: 'auto', marginTop: -5}}>
                              <TouchableWithoutFeedback onPress={() => this.markFilter(section.title, item)}>
                                {(this.state.filters.mealType.find((filter) => {return filter === item})) || 
                                (this.state.filters.dietaryPreference.find((filter) => {return filter === item})) || 
                                (this.state.filters.cuisine.find((filter) => {return filter === item})) ? 
                                <MaterialCommunityIcons name="checkbox-marked-outline" size={24} color="black" /> : 
                                <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="black" /> }
                              </TouchableWithoutFeedback>
                            </View>
                          </View> 
                      )}
                      else { return ( <Text style={{marginTop: -20}}></Text> ) }
                    }}
                    renderSectionHeader={({section}) => {
                      let sectionHeader = 'Meal Types'
                      if (section.title === 'dietaryPreference') sectionHeader = 'Dietary Preferences'
                      else if (section.title === 'cuisine') sectionHeader = 'Cuisines'
                      return ( 
                        <View style={{marginTop: 10, marginBottom: 15}}>
                          <Text style={{fontSize: 20, fontWeight: 'bold'}}>{sectionHeader}</Text>
                        </View> 
                    )}}
                    renderSectionFooter={({section}) => {
                      if (!this.state.showAll[section.title]) {
                        return (
                          <View>
                            <TouchableWithoutFeedback onPress={() => {this.showAllOptions(section.title)}}>
                              <Text style={{textDecorationLine: 'underline'}}>Show all options</Text>
                            </TouchableWithoutFeedback>
                            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                          </View>
                        )
                      } else {
                        return (
                          <View>
                            <TouchableWithoutFeedback onPress={() => {this.showFewerOptions(section.title)}}>
                              <Text style={{textDecorationLine: 'underline'}}>Show fewer options</Text>
                            </TouchableWithoutFeedback>
                            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                          </View>
                      )}}}
                  />
                </ScrollView>
                
                <View style={{flexDirection: 'row', marginTop: 30}}> 
                  <TouchableWithoutFeedback onPress={this.filterClear}>
                    <Text>Clear All</Text>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={this.modalResults}>
                    <Text style={{marginLeft: 'auto'}}>Show Results</Text>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>
        </Modal>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  outerContainer: {
    marginTop: 300,
    height: 300,
  },
  bar: {
    marginTop: 15,
    height: 3, 
    width: 40,
    borderRadius: 3,
    alignSelf: 'center'
  },
  container: {
    margin: 20,
    height: 700,
    overflow: 'scroll',
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
    marginTop: 20,
    marginBottom: 10,
    height: 1,
  },
})