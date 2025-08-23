import { NestFactory } from '@nestjs/core';

import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  // await app.get(UserSeedService).run();

  await app.close();
};

void runSeed();
