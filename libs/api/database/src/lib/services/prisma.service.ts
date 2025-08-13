import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Optional } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

export interface DatabaseOptions {
  schema?: string;
  connectionUrl?: string;
  enableLogging?: boolean;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    configService: ConfigService,
    @Optional() @Inject('DATABASE_OPTIONS') private options: DatabaseOptions = {}
  ) {
    const connectionUrl = options.connectionUrl || configService.get('DATABASE_URL');

    super({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      log: options.enableLogging ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Set search_path for PostgreSQL schema isolation
    if (this.options.schema) {
      await this.$executeRaw`SET search_path TO ${Prisma.sql([this.options.schema])}, public`;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async paginate<T>(
    model: any,
    {
      page = 1,
      limit = 10,
      where = {},
      orderBy = {},
      include = {},
      select = {},
    }: {
      page?: number;
      limit?: number;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;
    const take = limit;

    const findOptions: any = {
      where,
      orderBy,
      skip,
      take,
    };

    if (Object.keys(include).length > 0) {
      findOptions.include = include;
    }

    if (Object.keys(select).length > 0) {
      findOptions.select = select;
    }

    const [data, total] = await Promise.all([
      model.findMany(findOptions),
      model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async executeInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    retries = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.$transaction(fn);
      } catch (error: any) {
        if (attempt === retries || !this.isRetryableError(error)) {
          throw error;
        }

        await this.delay(Math.pow(2, attempt) * 100);
      }
    }
    throw new Error('Transaction failed after all retries');
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ['P2034', 'P2037'];
    return retryableCodes.includes(error.code);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
