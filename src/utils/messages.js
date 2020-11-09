const getMessages = (username, msg) => {
  return { username, msg, createdAt: new Date().getTime() };
};

module.exports = { getMessages };
