import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';

import { AkcLogger, CONST_CHAR, CONST_NUM, RequestContext, Transaction } from '../../../shared';

import { TxParamsDto } from '../dtos/transaction-params.dto';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Raw } from 'typeorm/find-options/operator/Raw';
import { DelegationParamsDto } from '../../../components/validator/dtos/delegation-params.dto';
import { LiteTransactionOutput } from '../dtos/lite-transaction-output.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export class TransactionService {
  private denom;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
    private httpService: HttpService,
    private txRepository: TransactionRepository,
  ) {
    this.logger.setContext(TransactionService.name);
    this.denom = this.configService.get<string>('denom');
  }

  async getTotalTx(): Promise<number> {
    return await this.txRepository.count();
  }

  async getTxsByBlockHeight(height: number): Promise<Transaction[]> {
    return await this.txRepository.find({ where: { height } });
  }

  async getTxs(
    ctx: RequestContext,
    query: TxParamsDto,
  ): Promise<{ txs: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTxs.name} was called!`);

    const [txs, count] = await this.txRepository.findAndCount({
      where: { id: MoreThan(0) },
      order: { height: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const txsOuput = plainToClass(LiteTransactionOutput, txs, {
      excludeExtraneousValues: true,
    });

    return { txs: txsOuput, count };
  }

  async getTxByHash(ctx: RequestContext, hash): Promise<any> {
    this.logger.log(ctx, `${this.getTxByHash.name} was called!`);
    const transaction = await this.txRepository.findOne({
      where: { tx_hash: hash },
    });
    const block = await transaction.block;
    const chainid = block.chainid;

    return {...transaction, chainid};
  }

  async getTransactionsByAddress(
    ctx: RequestContext,
    validatorAddress,
    query: DelegationParamsDto,
  ): Promise<{ transactions: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTransactionsByAddress.name} was called!`);

    const { transactions, total } = await this.txRepository.getTransactionsByAddress(validatorAddress, query.limit, query.offset);

    const lstOutput = [];
    transactions.forEach(data => {
      let validatorAddr = '';
      let transaction = { ...data };
      if (data.code === 0) {
        const rawLog = JSON.parse(data.raw_log);

        const txAttr = rawLog[0].events.find(
          ({ type }) => type === CONST_CHAR.DELEGATE || type === CONST_CHAR.UNBOND || type === CONST_CHAR.REDELEGATE || type === CONST_CHAR.CREATE_VALIDATOR
        );
        if (txAttr) {
          const txAction = txAttr.attributes.find(
            ({ key }) => key === CONST_CHAR.VALIDATOR || key === CONST_CHAR.SOURCE_VALIDATOR
          );
          const regex = /_/gi;
          const txActionAmount = txAttr.attributes.find(
            ({ key }) => key === CONST_CHAR.AMOUNT,
          );
          let amount = txActionAmount.value.replace(regex, ' ');
          amount = amount.replace(this.denom, '');
          transaction["amount"] = (parseInt(amount) / CONST_NUM.PRECISION_DIV).toFixed(6);
          transaction.type = txAttr.type;
        }
      }
      lstOutput.push(transaction);
    });

    const transactionsOutput = plainToClass(LiteTransactionOutput, lstOutput, {
      excludeExtraneousValues: true,
    });

    return { transactions: transactionsOutput, count: total };
  }

  async getTransactionsByDelegatorAddress(
    ctx: RequestContext,
    address,
    query: DelegationParamsDto,
  ): Promise<{ transactions: LiteTransactionOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getTransactionsByDelegatorAddress.name} was called!`);

    const { transactions, total } = await this.txRepository.getTransactionsByDelegatorAddress(address, query.limit, query.offset);

    const transactionsOutput = plainToClass(LiteTransactionOutput, transactions, {
      excludeExtraneousValues: true,
    });

    return { transactions: transactionsOutput, count: total };
  }
}
