
## Video module

## Shopping Module
- Category
    - Table Column 
        - client_id
        - name
        - photo
        - is_parent
        - parent
        - added_by
        - is_active

- Product 
    - Table Column
        - client_id
        - name
        - description
        - images []
        - stock
        - size 
        - condition // default new hot
        - is_active // true/false
        - price
        - discount
        - is_featured
        - cat_id
        - child_cat_id
        - brand
        

- CartTable
    - Table Column
        - uuid // primary
        - user_id // range   
        - product_id
        - quantity

- CouponTable
    - Coupon Column
        - client_id // primary
        - code // range   
        - type ['fixed','percent']
        - value
        - status


{
   "client_id":"1234",
   "code":"NY002",
   "type":"fixed", //fixed percentage
   "value": 10, //
   "user_limit":0, //0 means unlimited
   "max_discount":100, // maximum discount for given coupon code
   "valid_till":"2021/01/28"
}