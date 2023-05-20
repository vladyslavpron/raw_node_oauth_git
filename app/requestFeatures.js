import * as querystring from "node:querystring";

const requestFeatures = {};

requestFeatures.getParam = function (name) {
  const params = querystring.parse(this.url.split("?")[1]);
  return params[name];
};
export default requestFeatures;
