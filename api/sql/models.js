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
    let entry_id;

    return Promise.resolve()

    // First, get the entry_id from repoFullName
    .then(() => {
      return knex('entries')
        .where({ repository_name: repoFullName })
        .select(['id'])
        .first()
        .then(({ id }) => {
          entry_id = id;
        });
    })

    // Remove any previous votes by this person
    .then(() => {
      return knex('votes')
        .where({
          entry_id,
          username,
        })
        .delete();
    })

    // Then, insert a vote
    .then(() => {
      return knex('votes')
        .insert({
          entry_id,
          username,
          vote_value: voteValue,
        });
    });
  }

  haveVotedForEntry(repoFullName, username) {
    let entry_id;

    return Promise.resolve()

    // First, get the entry_id from repoFullName
    .then(() => {
      return knex('entries')
        .where({ repository_name: repoFullName })
        .select(['id'])
        .first()
        .then(({ id }) => {
          entry_id = id;
        });
    })

    .then(() => {
      return knex('votes')
        .where({ entry_id, username })
        .select(['id', 'vote_value'])
        .first();
    })

    .then((vote) => vote || { vote_value: 0 });
  }

  submitRepository(repoFullName, username) {
    const rateLimitMs = 60 * 60 * 1000;
    const rateLimitThresh = 3;

    // Rate limiting logic
    return knex.transaction((trx) => {
      return trx('entries')
        .count()
        .where('posted_by', '=', username)
        .where('created_at', '>', Date.now() - rateLimitMs)
        .then((obj) => {
          // If the user has already submitted too many times, we don't
          // post the repo.
          const postCount = obj[0]['count(*)'];
          if (postCount > rateLimitThresh) {
            throw new Error('Too many repos submitted in the last hour!');
          } else {
            return trx('entries')
              .insert({
                created_at: Date.now(),
                updated_at: Date.now(),
                repository_name: repoFullName,
                posted_by: username
              });
          }
        });
    });
  }
}

export class Comments {
  getAllByEntryId(entryId) {
    // No need to batch
  }
}
