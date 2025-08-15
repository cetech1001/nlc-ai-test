import {Body, Controller, Delete, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CurrentUser, UserTypes, UserTypesGuard} from '@nlc-ai/api-auth';
import {type AuthUser, UserType} from '@nlc-ai/api-types';
import {MediaService} from '../services/media.service';
import {MediaFiltersDto} from '../dto/media-filters.dto';

@ApiTags('Media')
@Controller('media')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Get media assets with filters' })
  @ApiResponse({ status: 200, description: 'Media assets retrieved successfully' })
  async getAssets(
    @Query() filters: MediaFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    // For non-admin users, filter by their own coachID
    const coachID = user.type === UserType.admin ? filters.coachID : user.id;

    if (!coachID) {
      return { assets: [], total: 0, page: 1, limit: 10 };
    }

    return this.mediaService.getAssets(coachID, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific media asset' })
  @ApiParam({ name: 'id', description: 'Media asset ID' })
  @ApiResponse({ status: 200, description: 'Media asset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media asset not found' })
  async getAsset(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    const coachID = user.type === UserType.admin ? undefined : user.id;

    if (user.type === UserType.admin) {
      // Admin can access any asset, but we need the coachID from the asset
       // We'll modify service to handle this
      return await this.mediaService.getAsset(id, '');
    }

    return this.mediaService.getAsset(id, coachID!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media asset' })
  @ApiParam({ name: 'id', description: 'Media asset ID' })
  @ApiResponse({ status: 200, description: 'Media asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media asset not found' })
  async deleteAsset(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    const coachID = user.type === UserType.admin ? undefined : user.id;

    if (user.type === UserType.admin) {
      // For admin, we need to get the asset first to find the coachID
      const asset = await this.mediaService.getAsset(id, '');
      return this.mediaService.deleteAsset(id, asset.coachID, user.id);
    }

    return this.mediaService.deleteAsset(id, coachID!, user.id);
  }

  @Post(':id/url')
  @ApiOperation({ summary: 'Generate a transformed URL for an asset' })
  @ApiParam({ name: 'id', description: 'Media asset ID' })
  @ApiResponse({ status: 200, description: 'URL generated successfully' })
  async generateUrl(
    @Param('id') id: string,
    @Body() transformations: any[],
    @CurrentUser() user: AuthUser
  ) {
    const coachID = user.type === UserType.admin ? undefined : user.id;

    if (user.type === UserType.admin) {
      const asset = await this.mediaService.getAsset(id, '');
      return {
        url: await this.mediaService.generateUrl(id, asset.coachID, transformations)
      };
    }

    return {
      url: await this.mediaService.generateUrl(id, coachID!, transformations)
    };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get media asset analytics' })
  @ApiParam({ name: 'id', description: 'Media asset ID' })
  @ApiResponse({ status: 200, description: 'Asset analytics retrieved successfully' })
  async getAssetStats(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    // This would integrate with analytics service
    // For now, return basic info
    // const coachID = user.type === UserType.admin ? undefined : user.id;

    if (user.type === UserType.admin) {
      // const asset = await this.mediaService.getAsset(id, '');
      return { assetID: id, views: 0, downloads: 0, lastAccessed: null };
    }

    // const asset = await this.mediaService.getAsset(id, coachID);
    return { assetID: id, views: 0, downloads: 0, lastAccessed: null };
  }
}
