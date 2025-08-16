// apps/api/users/src/app/relationships/relationships.module.ts
import { Module } from '@nestjs/common';
import { ClientCoachController } from './client-coach.controller';
import { InvitesController } from './invites.controller';
import { ClientCoachService } from './client-coach.service';
import { InvitesService } from './invites.service';

@Module({
  controllers: [ClientCoachController, InvitesController],
  providers: [ClientCoachService, InvitesService],
  exports: [ClientCoachService, InvitesService],
})
export class RelationshipsModule {}

// apps/api/users/src/app/relationships/client-coach.controller.ts


// apps/api/users/src/app/relationships/client-coach.service.ts


// apps/api/users/src/app/relationships/invites.controller.ts


// apps/api/users/src/app/relationships/invites.service.ts


// apps/api/users/src/app/profiles/profiles.module.ts


// apps/api/users/src/app/profiles/profiles.controller.ts


// apps/api/users/src/app/profiles/profiles.service.ts

id: true,
  firstName: true,
  lastName: true,
  businessName: true,
  email: true,
  avatarUrl: true,
}
}
},
});

return {
  data: result.data,
  pagination: result.pagination,
};
}

async findOne(id: string, coachID?: string) {
  const where: any = { id };

  if (coachID) {
    where.coachID = coachID;
  }

  const relationship = await this.prisma.clientCoach.findFirst({
    where,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          phone: true,
          isActive: true,
          lastInteractionAt: true,
          createdAt: true,
        }
      },
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          businessName: true,
          email: true,
          avatarUrl: true,
        }
      }
    },
  });

  if (!relationship) {
    throw new NotFoundException(`Relationship with ID ${id} not found`);
  }

  return relationship;
}



async update(id: string, updateRelationshipDto: UpdateRelationshipDto, updatedBy: string) {
  const relationship = await this.findOne(id);

  const updatedRelationship = await this.prisma.clientCoach.update({
    where: { id },
    data: {
      ...updateRelationshipDto,
      updatedAt: new Date(),
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        }
      },
      coach: {
        select: {
