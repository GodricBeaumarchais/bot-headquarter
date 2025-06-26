-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastDailyDate" TIMESTAMP(3),
ADD COLUMN     "roleId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OOTDReaction" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "reactorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OOTDReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_discordId_key" ON "Role"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "OOTDReaction_messageId_key" ON "OOTDReaction"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "OOTDReaction_messageId_reactorId_key" ON "OOTDReaction"("messageId", "reactorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OOTDReaction" ADD CONSTRAINT "OOTDReaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;
