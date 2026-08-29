-- Align database constraints with the Prisma schema.
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_profileId_fkey";

CREATE UNIQUE INDEX "Skill_profileId_name_key" ON "Skill"("profileId", "name");

ALTER TABLE "Profile"
  ADD CONSTRAINT "Profile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Skill"
  ADD CONSTRAINT "Skill_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
