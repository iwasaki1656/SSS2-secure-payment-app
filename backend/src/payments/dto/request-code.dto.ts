import { IsString, IsNotEmpty } from 'class-validator';

export class RequestCodeDto {
  @IsString()
  @IsNotEmpty()
  senderId!: string;
}
