import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilityService {
  getTableNameFromRoute(route_path: string) {
    const [table_name] = route_path
      .split('/')
      .filter((item: string) => item != '');
    return table_name;
  }
}
