const users = [];

const addUser = (id, username, room) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // clean data
  if (!username || !room) {
    return { error: "username and room are required" };
  }

  //validate data
  const existinguser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existinguser) {
    return { error: "username is already taken" };
  }

  const user = { id, username, room };

  users.push(user);
  return user;
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersByRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersByRoom };
