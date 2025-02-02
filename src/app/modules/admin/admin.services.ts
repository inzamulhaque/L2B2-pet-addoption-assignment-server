import { Prisma, UserRole, UserStatus } from "@prisma/client";
import calculatePagination from "../../../utils/pagination";
import prisma from "../../../utils/prisma";
import { IPaginationOptions } from "../../interface/pagination";
import { IAdminFilterRequest } from "./admin.interdace";
import { adminSearchAbleFields } from "./admin.constant";

const getUserService = async (
  params: IAdminFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: adminSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm as string,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andConditions.push({
    status: "ACTIVE",
  });

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy as string]: options.sortOrder }
        : { createdAt: "asc" },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getUserByIdService = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { password, ...others } = result;

  return others;
};

const deleteUserByIdService = async (id: string) => {
  const deleteUser = await prisma.user.update({
    where: {
      id,
      OR: [{ role: UserRole.ADMIN }, { role: UserRole.USER }],
    },
    data: {
      status: UserStatus.DELETED,
    },
  });

  const { password, ...others } = deleteUser;

  return others;
};

export { getUserService, getUserByIdService, deleteUserByIdService };
