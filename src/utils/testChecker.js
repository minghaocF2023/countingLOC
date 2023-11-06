const testChecker = {
  isTest: (res, payload) => {
    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
      return true;
    }
    return false;
  },
};
export default testChecker;
