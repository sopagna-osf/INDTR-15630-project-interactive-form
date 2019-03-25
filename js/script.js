'use strict';

/**
 * Validate and disable the activities that in compete the others
 */
function validateActivitiesAvailability() {
    const $activityContainer = $('.activities');
    const $checkedCheckboxes = $activityContainer.find(':checkbox:checked');
    const $uncheckedCheckboxes = $activityContainer.find(':checkbox:not(:checked)');
    const regExp = /^(.+)(\s—{1}\s)((\w+)\s?(\d+)(am|pm)-(\d+)(am|pm)(.*))?\$(\d+)$/ig;
    const convertTo24Hour = (hour, meridiem) => {
        if (!hour || !meridiem) {
            return null;
        }

        return meridiem == 'pm' && hour != 12 ? parseInt(hour) + 12 : parseInt(hour);
    };

    $activityContainer.find(':checkbox').prop('disabled', false);
    $activityContainer.find('.unavailable').remove();
    $checkedCheckboxes.each((index, checkbox) => {
        const $selectedCheckbox = $(checkbox);
        let labelText = ($selectedCheckbox.parent().text() || '').trim()
        let match = regExp.exec(labelText);
        let selectedDay;
        let selectedStartTime;
        let selectedEndTime;

        if (match) {
            selectedDay = match[4];
            selectedStartTime = convertTo24Hour(match[5], match[6]);
            selectedEndTime = convertTo24Hour(match[7], match[8]);
        }

        regExp.lastIndex = 0;
        if (selectedDay && selectedStartTime && selectedEndTime) {
            $uncheckedCheckboxes.each((index, checkbox) => {
                const $checkbox = $(checkbox);
                const $label = $checkbox.parent();
                labelText = ($label.text() || '').trim();

                if (match = regExp.exec(labelText)) {
                    const day = match[4];
                    const startTime = convertTo24Hour(match[5], match[6]);
                    const endTime = convertTo24Hour(match[7], match[8]);

                    if (day && startTime && endTime && selectedDay == day && selectedStartTime < endTime && selectedEndTime > startTime) {
                        $checkbox.prop('disabled', true);
                        $label.append('<small class="unavailable error-text"> (unavaiable)</small>');
                    }
                }

                regExp.lastIndex = 0;
            });
        }
    });
}

/**
 * Check if the value exists
 * 
 * @param {String} value 
 * @returns {Boolean}
 */
function isRequired(value) {
    return /^.+$/.test(value || '');
}

/**
 * Check if the value is a valid email format
 * 
 * @param {String} value
 * @returns {Boolean}
 */
function isValidEmail(value) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
}

/**
 * Check if the value is a valid credit card number
 * 
 * @param {String} value 
 * @returns {Boolean}
 */
function isValidCreditCardNumber(value) {
    return /^\d{13,16}$/.test(value);
}

/**
 * Check if the value is a valid zip code
 * 
 * @param {String} value 
 * @returns {Boolean}
 */
function isValidZipCode(value) {
    return /^\d{5}$/.test(value);
}

/**
 * Check if the value is a valid CVV code
 * 
 * @param {String} value 
 * @returns {Boolean}
 */
function isValidCVVCode(value) {
    return /^\d{3}$/.test(value);
}

/**
 * Set error style and text
 * 
 * @param {String|Object} element 
 * @param {String} errorText 
 */
function setValidationError(element, errorText) {
    const $element = $(element);
    const tagName = $element.prop('tagName');
    const $errorText = $(`<small class="error-text invalid">${errorText}</small>`);

    if (tagName === 'INPUT' || tagName === 'SELECT') {
        $element.addClass('invalid');
        $errorText.insertAfter($element);
    } else {
        $element.append($errorText);
    }
}

/**
 * Remove error style and text
 * 
 * @param {String|Object} element
 */
function removeValidationError(element) {
    const $element = $(element);
    const tagName = $element.prop('tagName');

    if (tagName === 'INPUT' || tagName === 'SELECT') {
        $element.removeClass('invalid');
        $element.next('.error-text.invalid').remove();
    } else {
        $element.find('.error-text.invalid').remove();
    }
}

/**
 * Validate form
 * 
 * @param {String|Object} form Form to be validated
 * @param {Object} option Validation option
 * @returns {Boolean}
 */
function validateForm(form, option) {
    const $form = $(form);
    const fieldData = $form.serializeArray();
    let isFormValid = true;
    option = $.extend(true, {}, option);

    for (let i in fieldData) {
        const name = fieldData[i].name;
        const value = fieldData[i].value;
        const fieldOption = option[name];

        if (fieldOption && 
            (fieldOption['when'] === undefined || (typeof fieldOption['when'] === 'function' && fieldOption['when']() === true))) {
            delete fieldOption['when'];
            removeValidationError(`[name=${name}]`);

            for (let key in fieldOption) {
                let isValid = window[key](value);

                if (!isValid) {
                    setValidationError(`[name=${name}]`, fieldOption[key]);
                    isFormValid = !isFormValid ? isFormValid : isValid;
                    break;
                }
            }
        }
    }

    return isFormValid;
}

