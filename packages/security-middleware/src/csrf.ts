import csrf from 'csurf';
import cookieParser from 'cookie-parser';

export const csrfMiddleware = [
  cookieParser(),
  csrf({ cookie: true })
];
