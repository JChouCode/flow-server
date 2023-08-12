/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `done` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "completedAt",
DROP COLUMN "done",
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "startAt" TIMESTAMP(3);