$(function() {
    const $otherTitleInput = $('#other-title');
    const $titleSelect = $('#title');
    const $designSelect = $('#design');
    const $colorSelect = $('#color');
    const $activityContainer = $('.activities');
    const $payment = $('#payment');
    const validationOption = {
        'user_name': {
            'isRequired': 'Please enter you name'
        },
        'user_email': {
            'isRequired': 'Please enter you email',
            'isValidEmail': 'Please enter a valid email address'
        },
        'user_cc-num': {
            'isRequired': 'Please enter a credit card number',
            'isValidCreditCardNumber': 'Please enter a number that is between 13 and 16 digits long',
            'when': () => $payment.val().trim() === 'credit card'
        },
        'user_zip': {
            'isRequired': 'Please enter a zip code',
            'isValidZipCode': 'Please enter a 5 digits number',
            'when': () => $payment.val().trim() === 'credit card'
        },
        'user_cvv': {
            'isRequired': 'Please enter a CVV',
            'isValidCVVCode': 'Please enter a 3 digits number',
            'when': () => $payment.val().trim() === 'credit card'
        }
    };

    $('#name').focus();
    $otherTitleInput.hide();
    $payment.val('credit card');
    $payment.find('option[value=select_method]').prop('disabled', true);

    $titleSelect.on('change', e => {
        if ($titleSelect.val() === 'other') {
            $otherTitleInput.show();
        } else {
            $otherTitleInput.hide();
        }
    });

    $designSelect.on('change', e => {
        const $colorContainer = $('#colors-js-puns');
        const design = $designSelect.find('option:selected').attr('value');
        const designText = $designSelect.find('option:selected').text().replace('Theme - ', '');
        const regExp = new RegExp(designText, 'ig');

        if (!design) {
            $colorSelect.find('option').hide();
            $colorSelect.append('<option value="">Please select a T-shirt theme</option>');
            $colorSelect.val('');
            $colorContainer.hide();
        } else {
            $colorContainer.show();
            $colorSelect.find('option[value=""]').remove();
            $colorSelect.find('option').show();

            let firstValue;
            $colorSelect.find('option').each((index, option) => {
                let $option = $(option);
                let optionText = $option.text();

                if (regExp.test(optionText)) {
                    $option.show();
                    firstValue = firstValue ? firstValue : $option.attr('value');
                }
                else {
                    $option.hide();
                }

                regExp.lastIndex = 0;
            });

            $colorSelect.val(firstValue);
        }
    });

    $activityContainer.on('change', ':checkbox', e => {
        const regExp = /^(.+)(\s—{1}\s)((\w+)\s?(\d+)(am|pm)-(\d+)(am|pm)(.*))?\$(\d+)$/ig;

        // Calculate total cost
        let totalCost = 0;
        $activityContainer.find(':checkbox:checked').each((index, checkbox) => {
            const labelText = ($(checkbox).parent().text() || '').trim();
            const match = regExp.exec(labelText);
            
            if (match && match[10]) {
                totalCost += parseFloat(match[10]);
            }
            
            regExp.lastIndex = 0;
        });

        $activityContainer.find('.total-cost').remove();
        if (totalCost > 0) {
            $activityContainer.append(`<p class="total-cost">Total: ${totalCost}</p>`);
        }

        removeValidationError($activityContainer);
        validateActivitiesAvailability();
    });

    $payment.on('change', e => {
        const paymentType = $(e.target).val();
        const $creditCartInformation = $('#credit-card');
        const $paypalInformation = $creditCartInformation.next();
        const $bitcoinInformation = $paypalInformation.next();

        if (paymentType === 'credit card') {
            $creditCartInformation.show();
            $paypalInformation.hide();
            $bitcoinInformation.hide();
        } else if (paymentType === 'paypal') {
            $paypalInformation.show();
            $creditCartInformation.hide();
            $bitcoinInformation.hide();
        } else if (paymentType === 'bitcoin') {
            $bitcoinInformation.show();
            $creditCartInformation.hide();
            $paypalInformation.hide();
        }
    });

    $('button[type=submit').on('click', e => {
        const $form = $('form');
        const hasActivities = $activityContainer.find(':checkbox:checked').length > 0;

        removeValidationError($activityContainer);
        if (!hasActivities) {
            setValidationError($activityContainer, 'Please select at least one activity');
        }

        if (!validateForm($form, validationOption) || !hasActivities) {
            e.preventDefault();
        }
    });

    // Real-time validation
    $('form').on('keyup', 'input', e => {
        const option = {};
        const name = $(e.target).attr('name');
        option[name] = validationOption[name] || {};
        validateForm('form', option);
    });

    $designSelect.trigger('change');
    $payment.trigger('change');
});
