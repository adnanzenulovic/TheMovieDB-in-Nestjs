import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SearchMovieDto } from './dto/search-movie.dto';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { FilterData } from './types';

@Controller()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('')
  async findAll(@Res() res: Response) {
    const nonce = randomBytes(16).toString('base64');

    res.locals.nonce = nonce;
    res.setHeader(
      'Content-Security-Policy',
      `script-src 'self' 'nonce-${nonce}';`,
    );
    return res.render('index', { nonce });
  }

  @HttpCode(HttpStatus.OK)
  @Get('getFilterData')
  async filterData(): Promise<FilterData[]> {
    return this.moviesService.getFilterData();
  }

  @HttpCode(HttpStatus.OK)
  @Post('search')
  getSearch(@Body() searchBody: SearchMovieDto): Promise<SearchMovieDto[]> {
    return this.moviesService.getSearchResult(searchBody);
  }

  @HttpCode(HttpStatus.OK)
  @Get('movies/:id')
  getSpecificPage(@Param('id') id: number) {
    return this.moviesService.getAll(id);
  }
}
