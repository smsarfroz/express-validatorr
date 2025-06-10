// controllers/usersController.js
import usersStorage from '../storages/usersStorage.js';
// This just shows the new stuff we're adding to the existing contents
import { body, query, validationResult } from "express-validator";

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const rangeErr = "must be between 18 and 120 inclusive.";

const validateUser = [
    body("firstName").trim()
        .isAlpha().withMessage(`First name ${alphaErr}`)
        .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
    body("lastName").trim()
        .isAlpha().withMessage(`Last name ${alphaErr}`)
        .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
    body("email")
        .notEmpty().withMessage(`email is required`)
        .trim()
        .isEmail().withMessage(`invalid email.`),
    body("age")
        .optional()
        .trim()
        .isInt({ min: 18, max: 120 }).withMessage(`Age ${rangeErr}`),
    body("bio")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage(`must be less than or equal to 200 characters`)
];


const usersController = {
    usersListGet: (req, res) => {
        console.log(usersStorage.getUsers());  
        res.render("index", {
            title: "User list",
            users: usersStorage.getUsers(),
        });
    },

    usersCreateGet: (req, res) => {
        console.log(usersStorage.getUsers()); 
        res.render("createUser", {
            title: "Create user",
        });
    },

    // We can pass an entire array of middleware validations to our controller.
    usersCreatePost: [
        validateUser,
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).render("createUser", {
                    title: "Create user",
                    errors: errors.array(),
                });
            }
            const { firstName, lastName, email, age, bio } = req.body;
            usersStorage.addUser({ firstName, lastName, email, age, bio });
            res.redirect("/");
        }
    ],
    usersUpdateGet: (req, res) => {
        const user = usersStorage.getUser(req.params.id);
        res.render("updateUser", {
            title: "Update user",
            user: user,
        });
    },

    usersUpdatePost: [
        validateUser,
        (req, res) => {
            const user = usersStorage.getUser(req.params.id);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).render("updateUser", {
                    title: "Update user",
                    user: user,
                    errors: errors.array(),
                });
            }
            const { firstName, lastName, email, age, bio } = req.body;
            usersStorage.updateUser(req.params.id, { firstName, lastName, email, age, bio });
            res.redirect("/");
        }
    ],

    // Tell the server to delete a matching user, if any. Otherwise, respond with an error.
    usersDeletePost: (req, res) => {
        usersStorage.deleteUser(req.params.id);
        res.redirect("/");
    },

    usersSearchGet: (req, res) => {
        console.log(req.query, usersStorage.getUsers());
        const allUsers = usersStorage.getUsers();
        const searchQuery = req.query.name;

        const matchedUsers = allUsers.filter(user => {
            return user.firstName.includes(searchQuery);
        });
        // console.log(searchQuery);
        // console.log(allUsers);
        // console.log(matchedUsers);
        res.render("search", {
            users: matchedUsers,
        });
    }

}

export { usersController };
