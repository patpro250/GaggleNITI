const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function verify(token) {
  let isValid = jwt.verify(token, process.env.JWT_KEY);
  if (isValid) {
    console.log("Verified");
  } else {
    console.log("Invalid token");
  }
}

verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkYmY4ZDU2LTllN2MtNGZmMy04NTgwLWFlNzYzMTJjNmZmNSIsImVtYWlsIjoiaXJ1bXZhdGVycnlqZXNzeUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUZXJyeSIsImxhc3ROYW1lIjoiSmVzc3kiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3Mzg5OTMxMTB9.hQpqxRvIdLgkIw5TZzQsrfrrSxfSBoIVOpcH2re00n0')