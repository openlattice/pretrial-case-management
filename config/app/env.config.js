function ifElse(condition) {
  return (isTrue, isFalse) => {
    return condition ? isTrue : isFalse;
  };
}

const BUILD = process.env.BUILD || 'development';

const isDev = BUILD === 'development';
const isProd = BUILD === 'production';
const isTest = BUILD === 'test';

const ifDev = ifElse(isDev);
const ifProd = ifElse(isProd);
const ifTest = ifElse(isTest);

export {
  ifDev,
  ifProd,
  ifTest,
  isDev,
  isProd,
  isTest
};
