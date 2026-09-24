import { Prisma } from "@prisma/client";

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignee: true;
    createdBy: true;
    project: true;
    business: true;
    comments: { include: { author: true } };
  };
}>;

export type BusinessWithRelations = Prisma.BusinessGetPayload<{
  include: { owner: true; project: true; tasks: true };
}>;

export type UserOption = { id: string; name: string };
export type ProjectOption = { id: string; name: string };
export type BusinessOption = { id: string; name: string };
