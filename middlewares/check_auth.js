const { clientId } = require("../keys");
const ResponseHandler = require("../utils/response");
const { encrypt, decrypt } = require("../utils/hash");
const bodyObject = (valid, code, message) => {
  return {
    valid,
    code,
    message,
  };
};

class AuthorizeRequest {
  getCredentials(data) {
    return new Promise((resolve, reject) => {
      resolve(Buffer.from(data, "base64").toString("utf-8").split(":"));
    });
  }

  static validateToken(req, res) {
    if (!req.headers.authorization) {
      ResponseHandler.send(
        res,
        412,
        bodyObject(false, 412, "Missing authorization credentials")
      );
      return;
    }
    let token = req.headers.authorization;
    if (token.startsWith("Bearer ")) {
      // remove Bearer from string if it exists
      token = token.split(" ")[1];
    }

    if (!token) {
      ResponseHandler.send(
        res,
        401,
        bodyObject(false, 401, "Invalid authorization token")
      );
      return;
    }

    // encrypt and convert base64 token to string
    const hash = encrypt(token);

    if (decrypt(hash) !== clientId) {
      ResponseHandler.send(
        res,
        401,
        bodyObject(false, 401, "Invalid authorization tokenh")
      );
      return;
    } else {
      return true;
    }
  }
}

module.exports = AuthorizeRequest;
