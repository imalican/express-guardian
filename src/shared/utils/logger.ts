import pino from 'pino';

export const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          destination: './logs/app.log',
          mkdir: true,
        },
      },
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    ],
  },
});
