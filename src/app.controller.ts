import { 
  ApiNotFoundResponse, 
  ApiBadRequestResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiTags 
} from '@nestjs/swagger'
import { BadRequestException, Controller, Get,Req } from '@nestjs/common'
import { AppService } from './app.service'
import { Public } from '@hsuite/decorators'
import { ISmartNode, SmartNode } from '@hsuite/types'

@Controller('node')
@ApiTags('node')
export class AppController {
  smartClientService: any;
  constructor(
    private readonly appService: AppService
  ) {}

  @Public()
  @ApiOperation({
    summary: 'get the identifier of the SmartNodeOperator this SmartApp is connected to',
    description: 'This endpoint is only available if the user is authenticated. \
    It will return the details about the SmartNodeOperator.'
  })
  @ApiOkResponse({
    type: SmartNode.Operator,
    status: 200,
    description: "Returns a SmartNodeOperator."
  })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Get('smart-node-identifier')
  
  async smartNodeIdentifier(  @Req() request): Promise<ISmartNode.IOperator> {
  console.log("request.user",request.user)
    try {
      return await this.appService.smartNodeIdentifier();
    } catch(error) {
      throw new BadRequestException(error.message);
    }
  }
}
