import { Injectable } from '@nestjs/common';

import { AppConfigV1 } from '../models/config_v1.model';

@Injectable()
export class ConfigService {
  constructor() {}

  async getAllApps(): Promise<Array<AppConfigV1>> {}

  async getAppConfig(appName: string): Promise<AppConfigV1> {}
  async deleteAppConfig(appName: string): Promise<boolean> {}
  async setAppConfig(appName: string): Promise<AppConfigV1> {}

  async deleteConfig(
    appName: string,
    envName: string,
    configKey: string,
  ): Promise<boolean> {}
}
