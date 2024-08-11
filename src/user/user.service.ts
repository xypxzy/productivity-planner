import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service'
import { AuthDto } from '../auth/dto/auth.dto'
import { hash } from 'argon2'

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService
  ) {
  }

  async create(dto: AuthDto) {
    const user = {
      email: dto.email,
      name: '',
      password: await hash(dto.password)
    }

    return this.prisma.user.create({ data: user })
  }

  getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { tasks: true }
    })
  }

  getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    })
  }
}
