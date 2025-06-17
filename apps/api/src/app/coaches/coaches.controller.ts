import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  // UseGuards,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import {ApiTags} from "@nestjs/swagger";
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Coaches Controller')
@Controller('coaches')
// @UseGuards(JwtAuthGuard)
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.coachesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @Get(':id/kpis')
  getKpis(
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.coachesService.getCoachKpis(
      id,
      days ? parseInt(days) : 30,
    );
  }

  @Post()
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(createCoachDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto) {
    return this.coachesService.update(id, updateCoachDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }
}
