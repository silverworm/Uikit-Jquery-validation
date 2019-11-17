
UiKitValidation = {
  formId : '',
  validStatus : true,
  submit : true,
  data : {},
  validateConditions : {
    email : ['email','required'],
    phone : ['phone','required'],
    required : ['required'],
  },
  errorsMessages : {

  },
  validate : function(formId,dataConf=false){
    let self = this;
    if(dataConf){
      if(dataConf.requiredFields){
        this.validateConditions = dataConf.requiredFields;
      }
      if(dataConf.errorsMessages){
        this.errorsMessages = dataConf.errorsMessages;
      }
      if(typeof dataConf.submitAfterValidate !== 'undefined'){
        this.submit = dataConf.submitAfterValidate;
      }
    }

    this.formId = formId;
    let currentForm = $(this.formId);
    currentForm.on('submit',function(event){
      let status = self.validateForm(currentForm)
      return status;
    });

    if(!currentForm.find('button[type="submit"]').length){
      currentForm.find('.submit').on('click', function(){
        let status = self.validateForm(currentForm)
        return status;
      })
    }

    currentForm.find('input,textarea,select,.validate').on('change', function(){
      let currElement = self.sortByGroups(this);
      self.removeStatusGroup(currElement);
    });
    // this.validateForm(currentForm);
  },
  getValueField : function(field){
    let currentField = $(field[2]);
    let typeField = currentField.prop('nodeName').toLowerCase();
    let fieldName = currentField.attr('name');
    let dataValidate = currentField.data('validate');
    let fieldValue = '';
    if(typeField == 'input' || typeField == 'textarea' || typeField == 'select'){
      if(field[0] == 'radio'){
        fieldValue = $('input[name="'+field[1]+'"]:checked').val()
      }else if(field[0] == 'checkbox'){
        fieldValue = currentField.prop('checked');
      }else{
        fieldValue = currentField.val();
      }
    }else if(dataValidate == 'checboxGroup'){
      let croupVal = [];
      $(currentField).find('input').each(function(i,e){
        if($(e).prop('checked')){
          croupVal.push($(e).prop('checked'));
        }
      });
      fieldValue = croupVal.length;
      // console.log($(currentField).find('input'));
    }else{
      fieldValue = currentField.text();
    }
    return fieldValue;
  },
  checkFieldValid : function(value,type){
    let validStatus = true;
    let required = true;
    let message = 'required';
    let self = this;
    if(this.validateConditions[type] && this.validateConditions[type].length){
      $.each(this.validateConditions[type],function(key,method){
        if(self['validate_'+method]){
          if(method == 'required'){
            required = self['validate_'+method](value);
          }else{
            if(!self['validate_'+method](value)){
              validStatus = false;
              if(required){
                message = method;
              }
            }
          }
        }
      });
    }else{
      return ['noValidate'];
    }
    if(required == true && !value){
      return ['noValidate'];
    }
    return [(validStatus && required),message];
  },
  validateForm : function(form){
    this.validStatus = true;
    let self = this;
    let fieldsForm = form.find('input:visible,textarea:visible,select:visible,.validate:visible');
    let groupsForm = {};
    let currentRadioGroup;
    fieldsForm.each(function(i,e){
      let currentElement = self.sortByGroups(e);
      if(currentElement[0] == 'radio'){
        if(currentElement[1] != currentRadioGroup){
          groupsForm[currentElement[1]] = currentElement;
        }
      }else if(currentElement[2][0].tagName.toLowerCase() == 'select'){
        groupsForm[currentElement[1]] = currentElement;
      }else if(currentElement[2][0].tagName.toLowerCase() == 'checboxgroup'){
        groupsForm[currentElement[1]] = currentElement;
      }else{
        groupsForm[currentElement[1]] = currentElement;
      }
    });

    $.each(groupsForm,function(i,e){
      let field_value = self.getValueField(e);
      fieldSttatusValidation = self.checkFieldValid(field_value,e[1]);
      self.showStatus(fieldSttatusValidation[0],e,fieldSttatusValidation[1]);
      if(!fieldSttatusValidation[0]){
        self.validStatus = false;
      }else{
        self.data[i] = field_value;
      }
    });
    //status_validation
    if(this.submit){
      return this.validStatus;
    }else{
      return false;
    }
  },
  sortByGroups : function(element){
    let elementType = $(element).attr('type');
    let thisElement = $(element);
    let curElement = [];
    if(elementType && thisElement.attr('name')){
      let elementName = thisElement.attr('name');
      curElement = [elementType,elementName,thisElement];
    }else{
      let validateType = $(element).data('validate');
      if($(element).prop('nodeName').toLowerCase() == 'select'){
        curElement = ['select',validateType,thisElement];
      }else if(validateType == 'checboxGroup'){
        curElement = ['checboxGroup',validateType,thisElement];
      }else{
        curElement = ['text',validateType,thisElement];
      }
    }
    return curElement;
  },
  validate_phone : function(value){
    const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,9})$/;
    return regex.test(value);
  },
  validate_required : function(value){
    if(value){
      return true;
    }
    return false;
  },
  validate_email : function(value){
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(value).toLowerCase());
  },
  validate_minLength : function(value,length){
    if(value && value.length > length){
      return true;
    }
    return false;
  },
  validate_maxLength : function(value,length){
    if(value && value.length < length){
      return true;
    }
    return false;
  },validate_int : function(value,length){
    if(value && (+value)){
      return true;
    }
    return false;
  },
  showStatus : function(status,object,messageId){
    let statusObj = '';
    let objEvent = {};
    if(object[0] == "radio"){
      statusObj = $('[name="'+object[1]+'"]');
    }else{
      statusObj = $(object[2]);
    }
    if(status == true){
      statusObj.addClass('uk-form-success').removeClass('uk-form-danger');
      objEvent = statusObj.parent();
      if(object[0] == "radio"){
        statusObj.parent().addClass('uk-form-success').removeClass('uk-form-danger');
      }else if(object[0] == "checboxGroup"){
        statusObj.addClass('uk-form-success').removeClass('uk-form-danger');
        objEvent = statusObj;
      }else if(object[0] == "checkbox"){
        statusObj.parent().addClass('uk-form-success').removeClass('uk-form-danger');
      }else{
        objEvent = statusObj;
        statusObj.parent().find('label').addClass('uk-form-success').removeClass('uk-form-danger');
      }
      this.removeErrorMessage(objEvent)
    }else if(status == 'noValidate'){
      // console.log('noValidate');
    }else{
      statusObj.addClass('uk-form-danger').removeClass('uk-form-success');
      objEvent = statusObj.parent();
      if(object[0] == "radio"){
        statusObj.parent().addClass('uk-form-danger').removeClass('uk-form-success');
      }else if(object[0] == "checboxGroup"){
        statusObj.addClass('uk-form-danger').removeClass('uk-form-success');
        objEvent = statusObj;
      }else if(object[0] == "checkbox"){
        statusObj.parent().addClass('uk-form-danger').removeClass('uk-form-success');
      }else{
        objEvent = statusObj;
        statusObj.parent().find('label').addClass('uk-form-danger').removeClass('uk-form-success');
      }
      this.addErrorMessage(object[1],objEvent,messageId);
    }

  },
  checkStatus : function(){
    let currentForm = $(this.formId);
    this.validateForm(currentForm);
    return this.validStatus;
  },
  removeStatusGroup : function(element){
    let self = this;
    let field_value = self.getValueField(element);
    fieldSttatusValidation = self.checkFieldValid(field_value,element[1]);
    self.showStatus(fieldSttatusValidation[0],element,fieldSttatusValidation[1]);
  },
  addErrorMessage : function(fieldName,objEvent,message){
    objEvent.parent().find('.errorMessage').remove();
    if(this.errorsMessages[fieldName] && typeof this.errorsMessages[fieldName] == 'string' ){
      objEvent.parent().prepend( '<div class="errorMessage uk-form-danger">'+this.errorsMessages[fieldName]+'</div>' );
    }else if(this.errorsMessages[fieldName] && this.errorsMessages[fieldName][message]){
      objEvent.parent().prepend( '<div class="errorMessage uk-form-danger">'+this.errorsMessages[fieldName][message]+'</div>' );
    }
  },
  removeErrorMessage : function(objEvent){
    objEvent.parent().find('.errorMessage').remove();
  },
  formData : function(){
    return this.data;
  },
  setStatusError : function(field_name,errorMessage){
    let objEvent = $('[name="'+field_name+'"]');
    let currElement = this.sortByGroups(objEvent);
    this.showStatus(false,currElement);
    objEvent.parent().prepend( '<div class="errorMessage uk-form-danger">'+errorMessage+'</div>' );
  }
}
