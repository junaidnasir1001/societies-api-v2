import { configure, task } from '@trigger.dev/sdk/v3';

if (process.env.TRIGGER_API_KEY) {
  configure({
    accessToken: process.env.TRIGGER_API_KEY,
    baseURL: process.env.TRIGGER_API_URL || 'https://api.trigger.dev',
  });
}

// Stub task - sirf registration ke liye
export const societiesTask = task({
  id: 'societies-task',
  name: 'Societies Simulation Task',
  run: async (payload) => {
    throw new Error('Stub task - not for execution');
  },
});
