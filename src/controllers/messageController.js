class MessageController {
  static getAllPublicMessages(_req, res) {
    res.json({ message: 'OK' });
  }

  static getPublicMessageByUsername(_req, res) {
    res.json({ message: 'OK' });
  }

  static createPublicMessage(_req, res) {
    res.send('Message received');
  }
}

module.exports = MessageController;
