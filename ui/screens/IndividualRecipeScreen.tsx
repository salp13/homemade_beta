import * as React from 'react';
import { ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { HomeParamList, ProfileParamList, SearchParamList } from '../types'
import { Image, Text, View } from '../components/Themed';
import { fridgeItemType, recipeEntireType, shoppingListItemType } from '../objectTypes'
import { RouteProp } from '@react-navigation/native';
import { SectionList, TouchableWithoutFeedback } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { styling } from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';
import Dialog from 'react-native-dialog'

type IndividualRecipeParamList = {
  IndividualRecipeScreen: {
    recipe_id: string
  }
  CreateRecipeScreen: {
    recipe_id: string,
    trigger: boolean
  }
} & HomeParamList & SearchParamList & ProfileParamList;


type IndividualRecipeProp = StackNavigationProp<IndividualRecipeParamList, 'IndividualRecipeScreen'>;
type IndividualRecipeRouteProp = RouteProp<IndividualRecipeParamList, 'IndividualRecipeScreen'>;


interface Props {
  navigation: IndividualRecipeProp,
  route: IndividualRecipeRouteProp
}

interface State {
    isLoading: boolean
    updateLoading: boolean
    errorText: string
    token: string
    user_id: string
    trigger: boolean
    recipe: recipeEntireType
    all_foods: Array<any>
    saved: boolean
    shoppingList: Array<shoppingListItemType>
    listAlert: {
      visible: boolean
      quantity: string
      current_quantity: number
      food_name: string
      food_id: string
      add_to_existing: boolean
      unlisted: boolean
    }
}

export default class IndividualRecipeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      updateLoading: false,
      errorText: '',
      token: '', 
      user_id: '', 
      trigger: this.props.route.params.trigger,
      recipe: {
        recipe_id: JSON.parse(JSON.stringify(this.props.route.params.recipe_id)),
        recipe_name: '',
        owner: '', 
        owner_username: '',
        private: false,
        image: '',
        diets: [],
        cuisine: undefined,
        meal_type: undefined,
        instructions: '',
        description: '',
        ingredients: [],
      },
      all_foods: [],
      saved: false,
      shoppingList: [],
      listAlert: {
        visible: false,
        quantity: '',
        current_quantity: 0,
        food_name: '',
        food_id: '',
        add_to_existing: true,
        unlisted: false,
      }
    };

    this.saveRecipe = this.saveRecipe.bind(this)
    this.addToShoppingList = this.addToShoppingList.bind(this)
    this.IsLoadingRender = this.IsLoadingRender.bind(this)
    this.errorMessage = this.errorMessage.bind(this)
  }

  async componentDidMount() {
    const setToken = await AsyncStorage.getItem('@token')
    const setUserID = await AsyncStorage.getItem('@user_id')
    if (setToken && setUserID) {
      this.setState({
        token: setToken,
        user_id: setUserID
      })
    }

    await AsyncStorage.getItem('@all_foods')
    .then( all_foods => {
      if (all_foods) this.setState({ all_foods: JSON.parse(all_foods)})
      else {
        // hit api for all foods excluding the unlisted food item
        fetch(`https://homemadeapp.azurewebsites.net/homemade/many_foods/`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + this.state.token,
          },
        })
        .then(response => response.json())
        .then(data => {
          this.setState({ all_foods: data })
          // set all_foods data
          try {
            AsyncStorage.setItem('@all_foods', JSON.stringify(data))
          } catch (e) {
            console.error(e)
          }
        })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
      }
    })

    // get shopping_list from asyncstorage
    await AsyncStorage.getItem('@shopping_list')
    .then( data => {if (data) return JSON.parse(data)})
    .then( parsed_data => {
      if (parsed_data) { 
        this.setState({ shoppingList: parsed_data })
      }}
    )
   
    // hit api for single recipe
    let recipe_data = await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_recipe/${this.state.recipe.recipe_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => { return data })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    await AsyncStorage.getItem('@saved_recipes')
      .then((data) => { 
        if (data) { 
          let parsed_data = JSON.parse(data)
          const filtered_data = parsed_data.find((recipe) => {return recipe.recipe_id === this.state.recipe.recipe_id})
          this.setState({ 
            isLoading: false,
            recipe: recipe_data,
            saved: filtered_data ? true : false,
          })
        }}
      )
    console.log(recipe_data)
    // hit api for user's saved recipes
    await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_saved_recipes/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => {
        const filtered_data = data.find((recipe) => {return recipe.recipe_id === this.state.recipe.recipe_id})
        this.setState({
          isLoading: false,
          recipe: recipe_data,
          saved: filtered_data ? true : false,
        });
        try {
          AsyncStorage.setItem('@saved_recipes', JSON.stringify(data))
        } catch (e) {
          console.error(e)
        }
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

      // hit api for fridge items
    let shopping_list = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
      },
    })
      .then(response => response.json())
      .then(data => { return data })
      .catch(error => { 
        console.error(error); 
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

    // set shopping_list 
    try {
      AsyncStorage.setItem('@shopping_list', JSON.stringify(shopping_list))
    } catch (e) {
      console.error(e)
    }
  }

  async saveRecipe() {
    this.setState({ updateLoading: true })
    // if the recipe is saved, delete it from saved recipes
    if (this.state.saved) {
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_saved_recipe/${this.state.user_id}/${this.state.recipe.recipe_id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      })
      .catch(error => {
      console.error(error);
      this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });
      this.setState({
        saved: false,
        updateLoading: false,
      })
      try {
        await AsyncStorage.getItem('@saved_recipes').then(recipes => {
          if (recipes) AsyncStorage.setItem('@saved_recipes', JSON.stringify(JSON.parse(recipes).filter(recipe => {return recipe.recipe_id !== this.state.recipe.recipe_id})))
        })
      } catch (e) {
        console.error(e)
      }
    // if the recipe is not saved, save it to saved recipes
    } else {
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_saved_recipe/${this.state.user_id}/${this.state.recipe.recipe_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        'Authorization': 'Token ' + this.state.token,
        },
      }).then(response => response.json())
      .then(data => { 
        try {
          AsyncStorage.getItem('@saved_recipes').then(recipes => {
            if (recipes) AsyncStorage.setItem('@saved_recipes', JSON.stringify(JSON.parse(recipes).concat([data])))
          })
        } catch (e) { console.error(e) }
       })
      .catch(error => {
        console.error(error);
        this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
      });

      this.setState({
        saved: true,
        updateLoading: false,
      })
    }
  }

  async addToShoppingList() { 
    this.setState({ updateLoading: true })
    const id = this.state.listAlert.food_id
    const food_name = this.state.listAlert.food_name

    const many_existing = this.state.shoppingList.filter(item => {
      if (!item.unlisted_food) return item.food.food_name === this.state.listAlert.food_name
      return item.unlisted_food === this.state.listAlert.food_name
    })

    const existing = (many_existing) ? many_existing.sort((a,b) => {
      return (a.order_index > b.order_index) ? -1 : 1
    })[0] : undefined

    // if adding to an existing fridge item
    if (this.state.listAlert.add_to_existing && existing) {
      let editted_list = this.state.shoppingList 
      let new_quant = (!isNaN(Number(this.state.listAlert.quantity))) ? parseInt(this.state.listAlert.quantity) : 1
      const editted_quantity = new_quant + existing.quantity
      if (existing) {
        const index = editted_list.findIndex(ele => ele.id === existing.id)
        editted_list[index].quantity = editted_quantity
      }
      // hit api to update fridge item's quantity
      await fetch(`https://homemadeapp.azurewebsites.net/homemade/single_shopping_list/${this.state.user_id}/${existing.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: JSON.stringify({ quantity: editted_quantity })
      })
        .catch(error => {
          console.error(error);
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
        
      this.setState({
        shoppingList: editted_list,
        updateLoading: false,
        listAlert: {
          quantity: "",
          current_quantity: 0,
          food_name: "",
          food_id: "",
          visible: false,
          add_to_existing: true,
          unlisted: false
        }
      })
    } else {
      let order_index = (this.state.shoppingList) ? this.state.shoppingList.length : 0
      // if creating new fridge item
      let new_quant = (!isNaN(Number(this.state.listAlert.quantity))) ? parseInt(this.state.listAlert.quantity) : 1
      let body = (this.state.listAlert.unlisted) ? 
        JSON.stringify({food: id, unlisted_food: food_name, quantity: new_quant, order_index: order_index}) : 
        JSON.stringify({food: id, quantity: new_quant, order_index: order_index})
      const shopping_list_item = await fetch(`https://homemadeapp.azurewebsites.net/homemade/many_shopping_list/${this.state.user_id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.token,
        },
        body: body
        }).then(response => response.json())
        .then( data => { return data })
        .catch(error => { 
          console.error(error); 
          this.setState({ errorText: 'Could not load at this time. Please check you connection or try again later'})
        });
        
      this.setState({
        shoppingList: this.state.shoppingList.concat([shopping_list_item]),
        updateLoading: false,
        listAlert: {
          quantity: "",
          current_quantity: 0,
          food_name: "",
          food_id: "",
          visible: false,
          add_to_existing: true,
          unlisted: false,
        }
      })
    }
    
      // set changes to AsyncStorage
      try {
        AsyncStorage.setItem('@shopping_list', JSON.stringify(this.state.shoppingList))
      } catch (e) {
        console.error(e)
      } 
  }

  IsLoadingRender() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <ActivityIndicator />
      </View>
    )
  }

  errorMessage() {
    return (
      <View style={[styling.container, styling.noHeader]}>
        <Text>{this.state.errorText}</Text>
       </View>
    )
  }


  render() {
    if (this.state.isLoading) return this.IsLoadingRender()
    if (this.state.errorText !== '') return this.errorMessage()

    let dietaryPrefs = ''
    this.state.recipe.diets.forEach((pref, index) => {
    dietaryPrefs = dietaryPrefs.concat(pref.diet)
    if (index !== this.state.recipe.diets.length - 1) dietaryPrefs = dietaryPrefs.concat(', ')
    })
    let instructions = this.state.recipe.instructions.split("\n").map((ele) => {return ele.trim()})

    return (
    <View style={styling.setFlex}>
      <ScrollView stickyHeaderIndices={[2]} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styling.positioningSetUp}>
          <TouchableWithoutFeedback onPress={this.props.navigation.goBack}>
            <Ionicons name="ios-arrow-back" color="black" style={[styling.largeIconSize, styling.noHeader]}/>
          </TouchableWithoutFeedback>
        </View>
        <Image style={styling.fullRecipeImage} source={{uri: this.state.recipe.image}}/>
        <View style={[styling.container, styling.recipeTitlePadding]}>
          <View style={styling.flexRow}>
            <Text style={styling.fullRecipeName}>{this.state.recipe.recipe_name}</Text>
            <View style={[styling.formatSave, styling.flexRow]}>  
            {(this.state.recipe.owner === this.state.user_id) ? (
              <View style={styling.marginHorizontal20}>  
                <TouchableWithoutFeedback  onPress={() => this.props.navigation.navigate('CreateRecipeScreen', { recipe_id: this.state.recipe.recipe_id, trigger: this.state.trigger })}>
                  <Entypo name="new-message" style={styling.fontSize20} color="black" />
                </TouchableWithoutFeedback>
                </View>) : (<View></View>)}
              <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={this.saveRecipe}>
                  <Fontisto name={this.state.saved ? "bookmark-alt" : "bookmark"} style={styling.iconSize} color="black" />
              </TouchableWithoutFeedback>
            </View>
          </View>
          <Text style={[styling.fontSize20, styling.activityMargin]}>by {this.state.recipe.owner_username}</Text>

          <View style={styling.flexRow}>
              <Text>{dietaryPrefs}</Text>
          </View>
          <View style={styling.marginBottom30}></View>
          </View>
          {this.state.updateLoading ? (<ActivityIndicator style={styling.activityMargin} />) : (<View></View>)}
          <View style={styling.container}>
            <View style={styling.recipeDirectionsFooter}>
                <Text style={styling.recipeDirectionsHeader}>{"Description"}</Text> 
                <Text >{this.state.recipe.description}</Text>
            </View>
            <SectionList
              scrollEnabled={false}
              style={styling.sectionBuffer}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              sections={[ 
                {recipe_name: "Ingredients", data: this.state.recipe.ingredients.map((ingredient) => ingredient.description)}, 
                {recipe_name: "Directions", data: instructions} ]}
              renderItem={({item, section, index}) => {
              if (section.recipe_name === "Ingredients") {
                let food_id = this.state.recipe.ingredients[index].food.food_id
                let food = this.state.all_foods.find(food => food.food_id === food_id)
                let image_uri = (food) ? food.food_group.image : ''
                return ( 
                <View >
                  <TouchableWithoutFeedback disabled={this.state.updateLoading} onPress={() => {
                    let food_name = (this.state.recipe.ingredients[index].unlisted_food) ? this.state.recipe.ingredients[index].unlisted_food : this.state.recipe.ingredients[index].food.food_name
                    let item = this.state.shoppingList.find(item => { return (item.food.food_id === food_id) })
                    let current_quantity = (item) ? item.quantity : 0
                    this.setState({
                    listAlert: {
                      visible: true,
                      quantity: "1",
                      current_quantity: current_quantity,
                      food_name: (food_name) ? food_name : '',
                      food_id: this.state.recipe.ingredients[index].food.food_id,
                      add_to_existing: false,
                      unlisted: (this.state.recipe.ingredients[index].unlisted_food) ? true : false,
                    }
                  })}}>
                    <View style={styling.addItemView}>
                      <View style={styling.imageContainerNoBorderMarginLeft}>
                        <Image style={styling.foodGroupImage} source={{ uri: image_uri }}/>
                      </View>
                      <Text style={styling.searchResultText}>{item}</Text> 
                      <Ionicons name="ios-add" color="black" style={styling.addItemButton}/>
                      </View>
                  </TouchableWithoutFeedback>
                </View>  )}
                return ( <Text style={styling.recipeDirections}>{item}</Text> )
                }}
              renderSectionHeader={({section}) => ( 
                <Text style={styling.recipeDirectionsHeader}>{section.recipe_name}</Text> 
                )}
              renderSectionFooter={() => ( <View style={styling.recipeDirectionsFooter}></View> )}
              /> 
            
            </View>
      </ScrollView>
      <Dialog.Container visible={this.state.listAlert.visible}>
            <Dialog.Title>Add {this.state.listAlert.food_name} to shopping list</Dialog.Title>
            <Dialog.Input
              keyboardType="number-pad"
              textAlign="center"
              placeholder="quantity of this item"
              placeholderTextColor='#696969'
              autoCapitalize='none'
              onChangeText={text => this.setState({listAlert: {
                visible: true,
                quantity: text,
                current_quantity: this.state.listAlert.current_quantity,
                food_name: this.state.listAlert.food_name,
                food_id: this.state.listAlert.food_id,
                add_to_existing: this.state.listAlert.add_to_existing,
                unlisted: this.state.listAlert.unlisted,
              }})}
              defaultValue={"1"} />
            {!this.state.shoppingList.find(item => {
              if (!item.unlisted_food) return item.food.food_name === this.state.listAlert.food_name
              return item.unlisted_food === this.state.listAlert.food_name
            }) ? 
            (<View></View>) : 
            (<Dialog.Switch
              label={`Do you want to add this onto existing ${this.state.listAlert.food_name} (${this.state.listAlert.current_quantity}) in your shopping list`}
              value={this.state.listAlert.add_to_existing}
              onValueChange={() => { 
                this.setState({ listAlert: {
                  visible: true,
                  quantity: this.state.listAlert.quantity,
                  current_quantity: this.state.listAlert.current_quantity,
                  food_name: this.state.listAlert.food_name,
                  food_id: this.state.listAlert.food_id,
                  add_to_existing: !this.state.listAlert.add_to_existing,
                  unlisted: this.state.listAlert.unlisted,
                } }) }}
            />)}
            <Dialog.Button disabled={this.state.updateLoading} label="Cancel" onPress={() => { 
              this.setState({ listAlert: {
                visible: false,
                quantity: '',
                current_quantity: 0,
                food_name: '',
                food_id: '',
                add_to_existing: true,
                unlisted: false,
              } })}} />
            <Dialog.Button disabled={this.state.updateLoading} label="Add" onPress={this.addToShoppingList} />
          </Dialog.Container>
    </View>
    );
  }
}