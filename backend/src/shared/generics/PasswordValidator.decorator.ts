import { buildMessage, ValidateBy, ValidationOptions } from "class-validator";

export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: "isPassword",
      validator: {
        validate: (value): boolean => {
          return isValidPassword(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + "$property must be a valid password",
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

function isValidPassword(password: string) {
  /*
   * https://ihateregex.io/expr/password
   * Minimum eight characters, at least one upper case English letter, one lower case English letter, one number and one special character
   */
  return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(
    password,
  );
}
