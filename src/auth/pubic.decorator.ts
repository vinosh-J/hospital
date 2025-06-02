/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import type { CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): CustomDecorator<typeof IS_PUBLIC_KEY> => 
  SetMetadata(IS_PUBLIC_KEY, true);