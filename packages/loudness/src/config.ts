import dotenv from "dotenv";
dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || "development",

  get sentry() {
    return {
      dsn:  ['production', 'staging'].includes(process.env.NODE_ENV) ?
        'https://ca5bc73ca8474187836f174864ecd3a1@sentry.adm.gmab.net.dr.dk/10' : '',
      environment: config.environment,
      release: process.env.CI_COMMIT_SHA || ''
    }
  },

}
