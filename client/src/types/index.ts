export type User = {
  id: string;
  username: string;
  email: string;
  accessId: number;
  picture: string;
  resetToken: string;
  resetTokenExpires: Date;
};

export type Url = {
  _id: string;
  originalUrl: string;
  shortenedUrl: string;
  creator: string | User | null;
  fingerprint: string;
  visits: number;
  alias: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
};
