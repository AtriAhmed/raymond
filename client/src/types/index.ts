export type User = {
  id: string;
  username: string;
  email: string;
  accessId: number;
  picture: string;
  resetToken: string;
  resetTokenExpires: Date;
};
