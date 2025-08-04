import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString, Matches, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
  @Field()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @Field()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
  })
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @Field()
  @IsString({ message: "Password is required" })
  password: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString({ message: "Refresh token is required" })
  refreshToken: string;
}

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserType)
  user: UserType;
}

@ObjectType()
export class TokenResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

@ObjectType()
export class LogoutResponse {
  @Field()
  message: string;
}
