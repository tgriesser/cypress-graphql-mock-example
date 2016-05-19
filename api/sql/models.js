import knex from './connector';

export class Entries {
  getForFeed(type, after) {
    // Don't use connector, no need to batch
  }

  getByRepoFullName(name) {
    // No need to batch
    return knex
      .select('*')
      .where({ repository_name: name })
      .from('entries')
      .first().then((result) => {
        console.log(result);
        return result;
      });
  }

  // XXX also needs to return vote count?
}

export class Comments {
  getAllByEntryId(entryId) {
    // No need to batch
  }
}
