import { Test, TestingModule } from '@nestjs/testing';
import { HcsController } from './hcs.controller';
import { HcsService } from './hcs.service';

describe('HcsController', () => {
  let controller: HcsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HcsController],
      providers: [HcsService],
    }).compile();

    controller = module.get<HcsController>(HcsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
