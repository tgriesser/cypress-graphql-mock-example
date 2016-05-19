import knex from 'knex';
import DataLoader from 'dataloader';

export class SQLConnector {
  // We're going to go with one per table, let's see how that goes. That way
  // we can just use the ID of the row as a key and not do anything fancy.
  constructor({ tableName }) {
    this.tableName = tableName;
    this.loader = new DataLoader(this._fetch.bind(this));
  }

  _fetch(ids) {
    return knex(this.tableName).whereIn('id', ids);
  }

  get(id) {
    return this.loader.load(id);
  }
}
