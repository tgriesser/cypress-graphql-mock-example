import knex from './connector';

export class Entries {
  getForFeed(type, after) {
    if (type !== 'NEW') {
      throw new Error('Only NEW feed implemented so far.');
    }

    return knex('entries')
      .select('*', knex.raw('SUM(votes.vote_value) as score'))
      .leftJoin('votes', 'entries.id', 'votes.entry_id')
      .groupBy('entries.id')
      .orderBy('created_at', 'desc').then((rows) => {
        return rows.map((row) => {
          row.score = row.score || 0;
          return row;
        });
      });
  }

  getByRepoFullName(name) {
    // No need to batch
    return knex('entries')
      .select('*')
      .where({ repository_name: name })
      .first();
  }

  // XXX also needs to return vote count?
}

export class Comments {
  getAllByEntryId(entryId) {
    // No need to batch
  }
}
