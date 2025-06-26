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

-- AddForeignKey
ALTER TABLE "CommandLog" ADD CONSTRAINT "CommandLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionLog" ADD CONSTRAINT "ReactionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;
