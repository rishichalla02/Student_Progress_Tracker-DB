export const getUserKey = (key, email) => {
  return `${key}_${email}`;
};