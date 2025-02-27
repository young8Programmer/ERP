import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/admin')
  async registerAdmin(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registerAdmin(createAuthDto);
  }

  @Post('register/student')
  async registerStudent(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registerStudent(createAuthDto); // studentId optional bo'lsa, faqat kiriting
  }

  @Post('register/teacher')
  async registerTeacher(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registerTeacher(createAuthDto); // teacherId optional bo'lsa, faqat kiriting
  }

  @Post('login')
  async login(
    @Body() loginDto: { username: string; password: string },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
    });

    return res.status(200).json({ accessToken, user });
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing ❌');
    }
    const { accessToken, newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
    });

    return res.status(200).json({ accessToken });
  }

  @UseGuards(AuthGuard)
  @Delete('logout')
  async logout(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing ❌');
    }

    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'User successfully logged out' });
  }
}
