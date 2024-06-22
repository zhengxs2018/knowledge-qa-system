import path from 'node:path';
import { pathToFileURL } from 'node:url';

import 'dotenv/config';

import { initDatabase } from '../src/database/init/init';

async function mian() {
  const [db, schema] = initDatabase({
    url: pathToFileURL(
      path.join(process.cwd(), '.hackai/database.db'),
    ).toString(),
  });

  const thing = await db.query.bots.findFirst({
    where(fields, { eq }) {
      return eq(fields.name, 'ade');
    },
  });

  if (thing) {
    console.log('ade already exists');
    return;
  }

  const table = schema['bots'];

  const [bot] = await db
    .insert(table)
    .values([{ name: 'ade', enabled: true }])
    .returning();

  console.log(bot);
}

mian()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
