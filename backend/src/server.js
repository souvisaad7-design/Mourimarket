import { createApp } from './app.js';
import { config } from './config.js';

createApp().listen(config.port, () => {
  console.log(`Souk Chinguetti API listening on http://localhost:${config.port}`);
});
