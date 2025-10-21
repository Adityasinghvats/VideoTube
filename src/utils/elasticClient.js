import { Client } from '@elastic/elasticsearch';
import { config } from 'dotenv';

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
        console.log('Elasticsearch cluster is up!');
    } catch (err) {
        console.error('Elasticsearch cluster is down!', err);
    }
}

// checkConnection();

export default searchClient;
