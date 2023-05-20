const responseFeatures = {};

responseFeatures.redirect = function (url) {
  this.statusCode = 302;
  this.setHeader("location", url);
};

responseFeatures.json = function (json) {
  this.setHeader("Content-Type", "application/json");
  this.write(JSON.stringify(json));
};

export default responseFeatures;
