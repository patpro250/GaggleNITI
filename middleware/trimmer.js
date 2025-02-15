function trimRequestBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = trimStringFields(req.body);
  }
  next();
}

function trimStringFields(data) {
  if (typeof data !== "object" || data === null) return data;

  for (let key in data) {
    if (typeof data[key] === "string") {
      data[key] = data[key].trim();
    } else if (typeof data[key] === "object" && data[key] !== null) {
      data[key] = trimStringFields(data[key]);
    }
  }
  return data;
}

module.exports = trimRequestBody;
