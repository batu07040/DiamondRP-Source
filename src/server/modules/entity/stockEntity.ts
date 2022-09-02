import { Table, Column, Model, HasMany, AutoIncrement, DataType, Sequelize } from 'sequelize-typescript';



@Table({ modelName: "pAFk3qiAgG1_stocks" })
export class stocksEntity extends Model<stocksEntity> {

    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false, defaultValue: null })
    id: number;

    @Column({ type: Sequelize.STRING(256), allowNull: false, defaultValue: '' })
    address: string;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    price: number;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    money_tax: number;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    score_tax: number;

    @Column({ type: Sequelize.STRING(128), allowNull: false, defaultValue: '' })
    user_name: string;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    user_id: number;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1234 })
    pin1: number;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1234 })
    pin2: number;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 1234 })
    pin3: number;

    @Column({ type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 })
    x: number;

    @Column({ type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 })
    y: number;

    @Column({ type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 })
    z: number;

    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    empty_col: number;

}


@Table({ modelName: "pAFk3qiAgG1_log_stock" })
export class logStockEntity extends Model<logStockEntity> {
    @Column({ type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true, allowNull: false, defaultValue: null })
    id: number;
    @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: '' })
    name: string;
    @Column({ type: Sequelize.STRING(64), allowNull: false, defaultValue: '' })
    do: string;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    stock_id: number;
    @Column({ type: Sequelize.INTEGER(11), allowNull: false, defaultValue: 0 })
    timestamp: number;
}