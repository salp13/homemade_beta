# Route Documentation
## Food
## Recipe
## User
### many_users  


### single_user  

### metric_data

### many_fridge
**GET**  
url: 
- user_id
- query params: 
    - value

send:  
- user: UUID   
 
receive:  
- list:
    - food: 
        - food_id: UUID
        - food_name: chars
        - food_group:
            - food_group_id: int
            - image: image file
    - unlisted_food: chars or null
    - expiration_date: datetime.date or null  

**POST**  
send:  
- food: UUID 
- user: UUID 
- unlisted_food: chars (only include if unlisted_food)  
 
receive:  
- id: int
- food: UUID
- user: UUID
- unlisted_food: chars or null
- expiration_date: datetime.date or null  

### single_fridge

### many_shopping_list  

### single_shopping_list  

### many_saved_recipes

### single_saved_recipe