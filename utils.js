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
    newData["card_number"] = this.formatcardNumber(data.card_number);
    newData["card-type"] = this.getCardType(data.card_number);
    return { isCardValid, errorFields, newData: isCardValid ? newData : "" };
  }
}

module.exports = Utils;
