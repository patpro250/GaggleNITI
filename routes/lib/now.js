function now() {
  let now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  };
  now = new Intl.DateTimeFormat("en-US", options).format(now);
  return now;
}

module.exports = now;
