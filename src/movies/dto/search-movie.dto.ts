import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SearchMovieDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  genres: string;

  @IsNumber()
  @IsOptional()
  rating: number;

  @IsNumber()
  @IsOptional()
  year: number;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  order: 'latest' | 'oldest' | 'rating-ascending' | 'rating-descending';
}
