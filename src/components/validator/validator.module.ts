import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';

import { SharedModule } from '../../shared/shared.module';
import { BlockModule } from '../block/block.module';
import { BlockRepository } from '../block/repositories/block.repository';
import { ProposalVoteRepository } from '../proposal/repositories/proposal-vote.repository';
import { ProposalRepository } from '../proposal/repositories/proposal.repository';
import { DelegationRepository } from '../schedule/repositories/delegation.repository';
import { TransactionModule } from '../transaction/transaction.module';

import { ValidatorController } from './controllers/validator.controller';
import { ValidatorRepository } from './repositories/validator.repository';
import { ValidatorService } from './services/validator.service';
import { DelegatorRewardRepository } from '../schedule/repositories/delegator-reward.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ValidatorRepository,
      DelegationRepository,
      BlockRepository,
      ProposalRepository,
      ProposalVoteRepository,
      DelegatorRewardRepository
    ]),
    HttpModule,
    ConfigModule,
    BlockModule,
    TransactionModule,
  ],
  providers: [ValidatorService, ServiceUtil],
  controllers: [ValidatorController],
  exports: [ValidatorService],
})
export class ValidatorModule {}
