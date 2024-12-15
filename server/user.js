class User {
  constructor(id, nickname, roomId) {
    this.id = id;
    this.nickname = nickname;
    this.roomId = roomId;
    this.x = Math.random() * 800;
    this.y = Math.random() * 600;
  }
}

module.exports = User;
