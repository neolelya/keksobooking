'use strict';

(function () {
  var MAX_PRICE = 1000000;
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  var MinPrice = {
    BUNGALO: 0,
    FLAT: 1000,
    HOUSE: 5000,
    PALACE: 10000
  };

  var adForm = document.querySelector('.ad-form');
  var addressField = document.querySelector('#address');
  var adTitle = adForm.querySelector('#title');
  var adPrice = adForm.querySelector('#price');
  var adType = adForm.querySelector('#type');
  var adTimeIn = adForm.querySelector('#timein');
  var adTimeOut = adForm.querySelector('#timeout');
  var adRoomNumber = adForm.querySelector('#room_number');
  var adCapacity = adForm.querySelector('#capacity');
  var resetButton = adForm.querySelector('.ad-form__reset');
  var formFilter = document.querySelector('.map__filters');
  var avatarInput = adForm.querySelector('.ad-form__field input[type="file"]');
  var avatarPreview = adForm.querySelector('.ad-form-header__preview img');
  var avatarLabel = adForm.querySelector('.ad-form__field');
  var propertyInput = adForm.querySelector('.ad-form__upload input[type="file"]');
  var propertyPreview = adForm.querySelector('.ad-form__photo');
  var propertyLabel = adForm.querySelector('.ad-form__drop-zone');
  var formFields = adForm.querySelectorAll('fieldset');

  var setFormFieldsDisabled = function (value) {
    formFields.forEach(function (element) {
      element.disabled = value;
    });
  };

  setFormFieldsDisabled(true);

  var inputTitleEditHandler = function () {
    if (adTitle.validity.tooShort) {
      adTitle.setCustomValidity('Заголовок вашего объявления должен содержать минимум из 30 символов');
    } else if (adTitle.validity.tooLong) {
      adTitle.setCustomValidity('Заголовок вашего объявления должен содержать максимум 100 символов');
    } else if (adTitle.validity.valueMissing) {
      adTitle.setCustomValidity('Это поле обязательное для заполнения');
    } else {
      adTitle.setCustomValidity('');
    }
  };

  var setPriceLimitValidity = function () {
    if (adPrice.value < MinPrice[adType.value.toUpperCase()]) {
      adPrice.setCustomValidity('Минимально возможное значение для этого поля - ' + MinPrice[adType.value.toUpperCase()]);
    } else if (adPrice.value > MAX_PRICE) {
      adPrice.setCustomValidity('Максимально возможное значение для этого поля - ' + MAX_PRICE);
    } else {
      adPrice.setCustomValidity('');
    }
  };

  var inputPriceEditHandler = function () {
    if (adPrice.validity.rangeUnderflow) {
      adPrice.setCustomValidity('Цена за данное предложение не может быть ниже ' + (MinPrice[adType.value.toUpperCase()]) + ' рублей за ночь');
    }
  };

  var inputTypeSelectHandler = function () {
    adPrice.min = MinPrice[adType.value.toUpperCase()];
    adPrice.placeholder = window.util.divideNumberByDigits(MinPrice[adType.value.toUpperCase()]);
    setPriceLimitValidity();
  };

  var inputTimeInSelectHandler = function () {
    adTimeOut.value = adTimeIn.value;
  };

  var inputTimeOutSelectHandler = function () {
    adTimeIn.value = adTimeOut.value;
  };

  var limitGuestsNumbers = function () {
    var guests = [0, 1, 2, 3];

    var roomsToGuestsRelation = {
      1: [2],
      2: [2, 1],
      3: [2, 1, 0],
      100: [3]
    };

    adCapacity[roomsToGuestsRelation[adRoomNumber.value][0]].selected = true;

    guests.forEach(function (guest) {
      adCapacity[guest].disabled = !roomsToGuestsRelation[adRoomNumber.value].includes(guest);
    });
  };

  var resetFormData = function () {
    formFilter.reset();
    adForm.reset();
    avatarPreview.src = 'img/muffin-grey.svg';
    propertyPreview.innerHTML = '';
    window.pins.mainPinResetCoordinates();
    adPrice.placeholder = MinPrice.HOUSE;
    deactivate();
    window.map.deactivate();
  };

  var formFocusoutHandler = function (evt) {
    evt.target.classList.remove('invalid');
  };

  var formUploadHandler = function () {
    resetFormData();
    adForm.reset();
    window.message.renderSuccess();
  };

  var formErrorHandler = function (errorMessage) {
    window.message.renderError(errorMessage);
  };

  var formSubmitHandler = function (evt) {
    evt.preventDefault();
    var formData = new FormData(adForm);
    window.backend.upload(formData, formUploadHandler, formErrorHandler);
    var invalidInputs = Array.from(adForm.querySelectorAll('input:invalid, select:invalid, textarea:invalid'));
    invalidInputs.forEach(function (elem) {
      elem.classList.add('invalid');
    });
  };

  var changeInputFile = function (file, image) {
    if (file) {
      var fileName = file.name.toLowerCase();
      var matches = FILE_TYPES.some(function (it) {
        return fileName.endsWith(it);
      });

      if (matches) {
        var reader = new FileReader();

        reader.addEventListener('load', function () {
          image.src = reader.result;
        });
        reader.readAsDataURL(file);
      }
    }
  };

  var preventDropEvent = function (element) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
      element.addEventListener(eventName, function (evt) {
        evt.preventDefault();
      }, false);
    });
  };

  avatarInput.addEventListener('change', function () {
    changeInputFile(avatarInput.files[0], avatarPreview);
  });
  preventDropEvent(avatarLabel);
  avatarLabel.addEventListener('drop', function (evt) {
    changeInputFile(evt.dataTransfer.files[0], avatarPreview);
  });

  propertyInput.addEventListener('change', function () {
    propertyPreview.innerHTML = '<img src="" width="100%" height="100%" alt="Фотография жилья">';
    changeInputFile(propertyInput.files[0], propertyPreview.children[0]);
  });
  preventDropEvent(propertyLabel);
  propertyLabel.addEventListener('drop', function (evt) {
    propertyPreview.innerHTML = '<img src="" width="100%" height="100%" alt="Фотография жилья">';
    changeInputFile(evt.dataTransfer.files[0], propertyPreview.children[0]);
  });

  var activate = function () {
    setFormFieldsDisabled(false);
    adForm.classList.remove('ad-form--disabled');
    adTitle.addEventListener('invalid', inputTitleEditHandler);
    adPrice.addEventListener('input', setPriceLimitValidity);
    adType.addEventListener('change', inputTypeSelectHandler);
    adPrice.addEventListener('invalid', inputPriceEditHandler);
    adTimeIn.addEventListener('change', inputTimeInSelectHandler);
    adTimeOut.addEventListener('change', inputTimeOutSelectHandler);
    limitGuestsNumbers();
    adRoomNumber.addEventListener('change', limitGuestsNumbers);
    adForm.addEventListener('submit', formSubmitHandler);
    adForm.addEventListener('focusout', formFocusoutHandler);
    resetButton.addEventListener('click', resetFormData);
  };

  var deactivate = function () {
    setFormFieldsDisabled(true);
    adForm.classList.add('ad-form--disabled');
    adTitle.removeEventListener('invalid', inputTitleEditHandler);
    adPrice.removeEventListener('input', setPriceLimitValidity);
    adType.removeEventListener('change', inputTypeSelectHandler);
    adPrice.removeEventListener('invalid', inputPriceEditHandler);
    adTimeIn.removeEventListener('change', inputTimeInSelectHandler);
    adTimeOut.removeEventListener('change', inputTimeOutSelectHandler);
    adRoomNumber.removeEventListener('change', limitGuestsNumbers);
    adForm.removeEventListener('submit', formSubmitHandler);
    adForm.removeEventListener('focusout', formFocusoutHandler);
    resetButton.removeEventListener('click', resetFormData);
  };

  var setCoordinates = function (x, y) {
    addressField.value = x + ', ' + y;
    return addressField;
  };

  window.form = {
    activate: activate,

    setCoordinates: setCoordinates
  };
})();
