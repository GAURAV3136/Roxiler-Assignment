// Shared validation rules matching the assignment spec:
// Name: Min 20 / Max 60 characters
// Address: Max 400 characters
// Password: 8-16 characters, at least one uppercase letter and one special character
// Email: standard email format

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const validateName = (name) => {
  const trimmed = name?.trim() || "";

  if (trimmed.length < 20 || trimmed.length > 60) {
    return "Name must be between 20 and 60 characters";
  }

  return null;
};

const validateAddress = (address) => {
  const trimmed = address?.trim() || "";

  if (trimmed.length === 0) {
    return "Address is required";
  }

  if (trimmed.length > 400) {
    return "Address must not exceed 400 characters";
  }

  return null;
};

const validateEmail = (email) => {
  if (!emailRegex.test(email?.trim() || "")) {
    return "Enter a valid email address";
  }

  return null;
};

const validatePassword = (password) => {
  if (!passwordRegex.test(password || "")) {
    return "Password must be 8-16 characters and include at least one uppercase letter and one special character";
  }

  return null;
};

module.exports = {
  emailRegex,
  passwordRegex,
  validateName,
  validateAddress,
  validateEmail,
  validatePassword
};
