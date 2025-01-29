const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

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
    phone: Joi.string()
      .min(10)
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    address: Joi.object().required(),
    memberShipType: Joi.string().valid("STUDENT", "REGULAR").required(),
    status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED").required(),
    classRoom: Joi.string().allow(null, "").optional(),
    cardNo: Joi.string().allow(null, "").optional(),
    joinedAt: Joi.date().iso().required(),
    password: passwordComplexity(complexityOptions),
  });

  return memberSchema.validate(member);
}

module.exports = validate;
