import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'events', timestamps: false })
export class Event extends Model<Event> {
  
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: null,
  })
  event_name: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: null,
  })
  slug: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    defaultValue: null,
  })
  description: string | null;

  // @Column({
  //   type: DataType.TEXT,
  //   allowNull: true,
  //   defaultValue: null,
  // })
  // image_url: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    defaultValue: null,
  })
  start_date: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    defaultValue: null,
  })
  end_date: string | null;

  @Column({
    type: DataType.TIME,
    allowNull: true,
    defaultValue: null,
  })
  start_time: string | null;

  @Column({
    type: DataType.TIME,
    allowNull: true,
    defaultValue: null,
  })
  end_time: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  status: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  created_at: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  updated_at: Date | null;
}
