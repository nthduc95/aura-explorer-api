import { Body, CacheInterceptor, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AkcLogger, ReqContext, RequestContext } from "../../../shared";
import { ContractCodeParamsDto } from "../dtos/contract-code-params.dto";
import { ContractCodeService } from "../services/contract-code.service";

@ApiTags('contract-codes')
@Controller('contract-codes')
export class ContractCodeController {
    constructor(
        private readonly contractCodeService: ContractCodeService,
        private readonly logger: AkcLogger,
    ) {
        this.logger.setContext(ContractCodeController.name);
    }

    @Post()
    @ApiOperation({ summary: 'Get list contract codes' })
    @ApiResponse({ status: HttpStatus.OK })
    @UseInterceptors(ClassSerializerInterceptor)
    @UseInterceptors(CacheInterceptor)
    async getContractCodes(@ReqContext() ctx: RequestContext, @Body() request: ContractCodeParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getContractCodes.name} was called!`);
        const { contract_codes, count } = await this.contractCodeService.getContractCodes(ctx, request);

        return { data: contract_codes, meta: { count } };
    }
}