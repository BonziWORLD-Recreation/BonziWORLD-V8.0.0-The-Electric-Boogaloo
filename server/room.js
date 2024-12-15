class Room {
  constructor(id) {
    this.id = id;
    this.users = {};
  }

  addUser(user) {
    this.users[user.id] = user;
  }

  removeUser(user) {
    delete this.users[user.id];
  }
}

module.exports = Room;
