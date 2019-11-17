// validate form
//all conditions implement for field name (if id or select validated from attr "data-validate") // data-validate='test'
var validate_attorney = Object.create(UiKitValidation);
validate_attorney.validate('#my-form',{
  submitAfterValidate : false,
  requiredFields : {
    'test' : ['required'],
    'test-email' : ['required','email'],
  },
  errorsMessages : {
    'test' : 'error',
    'test-email' : 'error-email',
  }
});

$('#my-form').on('submit',function(){
  if(validate_attorney.checkStatus()){ // CHeck is form validated
    console.log('validated');
  }else{
    console.log('not valid');
  }
});