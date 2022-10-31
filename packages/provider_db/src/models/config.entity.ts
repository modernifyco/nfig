import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'configs' })
@Index(['appName', 'envName'])
@Index(['appName', 'envName', 'key'], { unique: true })
export class Config {
  @Column({ name: 'app_name', nullable: false, primary: true })
  appName: string;

  @Column({ name: 'env_name', nullable: false, primary: true })
  envName: string;

  @Column({ name: 'config_key', nullable: false, primary: true })
  key: string;

  @Column({ name: 'config_val', nullable: true })
  val: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
