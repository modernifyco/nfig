import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';

import { API_VERSIONS } from '../../../configs/consts';
import { ConfigService } from '../services/config.service';
import { AppConfigV1 } from '../models/config_v1.model';

@Controller({ path: '/config', version: API_VERSIONS.v1 })
export class ConfigControllerV1 {
  constructor(protected readonly configService: ConfigService) {}

  /* General endpoints */

  @Get()
  async getAllApps(): Promise<Record<string, AppConfigV1>> {
    return this.configService.getAllApps();
  }

  /* Application-level endpoints */

  @Post(`/:app`)
  async setAppConfig(
    @Param('app') appName: string,
    @Body() appConfig: AppConfigV1,
  ): Promise<void> {
    return this.configService.setAppConfig(appName, appConfig);
  }

  @Get('/:app')
  async getAppConfig(@Param('app') appName: string): Promise<AppConfigV1> {
    const appConfig = await this.configService.getAppConfig(appName);

    if (typeof appConfig === 'undefined') {
      throw NotFoundException.createBody(
        `No configuration found for ${appName}`,
      );
    }

    return appConfig;
  }

  @Delete('/:app')
  async deleteAppConfig(@Param('app') appName: string): Promise<void> {
    return this.configService.deleteAppConfig(appName);
  }

  /* Environment-level endpoints */
  @Post('/:app/:env')
  async setEnvConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Body() envConfig: Record<string, string>,
  ): Promise<void> {
    return this.configService.setEnvConfig(appName, envName, envConfig);
  }

  @Get('/:app/:env')
  async getEnvConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
  ): Promise<Record<string, string>> {
    const envConfig = this.configService.getEnvConfig(appName, envName);

    if (typeof envConfig === 'undefined') {
      throw NotFoundException.createBody(
        `No configuration found for ${appName}/${envName}`,
      );
    }

    return envConfig;
  }

  @Delete('/:app/:env')
  async deleteEnvConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
  ): Promise<void> {
    return this.configService.deleteEnvConfig(appName, envName);
  }

  /* Configuration-level endpoints */
  @Post('/:app/:env/:key')
  async setConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Param('key') key: string,

    @Body() val: string,
  ): Promise<void> {
    return this.configService.setConfig(appName, envName, key, val);
  }

  @Get('/:app/:env/:key')
  async getConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Param('key') key: string,
  ): Promise<string> {
    const val = this.configService.getConfig(appName, envName, key);

    if (typeof val === 'undefined') {
      throw NotFoundException.createBody(
        `No configuration found for ${appName}/${envName}/${key}`,
      );
    }

    return val;
  }

  @Delete('/:app/:env/:key')
  async deleteConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Param('key') key: string,
  ): Promise<void> {
    return this.configService.deleteConfig(appName, envName, key);
  }
}
