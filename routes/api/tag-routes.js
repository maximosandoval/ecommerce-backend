const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// find all tags include its associated Product data
router.get("/", async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      attributes: ["id", "tag_name"],
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// find a single tag by its `id` include its associated Product data
router.get("/:id", async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      attributes: ["id", "tag_name"],
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// create a new tag
router.post("/", async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (e) {
    res.status(400).json(e);
  }
});

// update a tag's name by its `id` value
router.put("/:id", async (req, res) => {
  try {
    const exists = await Tag.findByPk(req.params.id);
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!exists) {
      res.status(404).json({ error: "No tag found with that ID." });
      return;
    }
    res.status(200).json(updatedTag);
  } catch (e) {
    res.status(400).json(e);
  }
});

// delete on tag by its `id` value
router.delete("/:id", async (req, res) => {
  try {
    const exists = await Tag.findByPk(req.params.id);
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!exists) {
      res.status(404).json({ error: "No tag found with that ID." });
      return;
    }
    res.status(200).json(deletedTag);
  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = router;
