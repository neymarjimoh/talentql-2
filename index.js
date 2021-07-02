const http = require("http");
const Utils = require("./utils/card_utils");
const ResponseHandler = require("./utils/response");
const AuthorizeRequest = require("./middlewares/check_auth");
const { PORT } = require("./keys");

const server = http.createServer(async (req, res) => {
  // create an object of utils class
  const utilsClass = new Utils(req);
  // base endpoint '/' or '/api/v1'
  if ((req.url === "/" || req.url === "/api/v1") && req.method === "GET") {
    ResponseHandler.send(res, 200, {
      valid: true,
      code: 200,
      message:
        "Welcome to TalentQl assessment API. Use `/api/v1/validate-payment` for validation",
    });
  }
  // /api/v1/validate-payment : POST
  else if (req.url === "/api/v1/validate-payment" && req.method === "POST") {
    // authenticate the request for auth token
    const isAuth = AuthorizeRequest.validateToken(req, res);
    if (isAuth) {
      // get the data sent along
      let todo_data = await utilsClass.getReqData();
      // do validation
      const { isCardValid, errorFields, newData } = utilsClass.validateCard(
        JSON.parse(todo_data)
      );
      if (!isCardValid) {
        ResponseHandler.send(res, 422, {
          valid: false,
          code: 422,
          message: "Validation error(s): Check the following fields",
          errorFields,
        });
      } else {
        // send data
        ResponseHandler.send(res, 200, { valid: true, code: 200, ...newData });
      }
    }
  } // No route present
  else {
    ResponseHandler.send(res, 404, { message: "Route not found", code: 404 });
  }
});

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
