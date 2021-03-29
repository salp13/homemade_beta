import React from 'react';
import { Modal, TouchableWithoutFeedback, StyleSheet, SectionList, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Text, View } from './Themed'

const sectionsArray = [{
  title: "mealType",
  data: [
    "dinner",
    "lunch",
    "breakfast",
    "dessert", 
    "side"
  ]},
  {
  title: "dietaryPreference",
  data: [
    "vegetarian",
    "vegan",
    "sustainable",
    "dairy-free",
    "gluten-free"
  ]}, 
  {
  title: "cuisine",
  data: [
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
}]

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
    this.filterSectionListRender = this.filterSectionListRender.bind(this)
    this.filterSectionHeaderRender = this.filterSectionHeaderRender.bind(this)
    this.filterSectionFooterRender = this.filterSectionFooterRender.bind(this)
  }

  componentDidUpdate() {
    // if the incoming modal visibility is different from the component's current stored modal visibility, update state to reflect new visibility
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
    // reset state and send modal results back to screen
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
    // clear all filters and send results back to screen
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
    // add a certain filter item to the included filters
    const filterDeepCopy = JSON.parse(JSON.stringify(this.state.filters))
    const filterIndex = filterDeepCopy[filterType].findIndex((filter) => {return filter === item})
    if (filterIndex === -1) filterDeepCopy[filterType].push(item)
    else filterDeepCopy[filterType].splice(filterIndex, 1)
    this.setState({
      filters: filterDeepCopy
    })
  }

  showAllOptions(filterType: string) {
    // make all options for a filter type visible to user
    const showAllDeepCopy = JSON.parse(JSON.stringify(this.state.showAll));
    showAllDeepCopy[filterType] = true
    this.setState({
      showAll: showAllDeepCopy
    })
  }

  showFewerOptions(filterType: string) {
    // make only a few options for a filter type visible to user
    const showAllDeepCopy = JSON.parse(JSON.stringify(this.state.showAll));
    showAllDeepCopy[filterType] = false
    this.setState({
      showAll: showAllDeepCopy
    })
  }

  filterSectionListRender(item, index, section) {
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
  }

  filterSectionHeaderRender(section) {
    let sectionHeader = 'Meal Types'
    if (section.title === 'dietaryPreference') sectionHeader = 'Dietary Preferences'
    else if (section.title === 'cuisine') sectionHeader = 'Cuisines'
    return ( 
      <View style={{marginTop: 10, marginBottom: 15}}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>{sectionHeader}</Text>
      </View> 
    )
  }

  filterSectionFooterRender(section) {
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
    )}
  }

  render() {
    return (
      <View> 
        <Modal  
          transparent = {false}
          animationType = {"slide"}
          presentationStyle = "pageSheet"
          visible = {this.state.modalVisible}
          >
            <View>
              <View style={styles.bar} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <Text style={{alignSelf: 'center', fontSize: 15, fontWeight: 'bold', marginTop: 15}}>Filters</Text>
              <View style={styles.container} >
                <ScrollView>
                  <SectionList 
                    sections={sectionsArray}
                    renderItem={({item, index, section}) => this.filterSectionListRender(item, index, section)}
                    renderSectionHeader={({section}) => this.filterSectionHeaderRender(section)}
                    renderSectionFooter={({section}) => this.filterSectionFooterRender(section)}
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