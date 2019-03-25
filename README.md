## Unit 3 - Interactive Form
This project is about enhancing the registration form with form validation, and displaying additional or required information to the user only when needed.

**Note:** All text input fields have real-time validation.

For Developers
---
**Validating the form**

Use this method to validate the form
`validateForm(form, option)`

 - form: any form selector for creating jquery object, it can be string or jquery object
 - option: validation object, indicate how the form fields is validated and what message to show when they're invalid.
	 ```
	 const option = {
		 'fieldName': {
			'validatioMethod': 'errorText',
			['when': ()=>{}]
		 }
	 }
	```
	- **fieldName:** the name of the input field in the validation form
	- **validationMethod:** the name of the validation method for validating the form field value
		- **Available methods:**
			- `isRequired(value)` Check whether the value is empty or not
			- `isValidEmail(value)` Check whether the value is a valid email address
			- `isValidCreditCardNumber(value)` Check whether the value is a valid credit card number
			- `isValidZipCode(value)` Check whether the value is a valid zip code
			- `isValidCVVCode(value)` Check whether the value is a valid CVV code
	- **errorText:** the error message when the form field value is invalid
	- **when:** an optional property with a callback function which return **true/false** to indicate the form field should be validated or not. (default is **true**)

**Set/Remove validation error**

- Set the validation error
`setValidationError(element, errorText)`

- Remove validation error
`removeValidationError(element)`

	- **element:** any selector for element that need to set/remove the validation error
	- **errorText:** the error message to show
