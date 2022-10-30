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
  async getAllApps(): Promise<Array<AppConfigV1>> {
    return this.configService.getAllApps();
  }

  /* Application-level endpoints */

  @Post(`/:app`)
  async setAppConfig(
    @Param('app') appName: string,
    @Body() ss: any,
  ): Promise<AppConfigV1> {}

  @Get('/:app')
  async getAppConfig(@Param('app') appName: string): Promise<AppConfigV1> {}

  @Delete('/:app')
  async deleteAppConfig(@Param('app') appName: string): Promise<void> {
    if ((await this.configService.deleteAppConfig(appName)) === false) {
      throw new NotFoundException();
    }
  }

  /* Environment-level endpoints */
  @Post('/:app/:env')
  async createEnv(
    @Param('app') appName: string,
    @Param('env') envName: string,
  ): Promise<> {}

  @Get('/:app/:env')
  async getEnv(
    @Param('app') appName: string,
    @Param('env') envName: string,
  ): Promise<> {}

  @Delete('/:app/:env')
  async deleteEnv(
    @Param('app') appName: string,
    @Param('env') envName: string,
  ): Promise<> {}

  /* Configuration-level endpoints */
  @Get('/:app/:env/:key')
  async getConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Param('key') configKey: string,
  ): Promise<string> {}

  @Delete('/:app/:env/:key')
  async deleteConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Param('key') configKey: string,
  ): Promise<> {}

  @Post('/:app/:env/:key')
  async setConfig(
    @Param('app') appName: string,
    @Param('env') envName: string,
    @Param('key') configKey: string,

    @Body() val: string,
  ): Promise<String> {}
}
