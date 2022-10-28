import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'configs' })
export class Config {
  @Column({ name: 'app_name', nullable: false, primary: true })
  appName: string;

  @Column({ name: 'env_name', nullable: false, primary: true })
  envName: string;

  @Column({ name: 'key_name', nullable: false, primary: true })
  key: string;

  @Column({ name: 'val', nullable: false })
  val: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
