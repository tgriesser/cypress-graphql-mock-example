import knex from './connector';

export class Entries {
  getForFeed(type, after) {
    const query = knex('entries')
      .select('entries.*', knex.raw('SUM(votes.vote_value) as score'))
      .leftJoin('votes', 'entries.id', 'votes.entry_id')
      .groupBy('entries.id');

    if (type === 'NEW') {
      query.orderBy('created_at', 'desc');
    } else if (type === 'TOP') {
      query.orderBy('score', 'desc');
    } else {
      throw new Error(`Feed type ${type} not implemented.`);
    }

    return query.then((rows) => {
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
