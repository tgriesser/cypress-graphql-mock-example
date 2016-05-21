import knex from './connector';

function addSelectToEntryQuery(query) {
  query.select('entries.*', knex.raw('SUM(votes.vote_value) as score'))
    .leftJoin('votes', 'entries.id', 'votes.entry_id')
    .groupBy('entries.id');
}

function convertNullColsToZero(row) {
  row.score = row.score || 0;
  return row;
}

function mapNullColsToZero(query) {
  return query.then((rows) => {
    if (rows.length) {
      return rows.map(convertNullColsToZero);
    }

    return convertNullColsToZero(rows);
  });
}

export class Entries {
  getForFeed(type, after) {
    const query = knex('entries')
      .modify(addSelectToEntryQuery);

    if (type === 'NEW') {
      query.orderBy('created_at', 'desc');
    } else if (type === 'TOP') {
      query.orderBy('score', 'desc');
    } else {
      throw new Error(`Feed type ${type} not implemented.`);
    }

    return mapNullColsToZero(query);
  }

  getByRepoFullName(name) {
    // No need to batch
    const query = knex('entries')
      .modify(addSelectToEntryQuery)
      .where({ repository_name: name })
      .first();

    return mapNullColsToZero(query);
  }

  voteForEntry(repoFullName, voteValue, username) {
    return Promise.resolve()

    // First, get the entry_id from repoFullName
    .then(() => {
      return knex('entries')
        .where({ repository_name: repoFullName })
        .select([ 'id '])
        .first();
    })

    // XXX remove any previous votes by this person

    // Then, insert a vote
    .then(({ id }) => {
      return knex('votes')
        .insert({
          entry_id: id,
          vote_value: voteValue,
          username,
        });
    });
  }
}

export class Comments {
  getAllByEntryId(entryId) {
    // No need to batch
  }
}
