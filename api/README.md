# Route Documentation
## Food
## Recipe
## User
### many_users  

### single_user ###
**GET**  
url:
- user_pk: UUID  
send: {}  
receive:
- user_id: UUID
- username: chars
- name: chars
- origin_account_date: datetime.date
- total_items: int
- eaten_count: int
- wasted_count: int
- produce_wasted: int
- meat_wasted: int
- dairy_wasted: int
- saved_recipes: 
    - list:
        - ???
- shopping_list:
    - list:
        - ???
- fridge:
    - list of food_ids  
**PATCH**  
url:
- user_pk: UUID  
send (any combination of following):  
- name: chars
receive:  
- user_id: UUID
- username: chars
- name: chars
- origin_account_date: datetime.date
- total_items: int
- eaten_count: int
- wasted_count: int
- produce_wasted: int
- meat_wasted: int
- dairy_wasted: int
- saved_recipes: 
    - list:
        - ???
- shopping_list:
    - list:
        - ???
- fridge:
    - list of food_ids  
**DELETE**
url:
- user_pk: UUID
send: {}  
receive: {}  

### metric_data
**GET**  
url:
- user_pk: UUID
send: {}  
receive:
- user_id: UUID
- username: chars
- name: chars
- origin_account_date: datetime.date
- total_items: int
- eaten_count: int
- wasted_count: int
- produce_wasted: int
- meat_wasted: int
- dairy_wasted: int
- saved_recipes: 
    - list:
        - ???
- shopping_list:
    - list:
        - ???
- fridge:
    - list of food_ids  
**PATCH**  
url:
- user_pk: UUID
send (any combination of following): 
- total_items: int
- eaten_count: int
- wasted_count: int
- produce_wasted: int
- meat_wasted: int
- dairy_wasted: int
receive:
- user_id: UUID
- username: chars
- name: chars
- origin_account_date: datetime.date
- total_items: int
- eaten_count: int
- wasted_count: int
- produce_wasted: int
- meat_wasted: int
- dairy_wasted: int
- saved_recipes: 
    - list:
        - ???
- shopping_list:
    - list:
        - ???
- fridge:
    - list of food_ids

### many_fridge
**GET**  
url: 
- user_pk: UUID
- query params: 
    - value
send: {}  
receive:  
- list:
    - id: int
    - user: UUID
    - food: 
        - food_id: UUID
        - food_name: chars
        - food_group:
            - food_group_id: int
            - image: image file
    - unlisted_food: chars or null
    - expiration_date: datetime.date or null  
**POST**  
url: 
- user_pk: UUID
send:  
- food: UUID 
- unlisted_food: chars (only include if unlisted_food)  
receive:  
- id: int
- food: UUID
- user: UUID
- unlisted_food: chars or null
- expiration_date: datetime.date or null  

### single_fridge
**GET**  
url: 
- user_pk: UUID
- fridge_pk: int
send: {}    
receive:  
- id: int
- user: UUID
- food: 
    - food_id: UUID
    - food_name: chars
    - food_group:
        - food_group_id: int
        - image: image file
- unlisted_food: chars or null
- expiration_date: datetime.date or null  
**PATCH**  
url: 
- user_pk: UUID
- fridge_pk: int
send:  
- expiration_date: datetime.date
receive:  
- id: int
- user: UUID
- food: 
    - food_id: UUID
    - food_name: chars
    - food_group:
        - food_group_id: int
        - image: image file
- unlisted_food: chars or null
- expiration_date: datetime.date or null  
**DELETE**  
url: 
- user_pk: UUID
- fridge_pk: int
send: {}  
receive: {}  

### many_shopping_list
**GET**  
url: 
- user_pk: UUID
- query params: 
    - value
send: {}  
receive:  
- list:
    - id: int
    - user: UUID
    - food: 
        - food_id: UUID
        - food_name: chars
        - food_group:
            - food_group_id: int
            - image: image file
    - unlisted_food: chars or null
**POST**  
url: 
- user_pk: UUID
send:  
- food: UUID 
- unlisted_food: chars (only include if unlisted_food)  
receive:  
- id: int
- food: UUID
- user: UUID
- unlisted_food: chars or null

### single_shopping_list
**GET**  
url: 
- user_pk: UUID
- shopping_list_pk: int
send: {}    
receive:  
- id: int
- user: UUID
- food: 
    - food_id: UUID
    - food_name: chars
    - food_group:
        - food_group_id: int
        - image: image file
- unlisted_food: chars or null
**PATCH**  
url: 
- user_pk: UUID
- shopping_list_pk: int
send:  
- ?
receive:  
- id: int
- user: UUID
- food: 
    - food_id: UUID
    - food_name: chars
    - food_group:
        - food_group_id: int
        - image: image file
- unlisted_food: chars or null
**DELETE**  
url: 
- user_pk: UUID
- shopping_list_pk: int
send: {}  
receive: {}

### many_saved_recipes

### single_saved_recipe
