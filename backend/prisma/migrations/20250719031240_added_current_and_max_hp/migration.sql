/*
  Warnings:

  - Added the required column `currentHp` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxHp` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentHp" INTEGER NOT NULL,
ADD COLUMN     "maxHp" INTEGER NOT NULL;
