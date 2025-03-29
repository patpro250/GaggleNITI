const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const JoiDateTime = Joi.extend((joi) => ({
  type: "dateTime",
  base: joi.string(),
  messages: {
    "dateTime.base": "Value must be a valid ISO 8601 DateTime string",
  },
  validate(value, helpers) {
    const isoDateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/;

    if (!isoDateTimeRegex.test(value)) {
      return {
        value,
        errors: helpers.error("dateTime.base"),
      };
    }
  },
}));

const complexityOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4,
};

function validate(member) {
  const memberSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    dateOfBirth: JoiDateTime.dateTime().required(),
    phone: Joi.string()
      .min(10)
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    address: Joi.object().required(),
    memberShipType: Joi.string()
      .valid(
        "STUDENT",
        "REGULAR",
        "SENIOR",
        "PREMIUM",
        "TEMPORARY",
        "LIFETIME",
        "FAMILY",
        "CORPORATE",
        "VIP"
      )
      .required(),
    profile: Joi.string().uri(),
    password: passwordComplexity(complexityOptions).required(),
    gender: Joi.string().valid("M", "F", "O").required(),
  });

  return memberSchema.validate(member);
}

function validatePassword(password) {
  const schema = Joi.object({
    oldPassword: passwordComplexity(complexityOptions),
    newPassword: passwordComplexity(complexityOptions),
  });
  return schema.validate(password);
}

module.exports = { validate, validatePassword, complexityOptions };
