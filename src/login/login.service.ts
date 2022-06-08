import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.provider';
import { JwtService } from '@nestjs/jwt';

const { DATABASE_NAME = 'email_database' } = process.env;

@Injectable()
export class LoginService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}
  async loginUser(
    table_name: string,
    params: Record<string, any>,
  ): Promise<Record<string, any>> {
    const { data = [] } = await this.databaseService.login(
      DATABASE_NAME,
      table_name,
      params,
    );
    const [user] = data;
    const access_token = await this.jwtService.signAsync({
      username: user?.username,
      password: user?.password,
    });
    return { access_token, user };
  }
}
