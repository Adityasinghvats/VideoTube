/**
 * Handles search requests for tweets and videos using Elasticsearch.
 *
 * @async
 * @function search
 * @param {import('express').Request} req - Express request object, expects a query parameter `q` for the search term.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Returns a JSON response with search results or throws an error if no results are found.
 *
 * @throws {ApiError} If no search results are found.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import searchClient from "../utils/elasticClient.js"


const search = asyncHandler(async (req, res) => {
    const query = req.query.q;
    const result = await searchClient.search({
        index: ['tweets', 'videos'],
        body: {
            query: {
                multi_match: {
                    query: query,
                    fields: ['content^2', 'title^3', 'description']
                }
            },
            highlight: {
                fields: {
                    content: {},
                    title: {},
                    description: {}
                }
            }
        }
    })
    if (!result?.length) {
        throw new ApiError(400, "Search results not found");
    }

    return res.status(200).json(
        new ApiResponse(200, result.hits.hits, "Search results fetched successfully")
    )
})

export {
    search
}