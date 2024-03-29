import { defineConfig } from 'cypress'
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  env: {
    TEST_USER_LOGIN: process.env.TEST_USER_LOGIN,
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD
  },
  e2e: {
    setupNodeEvents(on, config) { },
    baseUrl: "http://localhost:3000"
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})