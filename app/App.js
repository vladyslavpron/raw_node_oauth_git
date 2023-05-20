import * as http from "node:http";
import AppError from "../utils/AppError.js";
import responseFeatures from "./responseFeatures.js";
import requestFeatures from "./requestFeatures.js";

class App {
  constructor(options) {
    this._endpoints = [];
    this._serverOptions = options;
  }

  static createRouter() {
    return {
      _endpoints: [],
      addEndpoint: this.prototype.addEndpoint,
    };
  }

  mountRouter(router) {
    router._endpoints.forEach((endpoint) =>
      this.addEndpoint(endpoint.method, endpoint.pathMatch, endpoint.handler)
    );
  }

  addEndpoint(method, pathMatch, handler) {
    const endpoint = { method, pathMatch, handler };
    this._endpoints.push(endpoint);
  }

  _getEndpointHandler(method, path) {
    const endpoint = this._endpoints.find(
      (endpoint) => endpoint.method === method && endpoint.pathMatch.test(path)
    );
    if (!endpoint) {
      return;
    }
    return endpoint.handler;
  }

  _requestHandler(req, res) {
    try {
      Object.assign(req, requestFeatures);
      Object.assign(res, responseFeatures);

      const endpointHandler = this._getEndpointHandler(req.method, req.url);

      if (!endpointHandler) {
        throw new AppError("Not found", 404);
      }

      endpointHandler(req, res);
    } catch (err) {
      if (err instanceof AppError) {
        return this.appErrorHandler(err, req, res);
      }
      return this.unexpectedErrorHandler(err, req, res);
    }
  }

  appErrorHandler(err, req, res) {
    res.statusCode = err.statusCode;
    res.json({ error: err.message });
    res.end();
  }

  unexpectedErrorHandler(err, req, res) {
    console.log(err);
    res.statusCode = 500;
    res.json({ error: "Unknown error occured" });
    res.end();
  }

  listen(port) {
    this._server = http.createServer(
      this._serverOptions,
      this._requestHandler.bind(this)
    );
    this._server.listen(port);
  }
}

export default App;
