import {
  Body,
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AkcLogger,
  MESSAGES,
  ReqContext,
  RequestContext,
  TokenMarkets,
  USER_ROLE,
} from '../../../shared';
import { Cw20TokenService } from '../services/cw20-token.service';
import { Cw20TokenMarketParamsDto } from '../dtos/cw20-token-market-params.dto';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { CreateCw20TokenDto } from '../dtos/create-cw20-token.dto';
import { UpdateCw20TokenDto } from '../dtos/update-cw20-token.dto';
import { Cw20TokenResponseDto } from '../dtos/cw20-token-response.dto';
import { CreateIbcDto } from '../dtos/create-ibc.dto';
import { UpdateIbcDto } from '../dtos/update-ibc.dto';
import { IbcResponseDto } from '../dtos/ibc-response.dto';

@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
@ApiTags('cw20-tokens')
@Controller()
export class Cw20TokenController {
  constructor(
    private readonly cw20TokenService: Cw20TokenService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(Cw20TokenController.name);
  }

  @Get('cw20-tokens/get-by-owner/:owner')
  @ApiOperation({ summary: 'Get list cw20 tokens by owner' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getCw20TokensByOwner(
    @ReqContext() ctx: RequestContext,
    @Param('owner') owner: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
    const { tokens, count } = await this.cw20TokenService.getCw20TokensByOwner(
      ctx,
      owner,
    );

    return { data: tokens, meta: { count } };
  }

  @Get('cw20-tokens/price/:id')
  @ApiOperation({ summary: 'Get price of cw20/cw721 token by id' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getPriceById(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    const price = await this.cw20TokenService.getPriceById(ctx, id);

    return { data: price, meta: {} };
  }

  @Get('cw20-tokens/total-asset/:accountAddress')
  @ApiOperation({ summary: 'Get total asset of coins and tokens' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTotalAssetByAccountAddress(
    @ReqContext() ctx: RequestContext,
    @Param('accountAddress') accountAddress: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getTotalAssetByAccountAddress.name} was called!`,
    );
    const price = await this.cw20TokenService.getTotalAssetByAccountAddress(
      ctx,
      accountAddress,
    );

    return { data: price, meta: {} };
  }

  @Get('cw20-tokens/token-market')
  @ApiOperation({
    summary: 'Get token market of cw20 token by contract address',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getTokenMarket(
    @ReqContext() ctx: RequestContext,
    @Query() query: Cw20TokenMarketParamsDto,
  ): Promise<TokenMarkets[]> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    return await this.cw20TokenService.getTokenMarket(ctx, query);
  }

  @Post('admin/cw20-tokens')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Return a cw20 token.',
    type: Cw20TokenResponseDto,
  })
  async create(
    @Body() createCw20TokenDto: CreateCw20TokenDto,
  ): Promise<Cw20TokenResponseDto | IbcResponseDto> {
    return await this.cw20TokenService.create(
      createCw20TokenDto,
      Cw20TokenResponseDto,
    );
  }

  @Put('admin/cw20-tokens/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return a cw20 token.',
    type: Cw20TokenResponseDto,
  })
  async update(
    @Body() updateCw20TokenDto: UpdateCw20TokenDto,
    @Param('id') id: number,
  ): Promise<Cw20TokenResponseDto | IbcResponseDto> {
    return await this.cw20TokenService.update(
      id,
      updateCw20TokenDto,
      Cw20TokenResponseDto,
    );
  }

  @Delete('admin/tokens-market/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    await this.cw20TokenService.remove(id);
  }

  @Post('admin/ibc')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Return an ibc token.',
    type: IbcResponseDto,
  })
  async createIbc(
    @Body() createIbcDto: CreateIbcDto,
  ): Promise<Cw20TokenResponseDto | IbcResponseDto> {
    return await this.cw20TokenService.create(createIbcDto, IbcResponseDto);
  }

  @Put('admin/ibc/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return an ibc token.',
    type: IbcResponseDto,
  })
  async updateIbc(
    @Body() updateIbcDto: UpdateIbcDto,
    @Param('id') id: number,
  ): Promise<Cw20TokenResponseDto | IbcResponseDto> {
    return await this.cw20TokenService.update(id, updateIbcDto, IbcResponseDto);
  }
}
