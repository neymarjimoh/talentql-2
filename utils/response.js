class ResponseHandler {
  static send(res, statusCode, obj) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
  }
}

module.exports = ResponseHandler;
