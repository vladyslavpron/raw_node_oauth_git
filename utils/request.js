import * as https from "node:https";

async function request({ method, url, params, body, headers }) {
  const query = mapQuery(params);

  return new Promise((resolve, reject) => {
    const req = https.request(url + query, { headers, method }, (res) => {
      let data = "";

      res.setEncoding("utf8");

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.headers["content-type"].includes("application/json")) {
          data = JSON.parse(data);
        }
        res.data = data;
      });

      res.on("close", () => {
        resolve(res);
      });
    });

    if (body) {
      const data = typeof body === "object" ? JSON.stringify(body) : body;
      req.write(data);
    }

    req.end();
  });
}

function mapQuery(params) {
  if (!params || typeof params !== "object") {
    return "";
  }
  const mapped = Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  return "?" + mapped;
}

export default request;
