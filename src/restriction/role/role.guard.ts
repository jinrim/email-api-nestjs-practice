import {
  CanActivate,
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { IRoleRequestParams } from './role.type';
import { RoleService } from './role.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private roleService: RoleService) {}

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const access_token = context.getArgs()[1].req.cookies.access_token;
    const method = context.getArgs()[0].method;
    if (!access_token) throw new ForbiddenException();
    return this.handleRequest({ method, access_token });
  }
  async handleRequest({
    method,
    access_token,
  }: IRoleRequestParams): Promise<boolean> {
    const user = await this.roleService.getLoggedinUser(access_token);
    if (!user) return false;
    const { success, data = [] } = await this.roleService.getLoggedinUserRole(
      user.role_id,
    );
    if (!success) return false;

    const [{ priviledges = {} }] = data;
    return this.roleService.getLoggedinUserPriviledges({
      method,
      priviledges,
    });
  }
}
