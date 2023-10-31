export type RawCompiFile = {
  file: File;
  id: string;
};

export type CompiFile = {
  totalCounts: number;
  losses: { [key: string]: number };
  totalLosses: number;
  totalWins: number;
  createdAt: string;
  bucket: string;
  id: string;
  wins: { [key: string]: number };
  fileName: string;
};

export type Comment = {
  id: string;
  bucket: string;
  winnerId: string;
  looserId: string;
  comment: string;
  createdAt: string;
};

export type Bucket = {
  id: string;
  createdAt: string;
  name: string;
  password?: string;
};
