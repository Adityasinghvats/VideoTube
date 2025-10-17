import { Client } from '@elastic/elasticsearch';
import { config } from 'dotenv';

config();

const searchClient = new Client({
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    }
})

export default searchClient;
