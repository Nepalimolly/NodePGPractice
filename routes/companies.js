const db = require("../db");
const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT code, name FROM companies`);
    const companies = results.rows;

    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    return res.send({ companies: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { name, description } = req.body;

    let code = slugify(name, { lower: true });

    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = req.params.code;

    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description`,
      [name, description, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ company: result.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const result = await db.query(
      `DELETE FROM companies
           WHERE code=$1
           RETURNING code`,
      [code]
    );

    if (result.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ status: "deleted" });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
