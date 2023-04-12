import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users' })
export class Auth extends Document {
  @Prop()
  email: string;
  @Prop()
  hash: string;

  @Prop()
  hashRt: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
