import { Controller, Request, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@hsuite/decorators';
import { HcsService } from './hcs.service';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { CreateTopicMessageDto } from './dto/create-topic-message.dto'
import { ReadTopicMessagesDto } from './dto/read-topic-messages.dto'
import { ReadMessagesDto } from './dto/read-messages.dto'

@ApiTags('HCS')
@Controller('hcs')
export class HcsController {
  constructor(private readonly hcsService: HcsService) {}

  @ApiOperation({ summary: 'Create a new topic message' })
  @ApiResponse({ status: 201, description: 'The topic message has been successfully created.' })
  @Public()
  @Post(':uuid/:topicId/message')
  async createTopicMessage (
    @Request() req,
    @Param('uuid') uuid: string, // Device uuid
    @Param('topicId') topicId: string,
    @Body() createTopicMessageDto: CreateTopicMessageDto
  ) {
    try {
      return await this.hcsService.createTopicMessage(
        uuid,
        topicId,
        createTopicMessageDto,
        req
      )
    } catch(error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiOperation({ summary: 'Find all topic messages' })
  @ApiResponse({ status: 200, description: 'Retrieve all topic messages.' })
  @Get(':topicId/messages')
  async findAllTopicMessages(
    @Param('topicId') topicId: string,
    @Query() readTopicMessagesDto: ReadTopicMessagesDto
  ) {
    return await this.hcsService.findAllTopicMessages(topicId, readTopicMessagesDto);
  }

  @ApiOperation({ summary: 'Find all messages' })
  @ApiResponse({ status: 200, description: 'Retrieve all messages.' })
  @Get('messages')
  async findAllMessages(@Query() readMessagesDto: ReadMessagesDto) {
    return await this.hcsService.findAllMessages(readMessagesDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.hcsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateHcDto: UpdateTopicDto) {
  //   return this.hcsService.update(+id, updateHcDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.hcsService.remove(+id);
  // }
}
