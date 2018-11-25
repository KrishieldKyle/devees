const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatepostInput(data) {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';

    if (!Validator.isLength(data.text, { mind: 10, max: 500 })) {
        errors.text = "Post must have atleast 10 characters";
    }

    if (Validator.isEmpty(data.text)) {
        errors.text = "Post field is Required";
    }

    return {
        errors,
        isValid: isEmpty(errors)

    }
}