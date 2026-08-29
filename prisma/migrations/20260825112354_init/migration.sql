-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "passwordHash" STRING NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" SET (schema_locked = false);

-- CreateTable
CREATE TABLE "Profile" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Profile" SET (schema_locked = false);

-- CreateTable
CREATE TABLE "Skill" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "profileId" STRING NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Skill" SET (schema_locked = false);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
