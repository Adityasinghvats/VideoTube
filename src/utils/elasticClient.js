import Client from '@elastic/elasticsearch';
import { configDotenv } from 'dotenv';

configDotenv();

export default searchClient = new Client({
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    }
})
