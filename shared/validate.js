function validateLogin(username, password) {
  if (username.length <= 3) {
    return {username: 'Username is too short. Insert at least 3 characters'};
  }
  if (password.length <= 8) {
    return {password: 'Password is too short. Insert at least 8 characters'};
  }
  if (!/[0-9]/.test(password)) {
    return {password: 'Password is weak. Insert a number'};
  }

  return null;
}

function validateSignup(first_name, last_name, username, email, password) {
  if (first_name < 3) {
    return {first_name: 'First name is too short. Insert at least 3 characters'}
  }
  if (last_name < 3) {
    return {last_name: 'Last name is too short. Insert at least 3 characters'}
  }
  if (username.length < 3) {
    return {username: 'Username is too short. Insert at least 3 characters'};
  }
  if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return {email: 'Email is not valid'}
  }
  if (password.length < 8) {
    return {password: 'Password is too short. Insert at least 8 characters'};
  }
  if (!/[0-9]/.test(password)) {
    return {password: 'Password is weak. Insert a number'};
  }
  
  return null;
}

if (typeof module !== 'undefined') {
  module.exports.validateLogin = validateLogin;
  module.exports.validateSignup = validateSignup;
}