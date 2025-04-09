const Joi = require('joi');

// Exporting a Joi schema to validate listing objects
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),             // Title must be a non-empty string
        description: Joi.string().required(),       // Description must be a non-empty string
        location: Joi.string().required(),          // Location must be a non-empty string
        country: Joi.string().required(),           // Country must be a non-empty string
        price: Joi.number().required().min(0),      // Price must be a number >= 0
        image: Joi.string().allow("", null)         // Image can be a string, empty string, or null
    }).required()                                    // The 'listing' object itself is required
});
