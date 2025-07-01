export interface UserProfile {
  id: string;
  username: string;
  discordId: string;
  token: number;
  avatar?: string;
  discriminator?: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    discordId: string;
  };
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