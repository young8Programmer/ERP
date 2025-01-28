import { Controller, Post, Body, UnauthorizedException, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto'
import { RefreshTokenDto } from './dto/RefreshTokenDto';
import { AuthGuard, Roles } from './auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(loginDto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(200).json({ accessToken, user });
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Res() res: Response) {
    try {
      const { accessToken, newRefreshToken } = await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ accessToken });
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    try {
      const userId = req.user.id;
      await this.authService.logout(userId);

      res.clearCookie('refreshToken');

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
