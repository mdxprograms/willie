// phone helper - format phone number 5555555555 => (555) 555-5555
module.exports = num => {
  const phoneNum = num.toString();

  return `(${phoneNum.substr(0, 3)}) ${phoneNum.substr(3, 3)} - ${phoneNum.substr(6, 4)}`;
};
