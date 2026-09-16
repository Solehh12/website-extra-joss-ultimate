import handler from '../server/functions/extra-joss-api.mjs';

export default {
  async fetch(request) {
    return await handler(request);
  }
};
