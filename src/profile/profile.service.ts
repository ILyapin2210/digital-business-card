import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileInput } from './dto/update-profile.input';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}
  async getPublicProfile() {
    const profile = await this.prisma.profile.findFirst({
      include: {
        skills: true,
      },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  updateProfile(userId: string, input: UpdateProfileInput) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: {
          userId,
        },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      await tx.profile.update({
        where: {
          userId,
        },
        data: {
          name: input.name,
          headline: input.headline,
          description: input.description,
          location: input.location,
          availability: input.availability,
          githubUrl: input.githubUrl,
          telegramUrl: input.telegramUrl,
          contactEmail: input.contactEmail,
          resumeUrl: input.resumeUrl,
          experience: input.experience,
          highlights: input.highlights,
        },
      });

      await tx.skill.deleteMany({
        where: {
          profileId: profile.id,
        },
      });

      const skills = input.skills
        .map((skill) => ({
          name: skill.name.trim(),
          category: skill.category,
        }))
        .filter((skill) => skill.name.length > 0)
        .filter(
          (skill, index, values) =>
            values.findIndex((value) => value.name === skill.name) === index,
        );

      await tx.skill.createMany({
        data: skills.map((skill) => ({
          name: skill.name,
          category: skill.category,
          profileId: profile.id,
        })),
      });

      return tx.profile.findUniqueOrThrow({
        where: {
          id: profile.id,
        },
        include: {
          skills: true,
        },
      });
    });
  }
}
