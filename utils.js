const card_types = require("./card_type");

class Utils {
  constructor(req) {
    this.req = req;
  }
  async getReqData() {
    const req = this.req;
    return new Promise((resolve, reject) => {
      try {
        let body = "";
        // listen to data sent by client
        req.on("data", (chunk) => {
          // append the string version to the body
          body += chunk.toString();
        });
        // listen till the end
        req.on("end", () => {
          // send back the data
          resolve(body);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  cleanCardNumber(value) {
    const number = String(value);
    let cleanNumber = "";
    for (var i = 0; i < number.length; i++) {
      if (/^[0-9]+$/.test(number.charAt(i))) {
        cleanNumber += number.charAt(i);
      }
    }
    return cleanNumber;
  }

  formatcardNumber(val) {
    let formatNumber = "";
    const cleanNumber = this.cleanCardNumber(val);
    for (let i = 0; i < cleanNumber.length; i++) {
      if (i == 3 || i == 7 || i == 11) {
        formatNumber = formatNumber + cleanNumber.charAt(i) + " ";
      } else {
        formatNumber += cleanNumber.charAt(i);
      }
    }
    return formatNumber;
  }

  luhn(number) {
    let numberArray = number.split("").reverse();
    for (let i = 0; i < numberArray.length; i++) {
      if (i % 2 != 0) {
        numberArray[i] = numberArray[i] * 2;
        if (numberArray[i] > 9) {
          numberArray[i] =
            parseInt(String(numberArray[i]).charAt(0)) +
            parseInt(String(numberArray[i]).charAt(1));
        }
      }
    }
    let sum = 0;
    for (let i = 1; i < numberArray.length; i++) {
      sum += parseInt(numberArray[i]);
    }
    sum = (sum * 9) % 10;
    if (numberArray[0] == sum) {
      return true;
    } else {
      return false;
    }
  }

  validateCardNumber(data) {
    const { card_number } = data;
    let isCardNumberValid = true;
    let invalidCardNumberMessage = [];
    if (!card_number) {
      isCardNumberValid = false;
      invalidCardNumberMessage.push("card_number is required");
    }
    if (card_number.length < 12) {
      isCardNumberValid = false;
      invalidCardNumberMessage.push(
        "card_number should be at least 12 characters long"
      );
    } else {
      const cleanNumber = this.cleanCardNumber(card_number);
      isCardNumberValid = this.luhn(cleanNumber);
      !isCardNumberValid &&
        invalidCardNumberMessage.push("card_number is invalid");
    }

    return { isCardNumberValid, invalidCardNumberMessage };
  }

  getCardType(number) {
    let cardType = "";
    //test the number against each of the card types and regular expressions
    for (let i = 0; i < card_types.length; i++) {
      if (number.match(card_types[i].pattern)) {
        //if a match is found put the card type
        cardType = card_types[i].name;
      }
    }
    return cardType;
  }

  validateCVV(data) {
    const { cvv } = data;
    let isCardCvvValid = true;
    let invalidCardCvvMessage = [];
    if (!cvv) {
      isCardCvvValid = false;
      invalidCardCvvMessage.push("cvv is required");
    }
    // regex for valid cvv, accepts number between 0 and 9 and length of 3 or 4
    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(String(cvv))) {
      isCardCvvValid = false;
      invalidCardCvvMessage.push("cvv is invalid");
    }
    return { isCardCvvValid, invalidCardCvvMessage };
  }

  validateMonth(data) {
    const { exp_year, exp_month } = data;
    let isMonthValid = true;
    const errorMsg = [];
    const value = String(exp_month);
    if (!value) {
      isMonthValid = false;
      errorMsg.push("expiry month is required");
    }
    if (!(value.length === 2)) {
      isMonthValid = false;
      errorMsg.push(
        `Expiry month can not be more than two characters. e.g ${`10`}, ${`05`}, ${`06`}`
      );
    }
    if (!/^[0-9]*$/.test(value)) {
      isMonthValid = false;
      errorMsg.push("Expiry month can only contain numbers");
    }
    const exp_month_int = parseInt(value, 10);
    const exp_year_int = parseInt(exp_year, 10);
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    if (
      exp_month_int < 0 ||
      exp_month_int > 12 ||
      exp_month_int < month ||
      (exp_month_int === month && exp_year_int <= year)
    ) {
      isMonthValid = false;
      errorMsg.push("Expired card");
    }

    return { isMonthValid, errorMsg };
  }

  validateYear(data) {
    const { exp_year, exp_month } = data;
    let isYearValid = true;
    let yearErrorMsg = [];
    const value = String(exp_year);
    if (!value) {
      isYearValid = false;
      yearErrorMsg.push("expiry year is required");
    }
    if (!(value.length === 4)) {
      isYearValid = false;
      yearErrorMsg.push(
        `Expiry year can contain only 4 characters. e.g ${`2023`}, ${`2025`} `
      );
    }
    if (!/^[0-9]*$/.test(value)) {
      isYearValid = false;
      yearErrorMsg.push("Expiry year can only contain numbers");
    }
    const exp_year_int = parseInt(value, 10);
    const exp_month_int = parseInt(exp_month, 10);
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    if (
      exp_year_int < year ||
      (exp_year_int === year && exp_month_int <= month)
    ) {
      isYearValid = false;
      yearErrorMsg.push("Expired card");
    }
    return { isYearValid, yearErrorMsg };
  }

  validateMail(data) {
    let isValidMail = true;
    const invalidMailMsg = [];
    const { email } = data;
    if (!email) {
      isValidMail = false;
      invalidMailMsg.push("Email is required");
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      isValidMail = false;
      invalidMailMsg.push("Email is invalid");
    }

    return { isValidMail, invalidMailMsg };
  }

  validateCard(data) {
    let isCardValid = true;
    const errorFields = [];
    const newData = {};
    // card number validation
    const { isCardNumberValid, invalidCardNumberMessage } =
      this.validateCardNumber(data);
    if (!isCardNumberValid) {
      isCardValid = false;
      errorFields.push({ card_number: invalidCardNumberMessage });
    }

    // card cvv validation
    const { isCardCvvValid, invalidCardCvvMessage } = this.validateCVV(data);
    if (!isCardCvvValid) {
      isCardValid = false;
      errorFields.push({ cvv: invalidCardCvvMessage });
    }

    // card expiry month vaidation
    const { isMonthValid, errorMsg } = this.validateMonth(data);
    if (!isMonthValid) {
      isCardValid = false;
      errorFields.push({ exp_month: errorMsg });
    }

    // card expiry year validation
    const { isYearValid, yearErrorMsg } = this.validateYear(data);
    if (!isYearValid) {
      isCardValid = false;
      errorFields.push({ exp_year: yearErrorMsg });
    }

    // email validation
    const { isValidMail, invalidMailMsg } = this.validateMail(data);
    if (!isValidMail) {
      isCardValid = false;
      errorFields.push({ email: invalidMailMsg });
    }

    newData["card_number"] = this.formatcardNumber(data.card_number);
    newData["card_type"] = this.getCardType(data.card_number);
    newData["cvv"] = data.cvv;
    newData["card_exp_date"] = data.exp_month + "/" + data.exp_year.slice(2);
    newData["email"] = data.email;

    return { isCardValid, errorFields, newData: isCardValid ? newData : "" };
  }
}

module.exports = Utils;
