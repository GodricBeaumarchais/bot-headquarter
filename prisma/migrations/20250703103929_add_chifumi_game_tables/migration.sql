-- CreateEnum
CREATE TYPE "ChifumiGameStatus" AS ENUM ('PENDING', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChifumiChoice" AS ENUM ('ROCK', 'PAPER', 'SCISSORS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "discriminator" TEXT,
    "token" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastDailyDate" TIMESTAMP(3),
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OOTDReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "reactorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OOTDReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "commandType" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT,
    "args" TEXT,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT,
    "emoji" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isOOTD" BOOLEAN NOT NULL DEFAULT false,
    "ootdAuthorId" TEXT,
    "tokensEarned" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReactionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChifumiGame" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "betAmount" INTEGER NOT NULL,
    "status" "ChifumiGameStatus" NOT NULL DEFAULT 'PENDING',
    "winnerId" TEXT,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "totalRounds" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChifumiGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChifumiRound" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "challengerChoice" "ChifumiChoice",
    "opponentChoice" "ChifumiChoice",
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChifumiRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_discordId_key" ON "Role"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "OOTDReaction_messageId_key" ON "OOTDReaction"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "OOTDReaction_messageId_reactorId_key" ON "OOTDReaction"("messageId", "reactorId");

-- CreateIndex
CREATE UNIQUE INDEX "ChifumiGame_gameId_key" ON "ChifumiGame"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ChifumiRound_gameId_roundNumber_key" ON "ChifumiRound"("gameId", "roundNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OOTDReaction" ADD CONSTRAINT "OOTDReaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandLog" ADD CONSTRAINT "CommandLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionLog" ADD CONSTRAINT "ReactionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiGame" ADD CONSTRAINT "ChifumiGame_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiGame" ADD CONSTRAINT "ChifumiGame_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiGame" ADD CONSTRAINT "ChifumiGame_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("discordId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiRound" ADD CONSTRAINT "ChifumiRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ChifumiGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiRound" ADD CONSTRAINT "ChifumiRound_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("discordId") ON DELETE SET NULL ON UPDATE CASCADE;
