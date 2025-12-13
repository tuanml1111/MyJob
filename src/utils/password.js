exports.validatePassword = (password) => {
  // >=8, có hoa, thường, số
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};
