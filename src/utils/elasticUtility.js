import searchClient from "./elasticClient.js";

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
        console.log("Tweet index created");
    }
    else {
        console.log("Tweet index already exists");
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
        console.log("Video index created");
    } else {
        console.log("Video index already exists");
        return;
    }
}

async function addIndexedData(change, field) {//send this tweet data after creating it in db
    await searchClient.index({
        index: field,
        id: change.documentKey._id.toString(),
        body: {
            content: change.fullDocument.content,
        }
    });
    await searchClient.indices.refresh({ index: field });
}

async function updateIndexedData(change, field) {
    await searchClient.update({
        index: field,
        id: change.documentKey._id.toString(),
        body: {
            doc: change.updateDescription.updatedFields
        }
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
