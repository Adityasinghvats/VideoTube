import { Client } from '@elastic/elasticsearch';
import { config } from 'dotenv';
import { logger } from '../logger.js';

config();

// const searchClient = new Client({
//     node: process.env.ELASTICSEARCH_NODE,
//     auth: {
//         username: process.env.ELASTICSEARCH_USERNAME,
//         password: process.env.ELASTICSEARCH_PASSWORD
//     }
// })
const searchClient = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
})

async function checkConnection() {
    try {
        const pong = await searchClient.ping();
        logger.info('Elasticsearch cluster is up!');
    } catch (err) {
        logger.error('Elasticsearch cluster is down!', err);
    }
}

checkConnection();

export default searchClient;
