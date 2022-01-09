export type foodItemType = {
    food_id: string
    food_name: string
    default_days_to_exp: number | undefined
    food_group: {
        food_group_id: string
        image: string
    }
}

export type fridgeItemType = {
    id: number
    user: string
    food: {
      food_id: string
      food_name: string
      food_group: {
        food_group_id: string
        image: string
      }
    }
    quantity: number
    unlisted_food: string | undefined
    expiration_date: Date | undefined
}

export type shoppingListItemType = {
    id: number
    order_index: number
    user: string
    food: {
        food_id: string
        food_name: string
        food_group: {
          food_group_id: string
          image: string | undefined
        }
    }
    quantity: number
    unlisted_food: string | undefined
}

export type recipeType = {
    recipe_id: string
    recipe_name: string
    image: string
    diets: Array<{
      diet_id: number
      diet: string
    }>
    cuisine: {
      cuisine_id: number
      cuisine: string
    }
    meal_type: {
      meal_type_id: number
      meal_type: string
    }
  }

export type ingredientType = {
    description: string
    food: {
        food_id: string
        food_name: string
    }
    unlisted_food: string | undefined
}

export type recipeEntireType = {
    recipe_id: string
    recipe_name: string
    owner: string
    private: boolean
    image: string
    diets: Array<{
        diet_id: number
        diet: string
    }>
    cuisine: {
        cuisine_id: number
        cuisine: string
    } | undefined
    meal_type: {
        meal_type_id: number
        meal_type: string
    } | undefined
    instructions: string
    description: string
    ingredients: Array<ingredientType>
}

export type createRecipeType = {
  recipe_name: string
  owner: string
  private: boolean
  image: string
  diets: Array<string>
  cuisine: string | undefined
  meal_type: string | undefined
  instructions: string
  description: string
  foods: Array<{
    food: string
    description: string
  }>
}

export type filterObjectType = {
    mealType: Array<string>
    dietaryPreference: Array<string>
    cuisine: Array<string>
}

export type userDataType = {
    user_id: string
    saved_recipes: Array<recipeType>
    username: string
    name: string
    origin_account_date: string
    wasted_count: number
    eaten_count: number
    produce_wasted: number
    meat_wasted: number
    dairy_wasted: number
    total_items: number
    shopping_list: Array<string>
    fridge: Array<string>
  }
