// import publicMessageFactory from './publicMessageModel.js';

let testState = false;
const getTestState = () => testState;
const setIsTest = (isTest) => {
  testState = isTest;
};
const getIsTestState = (req, res) => {
  res.status(200).json({ message: 'OK', isTest: getTestState });
};
const startSpeedTest = (req, res) => {
  const { isTest } = req.body;
  setIsTest(isTest);

  res.status(200).json({ message: 'OK' });
  console.log(`isTest: ${testState}`);
};

export {
  getTestState, setIsTest, startSpeedTest, getIsTestState,
};
