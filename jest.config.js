module.exports = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest/presets/js-with-ts',
    moduleNameMapper: {
        '@components/(.*)': '<rootDir>/app/_components/$1',
        '@utils/(.*)': '<rootDir>/app/_utils/$1',
        '@lib/(.*)': '<rootDir>/app/_lib/$1',
      },
    transform: {
        "^.+\\.(ts|tsx)?$": "ts-jest",
        "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-react"] }],
      },
      testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
      