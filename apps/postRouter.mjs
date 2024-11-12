import { Router } from "express";
import validatePostData from "../middlewares/postValidation.mjs";
import { pool } from "../utils/db.mjs";

const postRouter = Router();

postRouter.post("/", validatePostData, async (req, res) => {

    const newPost = req.body;
  
    try {
      const query = `insert into posts (title, image, category_id, description, content, status_id)
      values ($1, $2, $3, $4, $5, $6)`;
  
      const values = [
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.content,
        newPost.status_id,
      ];
  
      await pool.query(query, values);
      return res.status(201).json({ message: "Created post successfully" });
    } catch {
      return res.status(500).json({
        message: `Server could not create post because database connection`,
      });
    }
  });

postRouter.get("/", async (req, res) => {
    try {
      // Access query parameters from request
      const category = req.query.category || null; // Set to null if not provided
      const keyword = req.query.keyword || null;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 6;
  
      // Ensure page and limit are within acceptable ranges
      const safePage = Math.max(1, page);
      const safeLimit = Math.max(1, Math.min(100, limit));
      const offset = (safePage - 1) * safeLimit;
  
      // Build base query
      let query = `
        SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count
        FROM posts
        INNER JOIN categories ON posts.category_id = categories.id
        INNER JOIN statuses ON posts.status_id = statuses.id
      `;
      let values = [];
  
      // Add filters for category and keyword if provided
      if (category && keyword) {
        query += `
          WHERE categories.name ILIKE $1 
          AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
        `;
        values = [`%${category}%`, `%${keyword}%`];
      } else if (category) {
        query += " WHERE categories.name ILIKE $1";
        values = [`%${category}%`];
      } else if (keyword) {
        query += `
          WHERE posts.title ILIKE $1 
          OR posts.description ILIKE $1 
          OR posts.content ILIKE $1
        `;
        values = [`%${keyword}%`];
      }
  
      // Add pagination, ordering by date
      query += ` ORDER BY posts.date DESC LIMIT $${values.length + 1} OFFSET $${
        values.length + 2
      }`;
      values.push(safeLimit, offset);
  
      // Execute the main query to get posts
      const result = await pool.query(query, values);
  
      // Build count query to get total posts matching the filters
      let countQuery = `
        SELECT COUNT(*)
        FROM posts
        INNER JOIN categories ON posts.category_id = categories.id
        INNER JOIN statuses ON posts.status_id = statuses.id
      `;
      let countValues = values.slice(0, -2); // Remove limit and offset from values
  
      // Apply the same filters to the count query
      if (category && keyword) {
        countQuery += `
          WHERE categories.name ILIKE $1 
          AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
        `;
      } else if (category) {
        countQuery += " WHERE categories.name ILIKE $1";
      } else if (keyword) {
        countQuery += `
          WHERE posts.title ILIKE $1 
          OR posts.description ILIKE $1 
          OR posts.content ILIKE $1
        `;
      }
  
      // Execute the count query
      const countResult = await pool.query(countQuery, countValues);
      const totalPosts = parseInt(countResult.rows[0].count, 10);
  
      // Build pagination metadata
      const totalPages = Math.ceil(totalPosts / safeLimit);
      const results = {
        totalPosts,
        totalPages,
        currentPage: safePage,
        limit: safeLimit,
        posts: result.rows,
      };
  
      // Determine if there's a next or previous page
      if (offset + safeLimit < totalPosts) {
        results.nextPage = safePage + 1;
      }
      if (offset > 0) {
        results.previousPage = safePage - 1;
      }
  
      // Return response with post data and pagination metadata
      return res.status(200).json(results);
    } catch (error) {
      console.error(error); // Log error for debugging
      return res.status(500).json({
        message: "Server could not read posts because of a database issue",
      });
    }
  });
  
postRouter.get("/:postId", async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const query = "SELECT * FROM posts WHERE id = $1";
      const result = await pool.query(query, [postId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested post"
        });
      }
  
      return res.status(200).json({
        data: result.rows[0],
      });
    } catch (e) {
      console.error(e);  
      return res.status(500).json({
        message: "Server could not read post because of a database connection issue"
      });
    }
  });
  
postRouter.put("/:postId", validatePostData, async (req, res) => {
    const postId = req.params.postId;  
    const { title, image, category_id, description, content, status_id } = req.body;  
  
    try {
      const checkQuery = "SELECT * FROM posts WHERE id = $1";
      const checkResult = await pool.query(checkQuery, [postId]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested post to update"
        });
      }
  
      const updateQuery = `
        UPDATE posts
        SET title = $1, image = $2, category_id = $3, description = $4, content = $5, status_id = $6
        WHERE id = $7
      `;
      const values = [title, image, category_id, description, content, status_id, postId];
  
      const updateResult = await pool.query(updateQuery, values);
  
      return res.status(200).json({
        message: "Updated post successfully",
      });
  
    } catch (e) {
      console.error(e);  
      return res.status(500).json({
        message: "Server could not update post because of a database connection issue"
      });
    }
  });
  
postRouter.delete("/:postId", async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const checkQuery = "SELECT * FROM posts WHERE id = $1";
      const result = await pool.query(checkQuery, [postId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Server could not find a requested post to delete",
        });
      }
  
      const deleteQuery = "DELETE FROM posts WHERE id = $1";
      await pool.query(deleteQuery, [postId]);
  
      return res.status(200).json({
        message: "Deleted post successfully",
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Server could not delete post because database connection",
      });
    }
  });
  
  export default postRouter;