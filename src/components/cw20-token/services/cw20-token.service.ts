import { Injectable } from '@nestjs/common';
import { find } from 'rxjs';
import { SmartContractRepository } from 'src/components/contract/repositories/smart-contract.repository';
import { In } from 'typeorm';
import * as util from 'util';
import { AccountService } from '../../../components/account/services/account.service';
import {
  AkcLogger,
  AURA_INFO,
  CONTRACT_TYPE,
  INDEXER_API,
  RequestContext,
  TokenMarkets,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { AssetDto } from '../dtos/asset.dto';
import { Cw20TokenByOwnerParamsDto } from '../dtos/cw20-token-by-owner-params.dto';
import { Cw20TokenParamsDto } from '../dtos/cw20-token-params.dto';
import { TokenMarketsRepository } from '../repositories/token-markets.repository';

@Injectable()
export class Cw20TokenService {
  private appParams;
  private indexerUrl;
  private indexerChainId;
  private denom;
  private minimalDenom;
  private decimals;
  private precisionDiv;
  private configUrl;

  constructor(
    private readonly logger: AkcLogger,
    private tokenMarketsRepository: TokenMarketsRepository,

    private smartContractRepository: SmartContractRepository,
    private serviceUtil: ServiceUtil,
    private accountService: AccountService,
  ) {
    this.logger.setContext(Cw20TokenService.name);
    this.appParams = appConfig.default();
    this.indexerUrl = this.appParams.indexer.url;
    this.indexerChainId = this.appParams.indexer.chainId;
    this.denom = this.appParams.chainInfo.coinDenom;
    this.minimalDenom = this.appParams.chainInfo.coinMinimalDenom;
    this.decimals = this.appParams.chainInfo.coinDecimals;
    this.precisionDiv = this.appParams.chainInfo.precisionDiv;
    this.configUrl = this.appParams.configUrl;
  }

  async getCw20Tokens(
    ctx: RequestContext,
    request: Cw20TokenParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20Tokens.name} was called!`);

    const { list, count } =
      await this.tokenMarketsRepository.getCw20TokenMarkets(request);

    const tokens = list.map((item: TokenMarkets) => {
      const current_price = item.current_price || 0;
      const circulating_supply = item.circulating_supply || 0;

      return {
        coin_id: item.coin_id || '',
        contract_address: item.contract_address || '',
        name: item.name || '',
        symbol: item.symbol || '',
        image: item.image || '',
        description: item.description || '',
        circulating_market_cap: circulating_supply,
        volume_24h: item.total_volume || 0,
        price: current_price,
        price_change_percentage_24h: item.price_change_percentage_24h || 0,
        holders_change_percentage_24h: item.holder_change_percentage_24h || 0,
        holders: item.current_holder || 0,
        max_total_supply: item.max_supply || 0,
      };
    });

    return { tokens, count: count };
  }

  async getCw20TokensByOwner(
    ctx: RequestContext,
    request: Cw20TokenByOwnerParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw20TokensByOwner.name} was called!`);
    const result = [];
    //aura
    const assetDto = new AssetDto();
    assetDto.name = AURA_INFO.NAME;
    assetDto.symbol = this.denom;
    assetDto.image = AURA_INFO.IMAGE;
    assetDto.denom = this.minimalDenom;

    //get balance
    const [totalBalances, tokenData] = await Promise.all([
      this.accountService.getAccountDetailByAddress(
        ctx,
        request.account_address,
      ),
      this.tokenMarketsRepository.findOne({
        where: { coin_id: AURA_INFO.COIN_ID },
      }),
    ]);

    assetDto.balance = totalBalances ? totalBalances.total : 0;
    // price of aura
    if (tokenData) {
      assetDto.price = tokenData.current_price || 0;
      assetDto.price_change_percentage_24h =
        tokenData.price_change_percentage_24h || 0;

      assetDto.max_total_supply = tokenData.max_supply || 0;
    }

    //get value
    assetDto.value = (
      Number(assetDto.balance) * Number(assetDto.price)
    ).toString();
    result.push(assetDto);

    //ibc
    const accountData = await this.serviceUtil.getDataAPI(
      `${this.indexerUrl}${util.format(
        INDEXER_API.ACCOUNT_INFO,
        request.account_address,
        this.indexerChainId,
      )}`,
      '',
      ctx,
    );
    const accountBalances = accountData.data.account_balances;
    const ibcBalances = accountBalances.filter((str) => str.minimal_denom);
    if (ibcBalances.length > 0) {
      //get coin info from config
      const configData = await this.serviceUtil.getDataAPI(
        this.configUrl,
        '',
        ctx,
      );
      const coins = configData?.coins;
      for (let i = 0; i < ibcBalances.length; i++) {
        const item = ibcBalances[i];
        const asset = new AssetDto();
        asset.balance = Number(
          (item.amount / this.precisionDiv).toFixed(this.decimals),
        );
        //get ibc info
        const findCoin = coins?.find((f) => f.denom === item.minimal_denom);
        if (findCoin) {
          asset.name = findCoin.name;
          asset.symbol = findCoin.display;
          asset.image = findCoin.logo;
          asset.denom = findCoin.denom;
        }
        result.push(asset);
      }
    }

    const url: string = INDEXER_API.GET_CW20_TOKENS_BY_OWNER;
    let limit = request.limit;
    let offset = request.offset;

    if (request.offset === 0) {
      limit -= result.length;
    } else {
      offset -= result.length;
    }

    const params = [
      request.account_address,
      this.indexerChainId,
      limit,
      offset,
    ];

    const resultGetCw20Tokens = await this.serviceUtil.getDataAPI(
      `${this.indexerUrl}${util.format(url, ...params)}`,
      '',
      ctx,
    );

    const asset = resultGetCw20Tokens?.data?.assets?.CW20?.asset;
    const count = resultGetCw20Tokens?.data?.assets?.CW20?.count;

    let tokens = [];
    if (asset.length > 0) {
      const listContract_address = asset?.map((i) => i.contract_address);
      const listTokenMarketsInfo = await this.tokenMarketsRepository.find({
        where: { contract_address: In(listContract_address) },
      });
      tokens = asset.map((item) => {
        const tokenMarketsInfo = listTokenMarketsInfo.find(
          (f) => f.contract_address === item.contract_address,
        );
        const asset = new AssetDto();
        asset.contract_address = item.contract_address || '-';
        asset.image = item.image || '';
        asset.name = item.asset_info?.data?.name || '';
        asset.symbol = item.asset_info?.data?.symbol || '';
        asset.balance = item.balance || 0;
        asset.price = tokenMarketsInfo?.current_price || 0;
        asset.price_change_percentage_24h =
          tokenMarketsInfo?.price_change_percentage_24h || 0;
        asset.value = (Number(asset.balance) * Number(asset.price)).toString();
        return asset;
      });
    }

    if (request.offset === 0) {
      tokens = result.concat(tokens);
    }

    return { tokens, count: count + result.length };
  }

  async getPriceById(ctx: RequestContext, id: string): Promise<any> {
    this.logger.log(ctx, `${this.getPriceById.name} was called!`);
    const tokenData = await this.tokenMarketsRepository.findOne({
      where: { coin_id: id },
    });

    return tokenData?.current_price || 0;
  }

  async getTotalAssetByAccountAddress(
    ctx: RequestContext,
    accountAddress: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getTotalAssetByAccountAddress.name} was called!`,
    );
    // let total = 0;
    //get balance of aura wallet
    let balance = 0;
    const accountData = await this.accountService.getAccountDetailByAddress(
      ctx,
      accountAddress,
    );
    balance = accountData ? Number(accountData.total) : 0;

    const tokenData = await this.tokenMarketsRepository.findOne({
      where: { coin_id: AURA_INFO.COIN_ID },
    });
    const price = tokenData?.current_price || 0;

    return balance * price;
  }
}
