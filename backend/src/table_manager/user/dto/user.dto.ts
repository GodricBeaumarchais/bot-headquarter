export class UserTokenDto {
  username: string;
  token: number;
}

export class UserListResponseDto {
  users: UserTokenDto[];
  total: number;
}

export class UserProfileDto {
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