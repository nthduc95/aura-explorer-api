import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { User } from './user.entity';
import { WATCH_LIST } from '../constants/common';

@Entity('watch_list')
@Index(['address', 'user'], { unique: true })
export class WatchList extends BaseEntityIncrementId {
  @Column({ nullable: false })
  address: string;

  @Column({ type: 'enum', enum: WATCH_LIST.TYPE })
  type: string;

  @Column({ default: false })
  favorite: boolean;

  @Column({ default: false })
  tracking: boolean;

  @Column({ length: WATCH_LIST.NOTE_MAX_LENGTH, nullable: true, default: '' })
  note: string;

  @Column({ type: 'json', nullable: true })
  settings: JSON;

  @ManyToOne(() => User, (user) => user.watchLists)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
