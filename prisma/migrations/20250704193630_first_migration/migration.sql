-- DropForeignKey
ALTER TABLE "ChifumiGame" DROP CONSTRAINT "ChifumiGame_challengerId_fkey";

-- DropForeignKey
ALTER TABLE "ChifumiGame" DROP CONSTRAINT "ChifumiGame_opponentId_fkey";

-- DropForeignKey
ALTER TABLE "CommandLog" DROP CONSTRAINT "CommandLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "OOTDReaction" DROP CONSTRAINT "OOTDReaction_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ReactionLog" DROP CONSTRAINT "ReactionLog_userId_fkey";

-- AddForeignKey
ALTER TABLE "OOTDReaction" ADD CONSTRAINT "OOTDReaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandLog" ADD CONSTRAINT "CommandLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionLog" ADD CONSTRAINT "ReactionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiGame" ADD CONSTRAINT "ChifumiGame_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChifumiGame" ADD CONSTRAINT "ChifumiGame_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;
