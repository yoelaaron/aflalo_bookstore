import { Resolver, Mutation, Args, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  SignUpInput,
  LoginInput,
  RefreshTokenInput,
  AuthResponse,
  TokenResponse,
  LogoutResponse,
  UserType,
} from "./types/auth.types";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { User } from "../users/entities/user.entity";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async signUp(@Args("input") signUpInput: SignUpInput): Promise<AuthResponse> {
    return this.authService.signUp(signUpInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async login(@Args("input") loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Mutation(() => TokenResponse)
  async refreshTokens(@CurrentUser() user: any): Promise<TokenResponse> {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Mutation(() => LogoutResponse)
  async logout(@CurrentUser("id") userId: string): Promise<LogoutResponse> {
    await this.authService.logout(userId);
    return { message: "Logged out successfully" };
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserType)
  async me(@CurrentUser() user: User): Promise<UserType> {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
