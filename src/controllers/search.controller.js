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
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const search = asyncHandler(async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }
    const result = await searchClient.search({
        index: ['tweets', 'videos'],
        body: {
            query: {
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: query,
                                fields: ['content^2', 'title^3', 'description'],
                                fuzziness: 'AUTO'
                            }
                        },
                        {
                            wildcard: {
                                content: {
                                    value: `*${query}*`,
                                    boost: 1.5
                                }
                            }
                        },
                        {
                            wildcard: {
                                title: {
                                    value: `*${query}*`,
                                    boost: 2
                                }
                            }
                        },
                        {
                            wildcard: {
                                description: {
                                    value: `*${query}*`
                                }
                            }
                        }
                    ],
                    minimum_should_match: 1
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
    if (!result.hits?.hits?.length) {
        throw new ApiError(400, "Search results not found");
    }

    return res.status(200).json(
        new ApiResponse(200, result.hits.hits, "Search results fetched successfully")
    )
})

export {
    search
}