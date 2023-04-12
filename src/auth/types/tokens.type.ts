export type Tokens = {
  access_token: string | null;
  refresh_token: string | null;
};

export type JwtPayload = {
  email: string;
  sub: number;
};
