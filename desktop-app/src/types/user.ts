export interface UserProfile {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  discriminator: string | null;
  token: number;
  streak: number;
  lastDailyDate: Date | null;
  role: {
    id: string;
    name: string;
    discordId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  token: number;
  rank: number;
  avatar?: string;
  discordId: string;
}

export interface LeaderboardResponse {
  users: LeaderboardEntry[];
  total: number;
  currentUser?: LeaderboardEntry;
} 