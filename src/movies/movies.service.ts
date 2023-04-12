import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchMovieDto } from './dto/search-movie.dto';
import { Movie } from './entities/movie.entity';
import { FilterData } from './types';

const DEFAULT_ITEMS_PER_PAGE = 20;

@Injectable()
export class MoviesService {
  constructor(@InjectModel(Movie.name) readonly movieModel: Model<Movie>) {}

  buildSearchOptions(searchBody: SearchMovieDto) {
    const { title, genres, rating, year, type, order } = searchBody;
    const options: { [k: string]: any } = {};
    const sortOption: { [k: string]: any } = {};

    if (title) options.title = { $regex: title, $options: 'i' };
    if (genres) options.genres = { $in: [genres] };
    if (rating) options['imdb.rating'] = { $gte: rating };
    if (year) options.year = year;
    if (type) options.type = type;

    switch (order) {
      case 'latest':
        sortOption.year = -1;
        break;
      case 'oldest':
        sortOption.year = 1;
        break;
      case 'rating-ascending':
        sortOption['imdb.rating'] = 1;
        break;
      case 'rating-descending':
        sortOption['imdb.rating'] = -1;
        break;
      default:
        sortOption.year = 1;
        break;
    }

    return { options, sortOption };
  }
  async getAll(page: number, itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE) {
    const offset = (page - 1) * itemsPerPage;
    const response = await this.movieModel
      .find({})
      .sort({ released: -1 })
      .skip(offset)
      .limit(itemsPerPage)
      .exec();
    return response;
  }

  async getSearchResult(searchBody: SearchMovieDto): Promise<SearchMovieDto[]> {
    const searchOptions = this.buildSearchOptions(searchBody);

    const response = await this.movieModel.aggregate([
      {
        $match: searchOptions.options,
      },
      {
        $sort: searchOptions.sortOption,
      },
    ]);

    return response;
  }

  async getFilterData(): Promise<FilterData[]> {
    return await this.movieModel.aggregate([
      {
        $unwind: '$genres',
      },
      {
        $group: {
          _id: null,
          years: {
            $addToSet: '$year',
          },
          genres: {
            $addToSet: '$genres',
          },
        },
      },
    ]);
  }
}
