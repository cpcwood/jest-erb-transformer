// e2e
// ========================

test('e2e - general', () => {
  const testModule = require('./helloWorld.js.erb')
  expect(testModule.hello).toEqual("world")
})