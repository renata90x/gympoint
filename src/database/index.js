import Sequelize from 'sequelize'; // inicializando o sequelize

import User from '../app/models/User'; // importando as models da aplicação
import Student from '../app/models/Student';

import databaseConfig from '../config/database'; // importanto a conexão do banco de dados

const models = [User, Student]; // criação de array com todos os models da aplicação

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
