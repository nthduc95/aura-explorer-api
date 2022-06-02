export const VALIDATION_PIPE_OPTIONS = { transform: true };

export const REQUEST_ID_TOKEN_HEADER = 'x-request-id';

export const FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';

export enum LINK_API {
  STAKING_POOL = 'cosmos/staking/v1beta1/pool',
  INFLATION = `cosmos/mint/v1beta1/inflation`,
  COMMUNITY_POOL = `cosmos/distribution/v1beta1/community_pool`,
  VALIDATOR = `cosmos/staking/v1beta1/validators`,
  SLASHING_PARAM = `cosmos/slashing/v1beta1/params`,
  SIGNING_INFOS = `cosmos/slashing/v1beta1/signing_infos`,
  PARAM_TALLYING = 'cosmos/gov/v1beta1/params/tallying',
  PROPOSAL_DETAIL = 'cosmos/gov/v1beta1/proposals/',
  PROPOSALS = 'cosmos/gov/v1beta1/proposals',
  LATEST_BLOCK = 'blocks/latest'
}

export enum CONST_NUM {
  LIMIT_2 = 2,
  LIMIT_100 = 100,
  LIMIT_50 = 50,
  OFFSET = 0,
  PRECISION_DIV = 1000000
}

export enum CONST_CHAR {
  PERCENT = '%',
  SECOND = 's',
  UAURA = 'uaura',
  DELEGATE = 'delegate',
  UNBOND = 'unbond',
  VALIDATOR = 'validator',
  SOURCE_VALIDATOR = 'source_validator',
  AMOUNT = 'amount',
  UNDEFINED = 'undefined',
  MESSAGE = 'message',
  ACTION = 'action',
  REDELEGATE = 'redelegate',
}

export enum CONST_MSG_TYPE {
  MSG_VOTE = 'MsgVote',
  MSG_SUBMIT_PROPOSAL = 'MsgSubmitProposal',
  MSG_DEPOSIT = 'MsgDeposit',
  MSG_DELEGATE = 'MsgDelegate',
  MSG_UNDELEGATE = 'MsgUndelegate',
  MSG_REDELEGATE = 'MsgBeginRedelegate',
  MSG_WITHDRAW_DELEGATOR_REWARD = 'MsgWithdrawDelegatorReward'
}

export enum CONST_FULL_MSG_TYPE {
  MSG_DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  MSG_REDELEGATE = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  MSG_UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate',
}

export enum CONST_PROPOSAL_TYPE {
  SOFTWARE_UPGRADE_PROPOSAL = 'SoftwareUpgradeProposal',
  COMMUNITY_POOL_SPEND_PROPOSAL = 'CommunityPoolSpendProposal',
  PARAMETER_CHANGE_PROPOSAL = 'ParameterChangeProposal'
}

export enum CONST_PROPOSAL_VOTE_OPTION {
  YES = 'VOTE_OPTION_YES',
  ABSTAIN = 'VOTE_OPTION_ABSTAIN',
  NO = 'VOTE_OPTION_NO',
  NO_WITH_VETO = 'VOTE_OPTION_NO_WITH_VETO'
}

export enum CONST_NAME_ASSETS {
  AURA = 'AURA'
}

export enum CONST_PUBKEY_ADDR {
  AURAVALCONS = 'auravalcons',
  AURA = 'aura',
}

export enum CONST_DELEGATE_TYPE {
  DELEGATE = 'Delegate',
  UNDELEGATE = 'Undelegate',
  REDELEGATE = 'Redelegate'
}

export enum CONTRACT_STATUS {
  EXACT_MATCH = "EXACT MATCH",
  SIMILAR_MATCH = "SIMILAR MATCH",
  UNVERIFIED = "UNVERIFIED"
}

export const ERROR_MAP = {
  CONTRACT_VERIFIED: {
    Code: 'E001',
    Message: `Contract has been verified`
  }
}
