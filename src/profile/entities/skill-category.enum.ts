import { registerEnumType } from '@nestjs/graphql';

export enum SkillCategory {
  BACKEND = 'BACKEND',
  DATA = 'DATA',
  INTEGRATIONS = 'INTEGRATIONS',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  FRONTEND = 'FRONTEND',
}

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
});
