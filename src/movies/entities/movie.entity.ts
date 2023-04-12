import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Movie extends Document {
  @Prop()
  name: string;
  @Prop()
  brand: string;
  @Prop({ default: 0 })
  recommendations: number;
  @Prop([String])
  flavors: string[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
