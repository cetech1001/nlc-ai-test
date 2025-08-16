import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';

@ApiTags('Billing')
@Controller('billing')
@ApiBearerAuth()
export class BillingGatewayController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'billing',
      '/api/billing/plans',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async getSubscriptions(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'billing',
      '/api/billing/subscriptions',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'billing',
      '/api/billing/subscriptions',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'billing',
      '/api/billing/transactions',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoices(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'billing',
      '/api/billing/invoices',
      {
        method: 'GET',
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('payment-links')
  @ApiOperation({ summary: 'Create payment link' })
  @ApiResponse({ status: 201, description: 'Payment link created successfully' })
  async createPaymentLink(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'billing',
      '/api/billing/payment-links',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  private extractHeaders(req: Request): Record<string, string> {
    return {
      'authorization': req.headers.authorization || '',
      'content-type': req.headers['content-type'] || 'application/json',
      'user-agent': req.headers['user-agent'] || '',
      'x-forwarded-for': req.headers['x-forwarded-for'] as string || req.ip || '',
      'x-real-ip': req.ip || '',
    };
  }
}
