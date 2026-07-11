import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long.' })
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/,
    {
      message:
        'Password must include at least one letter, one number, and one special character.',
    },
  )
  password?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string; // Base64 encoded image string or URL

  // Security: Transaction PIN update — must be exactly 4 digits
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Transaction PIN must be exactly 4 digits.' })
  transactionPin?: string;
}
