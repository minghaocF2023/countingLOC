let isTest = false;
const setTestMode = (mode) => {
  isTest = mode;
};
const getTestMode = () => isTest;
export { setTestMode, getTestMode };
