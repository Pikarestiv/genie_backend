# Grant: Back-end
### To start server:
```
npm install
npm start
```
## Routes

#### /grant
Return grants after filters.
Optional get params:
```
tags: array of uuid
titile: string
body: string
minPrice: number
maxPrice: number
units: string, type of units paid for
```
#### /grant/:id
Get grant by id.
#### /grant/all/prices
Get max and min price.
#### /grant/all/units
Get all units paid for.
#### /tag_group
Get all tag groups with tags included.