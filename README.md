# talentql-2
An API to validate payment information and charge amount written in vanilla Node.js without any framework or libraries.

## Getting Started
- git clone and `cd talentql-2`
- Run `node index.js` to start server
- On browser, navigate `http://localhost:5000` or `http://localhost:5000/api/v1` to test base endpoint
- Alternatively, you can test the API endpoints on **postman**

## 🛠 Tools
- Nodejs >= v12.xx 


### How To
- Go to `http://localhost:5000/api/v1/validate-payment` - method: **POST**
#### Sample data
```
{
    "email": "jemohkunle2007@gmail.com",
    "card_number": "5242821213371152",
    "cvv": "123",
    "exp_month": "09",
    "exp_year": "2021",
    "mobile_number": "09070822819",
    "amount": "15"
}
```
#### sample header
```
    {
        Authorization: Bearer *********
    }
 ```
- `touch keys.js` for authorization key

#### Sample Success Response
```
{
    "valid": true,
    "code": 200,
    "data": {
        "card_number": "5242 8212 1337 1152",
        "card_type": "mastercard",
        "cvv": "123",
        "card_exp_date": "09/21",
        "email": "jemohkunle2007@gmail.com",
        "amount": "15",
        "mobile": {
            "mobile_number": "+2349070822819"
        }
    }
}
```

#### Sample Error Response
```
{
    "valid": false,
    "code": 422,
    "message": "Validation error(s): Check the following fields",
    "errorFields": [
        {
            "exp_year": [
                "Expiry year can contain only 4 characters. e.g 2023, 2025 ",
                "Expiry year can only contain numbers",
                "Expired card"
            ]
        }
    ]
}
```



