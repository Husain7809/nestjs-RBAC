import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/mysql.config';
import { AdminModule } from './api/admin/admin.module';
import { ModuleModule } from './api/module/module.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AdminModule,
    ModuleModule
  ],
})
export class AppModule {}
