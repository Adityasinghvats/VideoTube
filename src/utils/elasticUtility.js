import searchClient from "./elasticClient.js";
import { logger } from "../logger.js";

async function createTweetIndex() {
    const indexExists = await searchClient.indices.exists({ index: 'tweets' });
    if (!indexExists) {
        await searchClient.indices.create({
            index: 'tweets',
            body: {
                mappings: {
                    properties: {
                        content: { type: 'text' },
                    }
                }
            }
        }, { ignore: [400] }); // 400 means index already exists
        logger.info("Tweet index created");
    }
    else {
        logger.info("Tweet index already exists");
        return;
    }
}

async function createVideoIndex() {
    const indexExists = await searchClient.indices.exists({ index: 'videos' });
    if (!indexExists) {
        await searchClient.indices.create({
            index: 'videos',
            body: {
                mappings: {
                    properties: {
                        title: { type: 'text' },
                        description: { type: 'text' },
                    }
                }
            }
        }, { ignore: [400] });
        logger.info("Video index created");
    } else {
        logger.info("Video index already exists");
        return;
    }
}

async function addIndexedData(change, field) {//send this tweet data after creating it in db
    const body = field === 'tweets'
        ? { content: change.fullDocument.content }
        : {
            title: change.fullDocument.title,
            description: change.fullDocument.description
        };
    await searchClient.index({
        index: field,
        id: change.documentKey._id.toString(),
        body: body
    });
    await searchClient.indices.refresh({ index: field });
}

async function updateIndexedData(change, field) {
    const body = field === 'tweets'
        ? { content: change.fullDocument.content }
        : {
            title: change.fullDocument.title,
            description: change.fullDocument.description
        };
    await searchClient.update({
        index: field,
        id: change.documentKey._id.toString(),
        body: { doc: body }
    });
    await searchClient.indices.refresh({ index: field });
}

async function deleteIndexedData(change, field) {
    await searchClient.delete({
        index: field,
        id: change.documentKey._id.toString()
    });
    await searchClient.indices.refresh({ index: field });
}

export {
    createTweetIndex,
    createVideoIndex,
    addIndexedData,
    updateIndexedData,
    deleteIndexedData
}
