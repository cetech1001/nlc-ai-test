import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {AdminQueryDto, CreateAdminDto, UpdateAdminDto} from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findAll(query: AdminQueryDto) {
    const { page = 1, limit = 10, search, role, isActive } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const result = await this.prisma.paginate(this.prisma.admin, {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        systemSettings: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!admin) {
      throw new NotFoundException(`Administrator with ID ${id} not found`);
    }

    return admin;
  }

  async create(createAdminDto: CreateAdminDto) {
    const { email, password, firstName, lastName, role } = createAdminDto;

    // Check if admin already exists
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new ConflictException('Administrator with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await this.prisma.admin.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'admin',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return admin;
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const { email, firstName, lastName, role } = updateAdminDto;

    // Check if admin exists
    await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (email) {
      const existingAdmin = await this.prisma.admin.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (existingAdmin) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updatedAdmin;
  }

  async toggleStatus(id: string) {
    const admin = await this.findOne(id);

    return this.prisma.admin.update({
      where: {id},
      data: {
        isActive: !admin.isActive,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.admin.delete({
      where: { id },
    });

    return { message: 'Administrator deleted successfully' };
  }
}
