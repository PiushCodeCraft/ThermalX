const express = require("express");

const router = express.Router();

const { pool } = require("../postgres");


// ============================================================
// ADMIN LOGIN
// ============================================================

router.post("/login", async (req, res) => {

    try {

        const { userId, password } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!userId || !password) {

            return res.status(400).json({
                success: false,
                message: "User ID and password are required"
            });

        }


        // ----------------------------------------------------
        // FIND ADMIN
        // ----------------------------------------------------

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password
            FROM public.admin_users
            WHERE email = $1
            LIMIT 1
            `,
            [userId.trim()]
        );


        // ----------------------------------------------------
        // ADMIN NOT FOUND
        // ----------------------------------------------------

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid user ID or password"
            });

        }


        const admin = result.rows[0];


        // ----------------------------------------------------
        // PASSWORD CHECK
        // ----------------------------------------------------

        if (admin.password !== password) {

            return res.status(401).json({
                success: false,
                message: "Invalid user ID or password"
            });

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful",

            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }

        });

    } catch (error) {

        console.error(
            "❌ Admin login error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

});


module.exports = router;