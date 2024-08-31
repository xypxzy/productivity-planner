import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { AuthDto } from './dto/auth.dto'
import { verify } from 'argon2'
import { Response } from 'express'

@Injectable()
export class AuthService {
  private EXPIRE_DAY_REFRESH_TOKEN = 1
  REFRESH_TOKEN_NAME = 'refresh_token'

  constructor(
    private jwt: JwtService,
    private userService: UserService
  ) {}

  async login(dto: AuthDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.validateUser(dto)
    const tokens = this.issueToken(user.id)

    return { user, ...tokens }
  }

  async register(dto: AuthDto) {
    const oldUser = await this.userService.getByEmail(dto.email)
    if (oldUser) throw new BadRequestException('User already exists')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.userService.create(dto)
    const tokens = this.issueToken(user.id)

    return { user, ...tokens }
  }

  private issueToken(userId: string) {
    const data = { id: userId }

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h'
    })
    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d'
    })

    return { accessToken, refreshToken }
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email)
    if (!user) throw new NotFoundException('User not found')

    const isValidPassword = await verify(user.password, dto.password)
    if (!isValidPassword) throw new UnauthorizedException('Invalid password')

    return user
  }

  addRefreshToken(res: Response, refreshToken: string) {
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      // Change from env
      domain: 'localhost',
      expires: expiresIn,
      secure: true,
      // lax if production
      sameSite: 'none'
    })
  }

  removeRefreshToken(res: Response) {
    res.clearCookie(this.REFRESH_TOKEN_NAME, {
      httpOnly: true,
      // Change from env
      domain: 'localhost',
      expires: new Date(0),
      secure: true,
      // lax if production
      sameSite: 'none'
    })
  }

  async getNewAccessToken(refreshToken: string) {
    const result = this.jwt.verify(refreshToken)
    if (!result) throw new UnauthorizedException('Invalid refresh token')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.userService.getById(result.id)
    const tokens = this.issueToken(user.id)

    return { user, ...tokens }
  }
}
