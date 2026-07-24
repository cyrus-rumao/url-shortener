declare namespace Express {
  interface Request {
    auth?: {
      readonly userId: string;
      readonly email: string;
    };
  }
}
